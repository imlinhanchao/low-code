import { defineComponent, inject, h, type PropType, type VNode } from 'vue'
import type { ComponentConfig, WidgetSchema } from '../types'
import { isPropConfig } from '../types'

/**
 * Evaluate a prop value that may reference the built-in `$model`, `$global` or
 * `$scope` variables.
 *
 * Supported patterns:
 *   '$model'       → the entire form-data object
 *   '$model.key'   → formData[key]  (own property only)
 *   '$global'      → the global shared data object
 *   '$global.key'  → globalData[key]  (own property only)
 *   '$scope'       → the scoped-slot props object passed by the parent slot
 *   '$scope.key'   → scope[key]  (read/write via direct mutation of the reactive container)
 *
 * All other values are returned unchanged.
 */
function evalProp(
  value: unknown,
  formData: Record<string, unknown>,
  globalData: Record<string, unknown>,
  scope: Record<string, unknown>,
): unknown {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  if (trimmed === '$model') return formData
  if (trimmed.startsWith('$model.')) {
    const key = trimmed.slice(7)
    return Object.hasOwn(formData, key) ? formData[key] : undefined
  }
  if (trimmed === '$global') return globalData
  if (trimmed.startsWith('$global.')) {
    const key = trimmed.slice(8)
    return Object.hasOwn(globalData, key) ? globalData[key] : undefined
  }
  if (trimmed === '$scope') return scope
  if (trimmed.startsWith('$scope.')) {
    const key = trimmed.slice(7)
    return Object.hasOwn(scope, key) ? scope[key] : undefined
  }
  return value
}

/**
 * Parse a binding source expression (e.g. '$model', '$scope.row', '$global.section.data')
 * into a base identifier and a path array for nested access.
 *
 *   '$model'           → { base: '$model',  path: [] }
 *   '$model.section'   → { base: '$model',  path: ['section'] }
 *   '$global'          → { base: '$global', path: [] }
 *   '$global.a.b'      → { base: '$global', path: ['a', 'b'] }
 *   '$scope'           → { base: '$scope',  path: [] }
 *   '$scope.row'       → { base: '$scope',  path: ['row'] }
 *
 * Unrecognised sources (i.e. not starting with one of the three known prefixes)
 * fall back to `{ base: '$model', path: [] }`.  Redundant dots (e.g. `$model..key`)
 * are normalised away by the `filter(Boolean)` step.
 */
function parseSource(source: string): { base: '$model' | '$global' | '$scope'; path: string[] } {
  for (const base of ['$model', '$global', '$scope'] as const) {
    if (source === base) return { base, path: [] }
    if (source.startsWith(base + '.')) {
      return { base, path: source.slice(base.length + 1).split('.').filter(Boolean) }
    }
  }
  // Unrecognised source — fall back to $model with no sub-path.
  return { base: '$model', path: [] }
}

/**
 * Navigate `path` inside `root` and return the nested object that acts as
 * the key-value container for the bound field.  Returns `{}` when any
 * intermediate segment is missing or not a plain object / array so that
 * reads yield `undefined` gracefully.
 */
function getAtPath(root: Record<string, unknown>, path: string[]): Record<string, unknown> {
  let cur: unknown = root
  for (const k of path) {
    if (cur == null || typeof cur !== 'object') return {}
    cur = (cur as Record<string, unknown>)[k]
  }
  // Accept both plain objects and arrays as containers (arrays support numeric field names).
  return (cur != null && typeof cur === 'object' ? cur : {}) as Record<string, unknown>
}

/**
 * Produce a *shallow-cloned* copy of `root` with the value at
 * `[...path][fieldName]` set to `value`.  All intermediate objects are
 * shallow-cloned to keep the update immutable at each level.
 */
function setAtPath(
  root: Record<string, unknown>,
  path: string[],
  fieldName: string,
  value: unknown,
): Record<string, unknown> {
  if (path.length === 0) {
    return { ...root, [fieldName]: value }
  }
  const [head, ...tail] = path
  const child =
    typeof root[head] === 'object' && root[head] !== null
      ? (root[head] as Record<string, unknown>)
      : {}
  return { ...root, [head]: setAtPath(child, tail, fieldName, value) }
}

/**
 * Recursive render-function component.
 * Renders a single WidgetSchema into live Vue nodes, passing slot children
 * as slot functions to `h()`.  Self-reference enables unlimited nesting.
 */
const LcWidgetNode = defineComponent({
  name: 'LcWidgetNode',

  props: {
    widget: {
      type: Object as PropType<WidgetSchema>,
      required: true,
    },
    /**
     * Scoped-slot props passed by the parent slot.
     * Accessible as `$scope` in widget prop expressions, event handlers,
     * and Function-typed props.
     */
    scope: {
      type: Object as PropType<Record<string, unknown>>,
      default: () => ({}),
    },
  },

  setup(props) {
    const getConfig = inject<(name: string) => ComponentConfig | undefined>('lc:getConfig')!
    const getFormData =
      inject<() => Record<string, unknown>>('lc:getFormData')!
    const updateModel =
      inject<(fieldName: string, val: unknown) => void>('lc:updateModel')!
    const widgetRefs = inject<Map<string, unknown>>('lc:widgetRefs')
    const getRefs = inject<(id: string) => unknown>('lc:getRefs') ?? ((_id: string) => undefined)
    const getGlobalData =
      inject<() => Record<string, unknown>>('lc:getGlobalData') ?? (() => ({}))
    const updateGlobal =
      inject<(fieldName: string, val: unknown) => void>('lc:updateGlobal') ??
      ((fieldName: string) => {
        if (import.meta.env?.DEV) {
          console.warn(`[lc-renderer] updateGlobal called for "${fieldName}" but lc:updateGlobal is not provided.`)
        }
      })

    function buildProps(config: ComponentConfig): Record<string, unknown> {
      const formData = getFormData()
      const globalData = getGlobalData()
      const scope = props.scope as Record<string, unknown>

      // Start with static props, evaluating any $model/$global/$scope expressions.
      // Exclude the special 'hidden' prop — it's handled by LcWidgetNode itself
      // and must not be forwarded to the actual component.
      const result: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(props.widget.props)) {
        if (key === 'hidden') continue
        result[key] = evalProp(value, formData, globalData, scope)
      }

      for (const key of Object.keys(props.widget.models)) {
        // Use the per-model field name (or fall back to the model key itself)
        // to read from / write to the configured data source.
        const fieldName = props.widget.fields?.[key] ?? key
        const rawSource = props.widget.sources?.[key] ?? '$model'
        const { base, path } = parseSource(rawSource)
        const eventKey =
          key === 'modelValue' ? 'onUpdate:modelValue' : `onUpdate:${key}`
        const capturedFieldName = fieldName
        const capturedPath = path

        if (base === '$global') {
          const container = getAtPath(globalData, path)
          result[key] = container[fieldName] ?? props.widget.models[key]
          result[eventKey] = (v: unknown) => {
            if (capturedPath.length === 0) {
              updateGlobal(capturedFieldName, v)
            } else {
              // Update the nested container; only the top-level key needs to be
              // written back via updateGlobal since it owns the full subtree.
              const fresh = getGlobalData()
              const newRoot = setAtPath(fresh, capturedPath, capturedFieldName, v)
              updateGlobal(capturedPath[0], newRoot[capturedPath[0]])
            }
          }
        } else if (base === '$scope') {
          const container = getAtPath(scope as Record<string, unknown>, path)
          result[key] = container[fieldName] ?? props.widget.models[key]
          if (capturedPath.length > 0) {
            // Nested scope access (e.g. $scope.row) — the container is a reactive
            // reference to the actual row / data object owned by the parent layout.
            // Direct mutation propagates back through Vue's deep reactivity.
            result[eventKey] = (v: unknown) => {
              container[capturedFieldName] = v
            }
          } else {
            // $scope itself is read-only — the scope object is not owned by this widget.
            const capturedKey = key
            result[eventKey] = (_v: unknown) => {
              if (import.meta.env?.DEV) {
                console.warn(`[lc-renderer] Model "${capturedKey}" is bound to $scope (read-only). Update ignored.`)
              }
            }
          }
        } else {
          // default: '$model' (with optional sub-path)
          const container = getAtPath(formData, path)
          result[key] = container[fieldName] ?? props.widget.models[key]
          result[eventKey] = (v: unknown) => {
            if (capturedPath.length === 0) {
              updateModel(capturedFieldName, v)
            } else {
              const fresh = getFormData()
              const newRoot = setAtPath(fresh, capturedPath, capturedFieldName, v)
              updateModel(capturedPath[0], newRoot[capturedPath[0]])
            }
          }
        }
      }

      // Bind user-authored event handlers from widget.events.
      // NOTE: new Function() is intentional here — this is a developer-facing
      // low-code builder where the user is expected to write JavaScript handlers.
      // The same pattern is used by vform3 and other low-code platforms.
      for (const [eventName, code] of Object.entries(props.widget.events ?? {})) {
        if (!code.trim()) continue
        const handlerKey = `on${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}`
        const paramNames = config.events?.[eventName]?.map((p) => p.name) ?? []
        try {
          // Compile handler with $model, $global, $getRefs and $scope injected as named
          // parameters. $model, $global and $scope always reflect their current values at
          // the time the event fires rather than when the handler was compiled.
          // $getRefs allows handlers to access component instances by widget id.
          // eslint-disable-next-line no-new-func
          const compiled = new Function('$model', '$global', '$getRefs', '$scope', ...paramNames, code)
          result[handlerKey] = (...args: unknown[]) => compiled(getFormData(), getGlobalData(), getRefs, scope, ...args)
        } catch (err) {
          if (import.meta.env?.DEV) {
            console.warn(`[lc-renderer] Invalid handler code for event "${eventName}":`, err)
          }
        }
      }

      // Compile Function-typed props (stored as code strings) into real functions.
      for (const [key, propCfg] of Object.entries(config.props ?? {})) {
        if (!isPropConfig(propCfg) || propCfg.type !== Function) continue
        const code = result[key]
        if (typeof code === 'string' && code.trim()) {
          const paramNames = propCfg.params?.map((p) => p.name) ?? []
          try {
            // Inject $model, $global, $getRefs and $scope as named parameters so
            // Function-typed props (e.g. validator callbacks) can reference
            // form data, global data, component refs and scoped-slot data.
            // eslint-disable-next-line no-new-func
            const compiled = new Function('$model', '$global', '$getRefs', '$scope', ...paramNames, code)
            result[key] = (...args: unknown[]) => compiled(getFormData(), getGlobalData(), getRefs, scope, ...args)
          } catch (err) {
            if (import.meta.env?.DEV) {
              console.warn(`[lc-renderer] Invalid function code for prop "${key}":`, err)
            }
            delete result[key]
          }
        } else {
          delete result[key]
        }
      }

      return result
    }

    return () => {
      const config = getConfig(props.widget.name)
      if (!config) {
        return h('div', { class: 'lc-missing-widget' }, `?? ${props.widget.name}`)
      }

      // If the widget is marked as hidden, skip rendering entirely.
      if (props.widget.props.hidden === true) return null

      const builtProps = buildProps(config)

      const isReadonly = props.widget.props.readonly === true && props.widget.category === 'widget'

      // If readonly is true, just render the value (from modelValue or first model)
      if (isReadonly) {
        let display: any
        if (config.format) {
          try {
            display = config.format(builtProps, getFormData())
          } catch (err) {
            display = `[Error in format: ${err}]`
          }
        } else {
          display = builtProps.modelValue ?? Object.values(props.widget.models)[0]
        }
        return h('span', { class: 'lc-readonly-value' }, String(display ?? ''))
      }

      // Build slot functions from stored children.
      // Each slot function receives the scoped-slot props emitted by the parent
      // component and forwards them to child LcWidgetNode instances as `scope`,
      // making them available via the `$scope` variable in prop expressions.
      const slotFns: Record<string, (slotProps?: Record<string, unknown>) => VNode | VNode[] | string> = {}

      // Identify virtual slots (e.g. ElOption inside ElSelect) — their children
      // must be rendered as raw component vnodes so Vue's provide/inject chain
      // between the parent (ElSelect) and child (ElOption) remains intact.
      // Wrapping them in LcWidgetNode would break the chain.
      const effectiveSlots = config.computeSlots
        ? config.computeSlots(props.widget.props)
        : (config.slots ?? [])
      const virtualSlotNames = new Set(
        effectiveSlots.filter((s) => s.virtual).map((s) => s.name),
      )

      for (const [slotName, children] of Object.entries(props.widget.slots)) {
        if (children.length === 0) continue
        const capturedChildren = children
        if (virtualSlotNames.has(slotName)) {
          // Virtual slot: render children directly as real component vnodes
          slotFns[slotName] = () =>
            capturedChildren
              .map((c) => {
                const childCfg = getConfig(c.name)
                return childCfg
                  ? h(childCfg.component as Parameters<typeof h>[0], { ...c.props, ...c.models })
                  : null
              })
              .filter(Boolean) as VNode[]
        } else {
          slotFns[slotName] = (slotProps: Record<string, unknown> = {}) =>
            capturedChildren.map((c) => h(LcWidgetNode, { widget: c, key: c.id, scope: slotProps }))
        }
      }

      // Fallback: simple text in the default slot
      if (!slotFns['default'] && props.widget.slotContent) {
        const text = props.widget.slotContent
        slotFns['default'] = () => text
      }

      // Build the component props, then add a callback ref that keeps the
      // widgetRefs registry in sync with the component's mounted/unmounted state.
      const widgetId = props.widget.id
      if (widgetRefs) {
        builtProps.ref = (el: unknown) => {
          if (el != null) {
            widgetRefs.set(widgetId, el)
          } else {
            widgetRefs.delete(widgetId)
          }
        }
      }

      return h(
        config.component as Parameters<typeof h>[0],
        builtProps,
        Object.keys(slotFns).length > 0 ? slotFns : undefined,
      )
    }
  },
})

export default LcWidgetNode

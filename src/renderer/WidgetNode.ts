import { defineComponent, inject, h, type PropType, type VNode } from 'vue'
import type { ComponentConfig, WidgetSchema } from '../types'
import { isPropConfig } from '../types'

/**
 * Evaluate a prop value that may reference the built-in `$model` or `$scope`
 * variables.
 *
 * Supported patterns:
 *   '$model'       → the entire form-data object
 *   '$model.key'   → formData[key]  (own property only)
 *   '$scope'       → the scoped-slot props object passed by the parent slot
 *   '$scope.key'   → scope[key]  (own property only)
 *
 * All other values are returned unchanged.
 */
function evalProp(
  value: unknown,
  formData: Record<string, unknown>,
  scope: Record<string, unknown>,
): unknown {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  if (trimmed === '$model') return formData
  if (trimmed.startsWith('$model.')) {
    const key = trimmed.slice(7)
    return Object.hasOwn(formData, key) ? formData[key] : undefined
  }
  if (trimmed === '$scope') return scope
  if (trimmed.startsWith('$scope.')) {
    const key = trimmed.slice(7)
    return Object.hasOwn(scope, key) ? scope[key] : undefined
  }
  return value
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

    function buildProps(config: ComponentConfig): Record<string, unknown> {
      const formData = getFormData()
      const scope = props.scope as Record<string, unknown>

      // Start with static props, evaluating any $model/$scope expressions.
      // Exclude the special 'hidden' prop — it's handled by LcWidgetNode itself
      // and must not be forwarded to the actual component.
      const result: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(props.widget.props)) {
        if (key === 'hidden') continue
        result[key] = evalProp(value, formData, scope)
      }

      for (const key of Object.keys(props.widget.models)) {
        // Use the per-model field name (or fall back to the model key itself)
        // to read from / write to the flat form data object.
        const fieldName = props.widget.fields?.[key] ?? key
        result[key] = formData[fieldName] ?? props.widget.models[key]

        const eventKey =
          key === 'modelValue' ? 'onUpdate:modelValue' : `onUpdate:${key}`
        const capturedFieldName = fieldName
        result[eventKey] = (v: unknown) => updateModel(capturedFieldName, v)
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
          // Compile handler with $model, $getRefs and $scope injected as named
          // parameters. $model and $scope always reflect their current values at
          // the time the event fires rather than when the handler was compiled.
          // $getRefs allows handlers to access component instances by widget id.
          // eslint-disable-next-line no-new-func
          const compiled = new Function('$model', '$getRefs', '$scope', ...paramNames, code)
          result[handlerKey] = (...args: unknown[]) => compiled(getFormData(), getRefs, scope, ...args)
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
            // Inject $model, $getRefs and $scope as named parameters so
            // Function-typed props (e.g. validator callbacks) can reference
            // form data, component refs and scoped-slot data.
            // eslint-disable-next-line no-new-func
            const compiled = new Function('$model', '$getRefs', '$scope', ...paramNames, code)
            result[key] = (...args: unknown[]) => compiled(getFormData(), getRefs, scope, ...args)
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
      const builtProps = buildProps(config)
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

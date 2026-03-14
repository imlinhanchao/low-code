import { defineComponent, inject, h, type PropType, type VNode } from 'vue'
import type { ComponentConfig, WidgetSchema } from '../types'
import { isPropConfig } from '../types'

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
  },

  setup(props) {
    const getConfig = inject<(name: string) => ComponentConfig | undefined>('lc:getConfig')!
    const getFormData =
      inject<() => Record<string, Record<string, unknown>>>('lc:getFormData')!
    const updateModel =
      inject<(id: string, key: string, val: unknown) => void>('lc:updateModel')!

    function buildProps(config: ComponentConfig): Record<string, unknown> {
      const result: Record<string, unknown> = { ...props.widget.props }
      const formData = getFormData()
      // Use field name (if set) as the form data key so consumers get
      // { fieldName: { modelValue: ... } } instead of { randomId: { ... } }
      const dataKey = props.widget.field ?? props.widget.id

      for (const key of Object.keys(props.widget.models)) {
        result[key] = formData[dataKey]?.[key] ?? props.widget.models[key]

        const eventKey =
          key === 'modelValue' ? 'onUpdate:modelValue' : `onUpdate:${key}`
        const capturedKey = key
        result[eventKey] = (v: unknown) => updateModel(dataKey, capturedKey, v)
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
          // eslint-disable-next-line no-new-func
          result[handlerKey] = new Function(...paramNames, code)
        } catch (err) {
          if (import.meta.env.DEV) {
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
            // eslint-disable-next-line no-new-func
            result[key] = new Function(...paramNames, code)
          } catch (err) {
            if (import.meta.env.DEV) {
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

      // Build slot functions from stored children
      const slotFns: Record<string, () => VNode | VNode[] | string> = {}

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
          slotFns[slotName] = () =>
            capturedChildren.map((c) => h(LcWidgetNode, { widget: c, key: c.id }))
        }
      }

      // Fallback: simple text in the default slot
      if (!slotFns['default'] && props.widget.slotContent) {
        const text = props.widget.slotContent
        slotFns['default'] = () => text
      }

      return h(
        config.component as Parameters<typeof h>[0],
        buildProps(config),
        Object.keys(slotFns).length > 0 ? slotFns : undefined,
      )
    }
  },
})

export default LcWidgetNode

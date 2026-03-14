import {
  defineComponent,
  inject,
  h,
  ref,
  computed,
  type Ref,
  type PropType,
  type VNode,
} from 'vue'
import type { ComponentConfig, WidgetSchema, SlotConfig } from '../../types'
import { draggingConfig } from '../useDragState'

// ── Canvas Slot Zone ──────────────────────────────────────────────────────────
/**
 * Renders a named slot's children as nested CanvasWidgetNodes, plus provides
 * the drag-and-drop drop target for that slot.
 *
 * Appearance:
 *  - layout slot (isLayout=true): block element, min-height so it's always
 *    droppable; looks like the actual container cell (WYSIWYG)
 *  - widget slot with content: transparent wrapper — content appears in the
 *    correct visual position inside the host component (WYSIWYG)
 *  - widget slot (empty): compact chip-sized indicator shown inline
 */
const CanvasSlotZone = defineComponent({
  name: 'LcCanvasSlotZone',

  props: {
    parentId:  { type: String,                          required: true },
    slotName:  { type: String,                          required: true },
    slotLabel: { type: String,                          required: true },
    children:  { type: Array as PropType<WidgetSchema[]>, required: true },
    isLayout:  { type: Boolean, default: false },
    /**
     * Whitelist of component names that may be dropped into this slot.
     * An empty array (default) means any component is accepted.
     */
    accept:    { type: Array as PropType<string[]>, default: () => [] },
  },

  setup(props) {
    const addWidget =
      inject<(pid: string | null, sn: string | null, cfg: ComponentConfig) => void>(
        'lc:addWidget',
      )!

    const isOver = ref(false)
    const isDragging = computed(() => draggingConfig.value !== null)

    /** True when a drag is active but the dragged component is not allowed here */
    const isBlocked = computed(() =>
      isDragging.value &&
      props.accept.length > 0 &&
      draggingConfig.value !== null &&
      !props.accept.includes(draggingConfig.value.name),
    )

    function onDragOver(e: DragEvent) {
      if (!draggingConfig.value) return
      e.stopPropagation()
      // Reset hover state first; re-enable below only if the drop is accepted
      isOver.value = false
      if (isBlocked.value) return
      e.preventDefault()
      isOver.value = true
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
    }

    function onDragLeave(e: DragEvent) {
      const el = e.currentTarget as Element | null
      if (!el || !el.contains(e.relatedTarget as Node)) isOver.value = false
    }

    function onDrop(e: DragEvent) {
      e.preventDefault()
      e.stopPropagation()
      isOver.value = false
      if (!draggingConfig.value) return
      // Silently ignore drops of components not in the accept list
      if (props.accept.length > 0 && !props.accept.includes(draggingConfig.value.name)) {
        draggingConfig.value = null
        return
      }
      addWidget(props.parentId, props.slotName, draggingConfig.value)
      draggingConfig.value = null
    }

    return () => {
      const isEmpty = props.children.length === 0

      // Recursively render child widgets as CanvasWidgetNodes
      const childNodes = props.children.map((c) =>
        h(LcCanvasWidgetNode, { key: c.id, widget: c }),
      )

      const classes: Record<string, boolean> = {
        'lc-canvas-slot': true,
        'lc-canvas-slot--layout': props.isLayout,
        'lc-canvas-slot--widget': !props.isLayout,
        'lc-canvas-slot--empty': isEmpty,
        'lc-canvas-slot--over': isOver.value,
        'lc-canvas-slot--dragging': isDragging.value,
        'lc-canvas-slot--blocked': isBlocked.value,
      }

      return h(
        'div',
        {
          class: classes,
          onDragover: onDragOver,
          onDragleave: onDragLeave,
          onDrop,
        },
        [
          ...childNodes,
          // Empty-slot placeholder — always visible for layout slots so users
          // can see and drop into them; for widget slots only shown while
          // dragging (they appear as chip-sized targets inside the component)
          isEmpty
            ? h('span', { class: 'lc-canvas-slot__hint' }, props.slotLabel)
            : null,
        ],
      )
    }
  },
})

// ── Canvas Widget Node ────────────────────────────────────────────────────────
/**
 * WYSIWYG canvas rendering of a single widget.
 *
 * Renders `h(config.component, props, slotFunctions)` so the canvas looks
 * IDENTICAL to the live preview.  Each named slot gets a `CanvasSlotZone`
 * that accepts drops; child widgets are rendered recursively inside the
 * correct slot positions.
 *
 * For regular (non-layout) widgets, empty slots are NOT embedded inside the
 * component by default — they appear as a compact panel below the component
 * only while the user is dragging (so the component itself looks clean).
 * Once a slot has children, those children render inside the component's
 * actual slot position (full WYSIWYG).
 */
export const LcCanvasWidgetNode = defineComponent({
  name: 'LcCanvasWidgetNode',

  props: {
    widget: { type: Object as PropType<WidgetSchema>, required: true },
  },

  setup(props) {
    const allConfigs   = inject<Ref<ComponentConfig[]>>('lc:allConfigs')!
    const selectWidget = inject<(id: string | null) => void>('lc:selectWidget')!
    const removeWidget = inject<(id: string) => void>('lc:removeWidget')!
    const selectedId   = inject<Ref<string | null>>('lc:selectedId')!

    return () => {
      const config = allConfigs.value.find((c) => c.name === props.widget.name)
      if (!config) {
        return h('div', { class: 'lc-canvas-node lc-canvas-node--missing' }, `?? ${props.widget.name}`)
      }

      const isSelected = selectedId.value === props.widget.id
      const isLayout   = props.widget.category === 'layout'
      const isDragging = draggingConfig.value !== null

      const effectiveSlots: SlotConfig[] = config.computeSlots
        ? config.computeSlots(props.widget.props)
        : (config.slots ?? [])

      // ── Build slot functions ────────────────────────────────────────────
      const slotFns: Record<string, () => VNode | VNode[] | string> = {}

      // Slots that already have children — always embed inline (WYSIWYG)
      const populatedSlots = effectiveSlots.filter(
        (s) => (props.widget.slots[s.name] ?? []).length > 0,
      )
      // Empty slots on layout components — always embed (they ARE the visual cells)
      const layoutEmptySlots = isLayout
        ? effectiveSlots.filter((s) => !(props.widget.slots[s.name] ?? []).length)
        : []
      // Empty slots on widget components — embed only while dragging (so the
      // component looks clean at rest, but shows targets when user drags)
      const widgetEmptySlots = !isLayout
        ? effectiveSlots.filter((s) => !(props.widget.slots[s.name] ?? []).length)
        : []

      for (const slotCfg of [...populatedSlots, ...layoutEmptySlots]) {
        const sn = slotCfg.name
        const label = slotCfg.label ?? sn
        const children = props.widget.slots[sn] ?? []
        const accept = slotCfg.components?.map((c) => c.name) ?? []
        slotFns[sn] = () =>
          h(CanvasSlotZone, {
            parentId: props.widget.id,
            slotName: sn,
            slotLabel: label,
            children,
            isLayout,
            accept,
          })
      }

      // While dragging, also embed empty widget slots so the user can drop in
      if (isDragging) {
        for (const slotCfg of widgetEmptySlots) {
          // Skip slots that were already handled (populated slots above)
          if (slotFns[slotCfg.name]) continue
          const sn = slotCfg.name
          const label = slotCfg.label ?? sn
          const accept = slotCfg.components?.map((c) => c.name) ?? []
          slotFns[sn] = () =>
            h(CanvasSlotZone, {
              parentId: props.widget.id,
              slotName: sn,
              slotLabel: label,
              children: [],
              isLayout: false,
              accept,
            })
        }
      }

      // Fallback: simple text content for leaf widgets (e.g. button label)
      // Only used when no named slots are being shown
      if (Object.keys(slotFns).length === 0 && props.widget.slotContent !== undefined) {
        slotFns['default'] = () => props.widget.slotContent!
      }

      // Component props (no pointer-events suppression — we want real WYSIWYG)
      const compProps: Record<string, unknown> = {
        ...props.widget.props,
        ...props.widget.models,
      }

      // ── The actual component (WYSIWYG rendering) ────────────────────────
      const componentVNode = h(
        config.component as Parameters<typeof h>[0],
        compProps,
        Object.keys(slotFns).length > 0 ? slotFns : undefined,
      )

      // ── Empty-slot panel for regular widgets (shown when selected or dragging) ──
      // These appear as compact labeled chips below the component so the user
      // knows which slots are available, without cluttering the component itself.
      const showEmptyPanel = !isLayout && widgetEmptySlots.length > 0 && (isSelected || isDragging)
      const emptySlotPanel = showEmptyPanel
        ? h(
            'div',
            { class: 'lc-canvas-node__slots-panel' },
            widgetEmptySlots.map((s) =>
              h(CanvasSlotZone, {
                key: `empty-${s.name}`,
                parentId: props.widget.id,
                slotName: s.name,
                slotLabel: s.label ?? s.name,
                children: [],
                isLayout: false,
                accept: s.components?.map((c) => c.name) ?? [],
              }),
            ),
          )
        : null

      // ── Floating action bar (shown only on hover / when selected) ──────
      // Positioned absolute at the top-right corner; does NOT affect layout.
      const actionsBar = h('div', { class: 'lc-node-actions' }, [
        // Component-name label so the user always knows what widget they are on
        h('span', { class: 'lc-node-actions__name' }, config.name),
        // Drag handle — visual affordance for future drag-to-reorder
        h('span', { class: 'lc-node-actions__btn lc-node-actions__btn--drag', title: '拖拽' }, '⠿'),
        // Delete button
        h(
          'button',
          {
            class: 'lc-node-actions__btn lc-node-actions__btn--delete',
            title: '删除',
            onClick: (e: MouseEvent) => {
              e.stopPropagation()
              removeWidget(props.widget.id)
            },
          },
          '✕',
        ),
      ])

      // ── Selection wrapper ───────────────────────────────────────────────
      return h(
        'div',
        {
          class: {
            'lc-canvas-node': true,
            'lc-canvas-node--selected': isSelected,
            'lc-canvas-node--layout': isLayout,
          },
          onClick: (e: MouseEvent) => {
            e.stopPropagation()
            selectWidget(props.widget.id)
          },
        },
        [
          // Floating action bar — overlays the component, never pushes content down
          actionsBar,
          componentVNode,
          emptySlotPanel,
        ],
      )
    }
  },
})

export default LcCanvasWidgetNode

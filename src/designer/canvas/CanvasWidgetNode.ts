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
import { draggingConfig, draggingWidget } from '../useDragState'
import { hoveredId } from './useCanvasOverlay'

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
export const CanvasSlotZone = defineComponent({
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
    const moveWidget =
      inject<(id: string, parentId: string | null, slotName: string | null) => void>(
        'lc:moveWidget',
      )

    const isOver = ref(false)

    /** Name of whatever is currently being dragged (palette config or placed widget) */
    const currentDragName = computed<string | null>(() => {
      if (draggingConfig.value) return draggingConfig.value.name
      if (draggingWidget.value) return draggingWidget.value.name
      return null
    })

    const isDragging = computed(() => currentDragName.value !== null)

    /** True when a drag is active but the dragged component is not allowed here */
    const isBlocked = computed(() =>
      isDragging.value &&
      props.accept.length > 0 &&
      currentDragName.value !== null &&
      !props.accept.includes(currentDragName.value),
    )

    function onDragOver(e: DragEvent) {
      if (!currentDragName.value) return
      e.stopPropagation()
      // Reset hover state first; re-enable below only if the drop is accepted
      isOver.value = false
      if (isBlocked.value) return
      e.preventDefault()
      isOver.value = true
      if (e.dataTransfer) e.dataTransfer.dropEffect = draggingWidget.value ? 'move' : 'copy'
    }

    function onDragLeave(e: DragEvent) {
      const el = e.currentTarget as Element | null
      if (!el || !el.contains(e.relatedTarget as Node)) isOver.value = false
    }

    function onDrop(e: DragEvent) {
      e.preventDefault()
      e.stopPropagation()
      isOver.value = false
      if (draggingWidget.value) {
        if (props.accept.length > 0 && !props.accept.includes(draggingWidget.value.name)) {
          draggingWidget.value = null
          return
        }
        moveWidget?.(draggingWidget.value.id, props.parentId, props.slotName)
        draggingWidget.value = null
      } else if (draggingConfig.value) {
        if (props.accept.length > 0 && !props.accept.includes(draggingConfig.value.name)) {
          draggingConfig.value = null
          return
        }
        addWidget(props.parentId, props.slotName, draggingConfig.value)
        draggingConfig.value = null
      }
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
 * IDENTICAL to the live preview.
 *
 * Slot management (drag-drop, reorder) is handled entirely via:
 *   1. The CanvasOverlay slots panel (rendered below the selected component).
 *   2. The PropertiesPanel sidebar slot section.
 *
 * No CanvasSlotZone is ever rendered inside the component itself.
 * - Populated slots render their children as nested CanvasWidgetNodes (WYSIWYG).
 * - Empty slots on layout components show a static placeholder div.
 * - Empty slots on widget components render nothing.
 *
 * For **virtual** slots (e.g. ElOption inside ElSelect), children are rendered
 * as selectable chip items in the panel rather than embedded in the component's
 * slot area (where they would be invisible and unclickable).
 */
export const LcCanvasWidgetNode = defineComponent({
  name: 'LcCanvasWidgetNode',

  props: {
    widget: { type: Object as PropType<WidgetSchema>, required: true },
    /**
     * When true, renders as a compact clickable chip instead of mounting the
     * real component.  Used for virtual-slot children shown in the panel — this
     * avoids `inject` errors from components like ElOption that require a
     * specific parent (ElSelect) to be in the component tree.
     */
    virtual: { type: Boolean, default: false },
    /** Parent widget id — supplied when virtual=true to enable reordering */
    slotParentId: { type: String, default: null },
    /** Slot name within the parent — supplied when virtual=true */
    slotName: { type: String, default: null },
    /** Zero-based position of this child within its slot — supplied when virtual=true */
    slotIndex: { type: Number, default: -1 },
    /** Total number of children in the slot — supplied when virtual=true */
    slotTotal: { type: Number, default: 0 },
  },

  setup(props) {
    const allConfigs   = inject<Ref<ComponentConfig[]>>('lc:allConfigs')!
    const selectWidget = inject<(id: string | null) => void>('lc:selectWidget')!
    const removeWidget = inject<(id: string) => void>('lc:removeWidget')!
    const selectedId   = inject<Ref<string | null>>('lc:selectedId')!
    const reorderSlotChildren = inject<
      (parentId: string, slotName: string, from: number, to: number) => void
    >('lc:reorderSlotChildren')

    return () => {
      const config = allConfigs.value.find((c) => c.name === props.widget.name)
      if (!config) {
        return h('div', { class: 'lc-canvas-node lc-canvas-node--missing' }, `?? ${props.widget.name}`)
      }

      const isSelected = selectedId.value === props.widget.id
      const isLayout   = props.widget.category === 'layout'

      // ── Virtual chip rendering ────────────────────────────────────────────
      // Used for virtual-slot children (e.g. ElOption) shown in the panel.
      // Renders a simple named chip without mounting the actual component —
      // this avoids inject errors from components that require a specific parent.
      if (props.virtual) {
        const canMoveUp   = props.slotIndex > 0
        const canMoveDown = props.slotIndex < props.slotTotal - 1

        const virtualActionsBar = h('div', { class: 'lc-node-actions' }, [
          h('span', { class: 'lc-node-actions__name' }, config.name),
          // Move-up button — hidden when already first
          canMoveUp
            ? h(
                'button',
                {
                  class: 'lc-node-actions__btn',
                  title: '上移',
                  onClick: (e: MouseEvent) => {
                    e.stopPropagation()
                    reorderSlotChildren?.(
                      props.slotParentId!,
                      props.slotName!,
                      props.slotIndex,
                      props.slotIndex - 1,
                    )
                  },
                },
                '↑',
              )
            : null,
          // Move-down button — hidden when already last
          canMoveDown
            ? h(
                'button',
                {
                  class: 'lc-node-actions__btn',
                  title: '下移',
                  onClick: (e: MouseEvent) => {
                    e.stopPropagation()
                    reorderSlotChildren?.(
                      props.slotParentId!,
                      props.slotName!,
                      props.slotIndex,
                      props.slotIndex + 1,
                    )
                  },
                },
                '↓',
              )
            : null,
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

        return h(
          'div',
          {
            'data-lc-id': props.widget.id,
            class: {
              'lc-canvas-node': true,
              'lc-canvas-node--selected': isSelected,
              'lc-canvas-node--virtual-item': true,
            },
            onClick: (e: MouseEvent) => {
              e.stopPropagation()
              selectWidget(props.widget.id)
            },
            onMouseover: (e: MouseEvent) => {
              e.stopPropagation()
              hoveredId.value = props.widget.id
            },
            onMouseleave: () => {
              if (hoveredId.value === props.widget.id) hoveredId.value = null
            },
          },
          [virtualActionsBar, h('span', { class: 'lc-canvas-node__virtual-label' }, config.name)],
        )
      }

      const effectiveSlots: SlotConfig[] = config.computeSlots
        ? config.computeSlots(props.widget.props)
        : (config.slots ?? [])

      // ── Split slots: virtual vs. normal ──────────────────────────────────
      // Virtual slots (e.g. ElSelect's option slot) have children that don't
      // render visibly in position — they are shown in the panel instead.
      const virtualSlots = effectiveSlots.filter((s) => s.virtual)
      const normalSlots  = effectiveSlots.filter((s) => !s.virtual)

      // ── Build slot functions ────────────────────────────────────────────
      // Slot management (drag-drop, reorder) is handled entirely via the overlay
      // slots panel (below the component) and the properties sidebar — NOT inline.
      const slotFns: Record<string, () => VNode | VNode[] | string> = {}

      for (const slotCfg of normalSlots) {
        const sn = slotCfg.name
        const children = props.widget.slots[sn] ?? []

        if (children.length > 0) {
          // Render children WYSIWYG, without an interactive drop zone wrapper.
          // Dropping is done via the overlay panel, not inside the component.
          const childNodes = children.map((c) =>
            h(LcCanvasWidgetNode, { key: c.id, widget: c }),
          )
          slotFns[sn] = () => childNodes
        } else if (isLayout && !slotCfg.noPlaceholder) {
          // For layout components (grid/card/tabs), show a static visual
          // placeholder so the empty slot cells remain visible. No drop events.
          // Slots marked noPlaceholder (e.g. label, error) skip this so the
          // component's own rendering (e.g. the label prop) is not overridden.
          slotFns[sn] = () =>
            h('div', { class: 'lc-canvas-slot-placeholder' }, slotCfg.label ?? sn)
        }
        // For non-layout widgets with empty slots: render nothing inline.
        // Users add slot children via the overlay panel or the properties sidebar.
      }

      // Virtual populated slots — pass raw component vnodes for parent registration
      // (e.g. ElOption must be in ElSelect's slot to register, but is not wrapped in
      // a canvas node here — the panel handles the designer representation instead).
      for (const slotCfg of virtualSlots) {
        const sn = slotCfg.name
        const children = props.widget.slots[sn] ?? []
        if (children.length > 0) {
          slotFns[sn] = () =>
            children
              .map((c) => {
                const childCfg = allConfigs.value.find((cc) => cc.name === c.name)
                return childCfg
                  ? h(childCfg.component as Parameters<typeof h>[0], { ...c.props, ...c.models })
                  : null
              })
              .filter(Boolean) as VNode[]
        }
      }

      // Fallback: simple text content for leaf widgets (e.g. button label)
      if (Object.keys(slotFns).length === 0 && props.widget.slotContent !== undefined) {
        slotFns['default'] = () => props.widget.slotContent!
      }

      // Component props (no pointer-events suppression — we want real WYSIWYG)
      // In the canvas, $model evaluates to {} since no form data is available.
      // A single empty object is shared across all $model references for consistency.
      const canvasModel: Record<string, unknown> = {}
      const compProps: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(props.widget.props)) {
        if (typeof value === 'string') {
          const trimmed = value.trim()
          if (trimmed === '$model' || trimmed.startsWith('$model.')) {
            compProps[key] = canvasModel
            continue
          }
        }
        compProps[key] = value
      }
      Object.assign(compProps, props.widget.models)

      // ── The actual component (WYSIWYG rendering) ────────────────────────
      const componentVNode = h(
        config.component as Parameters<typeof h>[0],
        compProps,
        Object.keys(slotFns).length > 0 ? slotFns : undefined,
      )

      // ── Selection wrapper ───────────────────────────────────────────────
      // The shell is display:contents (via CSS) — it generates no box and has
      // zero layout impact.  data-lc-id lets the overlay locate the component;
      // click/hover handlers bubble up from the real component elements.
      return h(
        'div',
        {
          'data-lc-id': props.widget.id,
          class: {
            'lc-canvas-node': true,
            'lc-canvas-node--layout': isLayout,
          },
          onClick: (e: MouseEvent) => {
            e.stopPropagation()
            selectWidget(props.widget.id)
          },
          onMouseover: (e: MouseEvent) => {
            e.stopPropagation()
            hoveredId.value = props.widget.id
          },
          onMouseleave: () => {
            if (hoveredId.value === props.widget.id) hoveredId.value = null
          },
        },
        [componentVNode],
      )
    }
  },
})

export default LcCanvasWidgetNode

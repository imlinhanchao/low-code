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
      const isDragging = draggingConfig.value !== null

      // ── Floating action bar (shared between normal and virtual render modes) ─
      const actionsBar = h('div', { class: 'lc-node-actions' }, [
        h('span', { class: 'lc-node-actions__name' }, config.name),
        h('span', { class: 'lc-node-actions__btn lc-node-actions__btn--drag', title: '拖拽' }, '⠿'),
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
            class: {
              'lc-canvas-node': true,
              'lc-canvas-node--selected': isSelected,
              'lc-canvas-node--virtual-item': true,
            },
            onClick: (e: MouseEvent) => {
              e.stopPropagation()
              selectWidget(props.widget.id)
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
      const slotFns: Record<string, () => VNode | VNode[] | string> = {}

      // Normal populated slots — always embed inline (WYSIWYG)
      const populatedSlots = normalSlots.filter(
        (s) => (props.widget.slots[s.name] ?? []).length > 0,
      )
      // Empty slots on layout components — always embed (they ARE the visual cells)
      const layoutEmptySlots = isLayout
        ? normalSlots.filter((s) => !(props.widget.slots[s.name] ?? []).length)
        : []
      // Empty slots on widget components (non-virtual) — embed only while dragging
      const widgetEmptySlots = !isLayout
        ? normalSlots.filter((s) => !(props.widget.slots[s.name] ?? []).length)
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

      // While dragging, also embed empty (non-virtual) widget slots
      if (isDragging) {
        for (const slotCfg of widgetEmptySlots) {
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

      // ── Unified slots panel ──────────────────────────────────────────────
      // Shown when selected or dragging.  Contains:
      //  a) Regular (non-virtual) empty widget slots as droppable chip hints
      //  b) Virtual slot contents — existing children as clickable virtual chips
      //     plus a drop zone for adding more items
      //
      // The panel also stays open while a virtual-slot child is selected so the
      // user can click another sibling chip without having to re-select the parent.
      const hasVirtualChildSelected = virtualSlots.some((s) =>
        (props.widget.slots[s.name] ?? []).some((c) => c.id === selectedId.value),
      )
      const showPanel = !isLayout && (
        (widgetEmptySlots.length > 0 || virtualSlots.length > 0) &&
        (isSelected || isDragging || hasVirtualChildSelected)
      )
      const slotsPanel = showPanel
        ? h(
            'div',
            { class: 'lc-canvas-node__slots-panel' },
            [
              // (a) Regular empty widget slots
              ...widgetEmptySlots.map((s) =>
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
              // (b) Virtual slot children + drop zone
              ...virtualSlots.flatMap((s) => {
                const children = props.widget.slots[s.name] ?? []
                const accept = s.components?.map((c) => c.name) ?? []
                return [
                  // Existing children as selectable virtual-mode chips
                  ...children.map((c, i) =>
                    h(LcCanvasWidgetNode, {
                      key: c.id,
                      widget: c,
                      virtual: true,
                      slotParentId: props.widget.id,
                      slotName: s.name,
                      slotIndex: i,
                      slotTotal: children.length,
                    }),
                  ),
                  // Drop zone for adding more items to this virtual slot
                  h(CanvasSlotZone, {
                    key: `vslot-${s.name}`,
                    parentId: props.widget.id,
                    slotName: s.name,
                    slotLabel: s.label ?? s.name,
                    children: [],
                    isLayout: false,
                    accept,
                  }),
                ]
              }),
            ],
          )
        : null

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
          slotsPanel,
        ],
      )
    }
  },
})

export default LcCanvasWidgetNode

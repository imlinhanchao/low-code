<script setup lang="ts">
import { inject, ref, computed, onMounted, onUnmounted, type Ref } from 'vue'
import type { ComponentConfig, WidgetSchema, FormSchema, SlotConfig } from '../../types'
import { hoveredId } from './useCanvasOverlay'
import { draggingConfig, draggingWidget } from '../useDragState'
import { LcCanvasWidgetNode, CanvasSlotZone } from './CanvasWidgetNode'

interface Rect { left: number; top: number; width: number; height: number }

// ── Injected state ────────────────────────────────────────────────────────────
const selectedId    = inject<Ref<string | null>>('lc:selectedId')!
const allConfigs    = inject<Ref<ComponentConfig[]>>('lc:allConfigs')!
const removeWidget  = inject<(id: string) => void>('lc:removeWidget')!
const selectWidget  = inject<(id: string | null) => void>('lc:selectWidget')!
const schema        = inject<Ref<FormSchema>>('lc:schema')!
const canvasEl      = inject<Ref<HTMLElement | null>>('lc:canvasEl')!
const reorderSlotChildren = inject<
  (parentId: string, slotName: string, from: number, to: number) => void
>('lc:reorderSlotChildren')

// ── Widget lookup helper ──────────────────────────────────────────────────────
function findWidget(widgets: WidgetSchema[], id: string): WidgetSchema | null {
  for (const w of widgets) {
    if (w.id === id) return w
    for (const children of Object.values(w.slots)) {
      const found = findWidget(children, id)
      if (found) return found
    }
  }
  return null
}

/**
 * Find the id of the direct parent of the widget with the given id.
 * Returns null if the widget is a root-level widget (no parent).
 * Returns undefined if the widget was not found in this subtree.
 */
function findParentId(widgets: WidgetSchema[], id: string, parentId: string | null = null): string | null | undefined {
  for (const w of widgets) {
    if (w.id === id) return parentId
    for (const children of Object.values(w.slots)) {
      const found = findParentId(children, id, w.id)
      if (found !== undefined) return found
    }
  }
  return undefined
}

const parentId = computed<string | null>(() => {
  if (!selectedId.value) return null
  const result = findParentId(schema.value?.widgets ?? [], selectedId.value)
  return result ?? null
})

// ── Position calculation ──────────────────────────────────────────────────────
/**
 * Return the bounding rect of the element with data-lc-id=id, expressed in
 * the canvas's own scroll coordinate system (top-left = 0,0 at scrollTop=0).
 *
 * Since lc-canvas-node uses display:contents, the shell element has no box.
 * We fall back to the first rendered child element for the actual bounds.
 */
function getRect(id: string | null): Rect | null {
  if (!id || !canvasEl.value) return null
  const el = canvasEl.value.querySelector(`[data-lc-id="${id}"]`) as HTMLElement | null
  if (!el) return null
  // display:contents elements have no box.
  // Some components (e.g. ElTooltip via ElOnlyChild) render their slot child
  // directly without a wrapper, so the firstElementChild may also be
  // display:contents.  Walk down the chain until we reach a boxed element.
  // A depth limit guards against malformed/circular DOM structures.
  let target: HTMLElement | null = el
  let depth = 0
  while (target && depth < 10 && window.getComputedStyle(target).display === 'contents') {
    target = target.firstElementChild as HTMLElement | null
    depth++
  }
  if (!target) return null
  const er = target.getBoundingClientRect()
  const cr = canvasEl.value.getBoundingClientRect()
  return {
    left: er.left - cr.left + canvasEl.value.scrollLeft,
    top:  er.top  - cr.top  + canvasEl.value.scrollTop,
    width:  er.width,
    height: er.height,
  }
}

const hoverRect  = ref<Rect | null>(null)
const selectRect = ref<Rect | null>(null)

let raf = 0
function tick() {
  hoverRect.value  = hoveredId.value !== selectedId.value
    ? getRect(hoveredId.value)
    : null
  selectRect.value = getRect(selectedId.value)
  raf = requestAnimationFrame(tick)
}
onMounted(()  => { raf = requestAnimationFrame(tick) })
onUnmounted(() => cancelAnimationFrame(raf))

function toStyle(r: Rect) {
  return {
    left:   `${r.left}px`,
    top:    `${r.top}px`,
    width:  `${r.width}px`,
    height: `${r.height}px`,
  }
}

// ── Derived widget / config for selected node ─────────────────────────────────
const selectedWidget = computed(() =>
  selectedId.value ? findWidget(schema.value?.widgets ?? [], selectedId.value) : null,
)
const selectedConfig = computed(() =>
  selectedWidget.value
    ? allConfigs.value.find((c) => c.name === selectedWidget.value!.name) ?? null
    : null,
)

// ── Hover label config ────────────────────────────────────────────────────────
const hoveredWidget = computed(() =>
  hoveredId.value && hoveredId.value !== selectedId.value
    ? findWidget(schema.value?.widgets ?? [], hoveredId.value)
    : null,
)
const hoveredConfig = computed(() =>
  hoveredWidget.value
    ? allConfigs.value.find((c) => c.name === hoveredWidget.value!.name) ?? null
    : null,
)

// ── Drag handle ───────────────────────────────────────────────────────────────
function onDragStart(e: DragEvent) {
  if (!selectedWidget.value) return
  e.stopPropagation()
  draggingWidget.value = selectedWidget.value
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', selectedWidget.value.id)
  }
}
function onDragEnd() {
  draggingWidget.value = null
}

// ── Slots panel (moved from CanvasWidgetNode) ─────────────────────────────────
const isDragging = computed(() =>
  draggingConfig.value !== null || draggingWidget.value !== null,
)

/** Effective slot list for the currently selected widget */
const effectiveSelectedSlots = computed<SlotConfig[]>(() => {
  if (!selectedConfig.value) return []
  if (selectedConfig.value.computeSlots) {
    return selectedConfig.value.computeSlots(selectedWidget.value?.props ?? {})
  }
  return selectedConfig.value.slots ?? []
})

/** Empty non-virtual slots of the selected widget (shown as droppable chips) */
const widgetEmptySlots = computed<SlotConfig[]>(() => {
  if (!selectedWidget.value || selectedWidget.value.category === 'layout') return []
  return effectiveSelectedSlots.value.filter(
    (s) => !s.virtual && !(selectedWidget.value!.slots[s.name] ?? []).length,
  )
})

/** Virtual slots of the selected widget (e.g. ElSelect's option slot) */
const virtualSlots = computed<SlotConfig[]>(() => {
  if (!selectedWidget.value) return []
  return effectiveSelectedSlots.value.filter((s) => s.virtual)
})

/** True when a virtual-slot child of the selected widget is itself selected */
const hasVirtualChildSelected = computed(() =>
  virtualSlots.value.some((s) =>
    (selectedWidget.value?.slots[s.name] ?? []).some((c) => c.id === selectedId.value),
  ),
)

const showSlotsPanel = computed(() => {
  if (!selectedWidget.value || selectedWidget.value.category === 'layout') return false
  return (
    (widgetEmptySlots.value.length > 0 || virtualSlots.value.length > 0) &&
    (!!selectedId.value || isDragging.value || hasVirtualChildSelected.value)
  )
})
</script>

<template>
  <!--
    The overlay wrapper sits absolutely over the entire canvas with
    pointer-events:none so all mouse events pass through to the components
    beneath.  Only interactive sub-elements (action bar, slots panel) restore
    pointer-events.
  -->
  <div class="lc-overlay">
    <!-- Hover ring: thin dashed ring + widget name label -->
    <div
      v-if="hoverRect"
      class="lc-overlay__ring lc-overlay__ring--hover"
      :style="toStyle(hoverRect)"
    >
      <span v-if="hoveredConfig" class="lc-overlay__hover-label">
        {{ hoveredConfig.name }}
      </span>
    </div>

    <!-- Selection ring: solid ring + action bar -->
    <div
      v-if="selectRect && selectedId"
      class="lc-overlay__ring lc-overlay__ring--selected"
      :style="toStyle(selectRect)"
    >
      <div class="lc-overlay__actions">
        <span class="lc-overlay__actions__name">{{ selectedConfig?.name }}</span>
        <button
          v-if="parentId"
          class="lc-overlay__actions__btn lc-overlay__actions__btn--parent"
          title="选择父组件"
          @click.stop="selectWidget(parentId)"
        >↑</button>
        <span
          class="lc-overlay__actions__btn lc-overlay__actions__btn--drag"
          draggable="true"
          title="拖拽"
          @dragstart="onDragStart"
          @dragend="onDragEnd"
        >⠿</span>
        <button
          class="lc-overlay__actions__btn lc-overlay__actions__btn--delete"
          title="删除"
          @click.stop="selectedId && removeWidget(selectedId)"
        >✕</button>
      </div>
    </div>

    <!--
      Slots panel: displayed below the selected component.
      Moved here from CanvasWidgetNode so the node wrapper can be
      display:contents (layout-transparent) without breaking absolute
      positioning of the panel.
    -->
    <div
      v-if="showSlotsPanel && selectRect && selectedWidget"
      class="lc-overlay__slots-panel"
      :style="{
        left: `${selectRect.left}px`,
        top: `${selectRect.top + selectRect.height}px`,
        minWidth: `${selectRect.width}px`,
      }"
    >
      <!-- (a) Regular empty widget slots as droppable chip hints -->
      <CanvasSlotZone
        v-for="slot in widgetEmptySlots"
        :key="`empty-${slot.name}`"
        :parent-id="selectedWidget.id"
        :slot-name="slot.name"
        :slot-label="slot.label ?? slot.name"
        :children="[]"
        :is-layout="false"
        :accept="slot.components?.map((c) => c.name) ?? []"
      />
      <!-- (b) Virtual slot children + drop zone -->
      <template v-for="slot in virtualSlots" :key="slot.name">
        <LcCanvasWidgetNode
          v-for="(child, i) in (selectedWidget.slots[slot.name] ?? [])"
          :key="child.id"
          :widget="child"
          :virtual="true"
          :slot-parent-id="selectedWidget.id"
          :slot-name="slot.name"
          :slot-index="i"
          :slot-total="(selectedWidget.slots[slot.name] ?? []).length"
        />
        <CanvasSlotZone
          :parent-id="selectedWidget.id"
          :slot-name="slot.name"
          :slot-label="slot.label ?? slot.name"
          :children="[]"
          :is-layout="false"
          :accept="slot.components?.map((c) => c.name) ?? []"
        />
      </template>
    </div>
  </div>
</template>

<style>
/* ── Overlay container ──────────────────────────────────────────────────────── */
/*
 * Absolutely fills the canvas scroll-area.  pointer-events: none by default
 * so all mouse activity passes through to the actual components beneath.
 */
.lc-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 100;
  overflow: visible;
}

/* ── Ring frames ─────────────────────────────────────────────────────────────  */
.lc-overlay__ring {
  position: absolute;
  box-sizing: border-box;
  pointer-events: none;
}

/* Hover ring: thin 1px dashed */
.lc-overlay__ring--hover {
  outline: 1px dashed #409eff;
  outline-offset: 1px;
}

/* Hover label — floats above top-left of hover ring */
.lc-overlay__hover-label {
  position: absolute;
  top: 0;
  left: 0;
  transform: translateY(-100%);
  font-size: 10px;
  color: #409eff;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #409eff;
  border-bottom: none;
  padding: 1px 5px;
  border-radius: 3px 3px 0 0;
  white-space: nowrap;
  line-height: 1.5;
  pointer-events: none;
}

/* Selection ring: solid 2px */
.lc-overlay__ring--selected {
  outline: 2px solid #409eff;
  outline-offset: 1px;
}

/* ── Action bar ─────────────────────────────────────────────────────────────── */
/*
 * Absolutely positioned at the top-right of the selection ring.
 * translateY(-100%) floats it above the ring without consuming layout space.
 * pointer-events: auto so the buttons can be clicked.
 */
.lc-overlay__actions {
  position: absolute;
  top: 0;
  right: 0;
  transform: translateY(-100%);
  display: flex;
  align-items: center;
  gap: 0;
  background: #409eff;
  border-radius: 4px 4px 0 0;
  padding: 2px 4px;
  pointer-events: auto;
  white-space: nowrap;
  line-height: 1;
  z-index: 101;
}

.lc-overlay__actions__name {
  font-size: 10px;
  color: #fff;
  user-select: none;
  padding: 0 4px 0 2px;
  opacity: 0.9;
  line-height: 1;
}

.lc-overlay__actions__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  border-radius: 3px;
  font-size: 10px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  transition: background 0.1s, color 0.1s;
}
.lc-overlay__actions__btn:hover {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
}
.lc-overlay__actions__btn--drag {
  cursor: grab;
  font-size: 12px;
  letter-spacing: -1px;
}
.lc-overlay__actions__btn--parent:hover {
  background: rgba(255, 255, 255, 0.35);
}
.lc-overlay__actions__btn--delete:hover {
  background: #f56c6c;
}

/* ── Slots panel (absolutely positioned below the selected component) ─────── */
/*
 * Moved from CanvasWidgetNode.ts so the node shell can be display:contents.
 * Positioned via inline style at selectRect.bottom.  pointer-events: auto
 * so the drag/drop zones and chips inside are interactive.
 */
.lc-overlay__slots-panel {
  position: absolute;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 4px 6px 5px;
  border: 1px solid #dcdfe6;
  border-top: none;
  border-radius: 0 0 4px 4px;
  background: #fafbfc;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  z-index: 101;
  pointer-events: auto;
  white-space: nowrap;
}
/* Chip slots inside the panel */
.lc-overlay__slots-panel .lc-canvas-slot--widget {
  flex: 0 0 auto;
  min-width: 60px;
  min-height: 28px;
  border: 1px dashed #c0c4cc;
  border-radius: 3px;
  padding: 3px 8px;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
}
.lc-overlay__slots-panel .lc-canvas-slot--widget.lc-canvas-slot--over {
  background: #ecf5ff;
  border-color: #409eff;
}
</style>

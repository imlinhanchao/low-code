<script setup lang="ts">
import { inject, ref, computed, onMounted, onUnmounted, type Ref } from 'vue'
import type { ComponentConfig, WidgetSchema, FormSchema, SlotConfig } from '../../types'
import { hoveredId } from './useCanvasOverlay'
import { draggingWidget } from '../useDragState'
import { LcCanvasWidgetNode, CanvasSlotZone } from './CanvasWidgetNode'
import { useI18n } from '../i18n'

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

const { tt } = useI18n();
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

// ── Slots panel ───────────────────────────────────────────────────────────────
/** Effective slot list for the currently selected widget */
const effectiveSelectedSlots = computed<SlotConfig[]>(() => {
  if (!selectedConfig.value) return []
  if (selectedConfig.value.computeSlots) {
    return selectedConfig.value.computeSlots(selectedWidget.value?.props ?? {})
  }
  return selectedConfig.value.slots ?? []
})

/** All non-virtual slots of the selected widget (empty + populated) */
const nonVirtualSlots = computed<SlotConfig[]>(() => {
  if (!selectedWidget.value) return []
  return effectiveSelectedSlots.value.filter((s) => !s.virtual)
})

/** Virtual slots of the selected widget (e.g. ElSelect's option slot) */
const virtualSlots = computed<SlotConfig[]>(() => {
  if (!selectedWidget.value) return []
  return effectiveSelectedSlots.value.filter((s) => s.virtual)
})

const showSlotsPanel = computed(() => {
  if (!selectedWidget.value) return false
  return effectiveSelectedSlots.value.length > 0 && !!selectedId.value
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
      Shows all slots (empty + populated) for slot management.
      Slot children are shown as reorderable chips; each slot has a drop zone
      at the bottom to append more components by drag-drop.
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
      <!-- Non-virtual slots: show children chips + append drop zone -->
      <template v-for="slot in nonVirtualSlots" :key="slot.name">
        <div class="lc-overlay__slot-group">
          <div class="lc-overlay__slot-group-label">{{ tt(slot.label) || slot.name }}</div>
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
            :slot-label="tt(slot.label) || slot.name"
            :children="[]"
            :is-layout="false"
            :accept="slot.components?.map((c) => c.name) ?? []"
          />
        </div>
      </template>
      <!-- Virtual slot children + drop zone -->
      <template v-for="slot in virtualSlots" :key="slot.name">
        <div class="lc-overlay__slot-group">
          <div class="lc-overlay__slot-group-label">{{ tt(slot.label) || slot.name }}</div>
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
            :slot-label="tt(slot.label) || slot.name"
            :children="[]"
            :is-layout="false"
            :accept="slot.components?.map((c) => c.name) ?? []"
          />
        </div>
      </template>
    </div>
  </div>
</template>


<script setup lang="ts">
import { inject, ref, computed, onMounted, onUnmounted, type Ref } from 'vue'
import type { ComponentConfig, WidgetSchema, FormSchema } from '../../types'
import { hoveredId } from './useCanvasOverlay'
import { draggingWidget } from '../useDragState'

interface Rect { left: number; top: number; width: number; height: number }

// ── Injected state ────────────────────────────────────────────────────────────
const selectedId   = inject<Ref<string | null>>('lc:selectedId')!
const allConfigs   = inject<Ref<ComponentConfig[]>>('lc:allConfigs')!
const removeWidget = inject<(id: string) => void>('lc:removeWidget')!
const schema       = inject<Ref<FormSchema>>('lc:schema')!
const canvasEl     = inject<Ref<HTMLElement | null>>('lc:canvasEl')!

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

// ── Position calculation ──────────────────────────────────────────────────────
/**
 * Return the bounding rect of the element with data-lc-id=id, expressed in
 * the canvas's own scroll coordinate system (top-left = 0,0 at scrollTop=0).
 */
function getRect(id: string | null): Rect | null {
  if (!id || !canvasEl.value) return null
  const el = canvasEl.value.querySelector(`[data-lc-id="${id}"]`) as HTMLElement | null
  if (!el) return null
  const er = el.getBoundingClientRect()
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
</script>

<template>
  <!--
    The overlay wrapper sits absolutely over the entire canvas with
    pointer-events:none so all mouse events pass through to the components
    beneath.  Only interactive sub-elements (action bar buttons) restore
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
.lc-overlay__actions__btn--delete:hover {
  background: #f56c6c;
}
</style>

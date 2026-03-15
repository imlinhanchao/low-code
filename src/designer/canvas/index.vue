<script setup lang="ts">
import { inject, ref, provide } from 'vue'
import type { ComponentConfig, FormSchema } from '../../types'
import { draggingConfig, draggingWidget } from '../useDragState'
import { hoveredId } from './useCanvasOverlay'
import { LcCanvasWidgetNode } from './CanvasWidgetNode'
import CanvasOverlay from './CanvasOverlay.vue'

const props = defineProps<{ schema: FormSchema }>()

const addWidget =
  inject<(parentId: string | null, slotName: string | null, cfg: ComponentConfig) => void>(
    'lc:addWidget',
  )!
const moveWidget =
  inject<(id: string, parentId: string | null, slotName: string | null) => void>(
    'lc:moveWidget',
  )
const selectWidget = inject<(id: string | null) => void>('lc:selectWidget')!

// Provide a ref to the canvas DOM element so CanvasOverlay can compute positions
const canvasRef = ref<HTMLElement | null>(null)
provide('lc:canvasEl', canvasRef)

const isOver = ref(false)

function onDragOver(e: DragEvent) {
  if (!draggingConfig.value && !draggingWidget.value) return
  e.preventDefault()
  isOver.value = true
  if (e.dataTransfer) e.dataTransfer.dropEffect = draggingWidget.value ? 'move' : 'copy'
}

function onDragLeave(e: DragEvent) {
  if (!e.currentTarget || !(e.currentTarget as Element).contains(e.relatedTarget as Node)) {
    isOver.value = false
  }
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  isOver.value = false
  if (draggingWidget.value) {
    moveWidget?.(draggingWidget.value.id, null, null)
    draggingWidget.value = null
  } else if (draggingConfig.value) {
    addWidget(null, null, draggingConfig.value)
    draggingConfig.value = null
  }
}
</script>

<template>
  <div
    ref="canvasRef"
    class="lc-canvas"
    :class="{ 'drag-over': isOver }"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
    @click.self="selectWidget(null)"
    @mouseleave="hoveredId = null"
  >
    <div v-if="schema.widgets.length === 0" class="lc-canvas-empty">
      从左侧拖拽组件到此处
    </div>
    <LcCanvasWidgetNode
      v-for="widget in schema.widgets"
      :key="widget.id"
      :widget="widget"
    />
    <!-- Global overlay: draws hover/selection rings and the action bar -->
    <CanvasOverlay />
  </div>
</template>

<!-- ─────────────────────────────────────────────────────────────────────────
     Canvas + WYSIWYG node styles
     These are NOT scoped so they apply to dynamically-rendered h() nodes.
     ──────────────────────────────────────────────────────────────────────── -->
<style>
/* ── Canvas container ───────────────────────────────────────────────────── */
.lc-canvas {
  position: relative; /* needed so the overlay is positioned correctly */
  height: 100%;
  padding: 12px;
  overflow-y: auto;
  background: #f1f2f3;
  transition: background 0.15s;
  box-sizing: border-box;
}
.lc-canvas.drag-over {
  background: #e8f3ff;
  outline: 2px dashed #409eff;
  outline-offset: -4px;
}
.lc-canvas-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
  color: #c0c4cc;
  font-size: 15px;
  pointer-events: none;
}

/* ── Widget shell wrapper ──────────────────────────────────────────────── */
/*
 * display:contents makes this div generate NO box at all — it is completely
 * invisible to layout.  Children render as if this div didn't exist.
 *
 * The element still exists in the DOM, so:
 *  - data-lc-id attribute is queryable by the overlay
 *  - click/hover events bubble through (event listeners still fire)
 *
 * Hover / selection highlights are drawn by CanvasOverlay using CSS outline
 * on absolutely-positioned ring divs — zero layout impact.
 */
.lc-canvas-node {
  display: contents;
}

.lc-canvas-node--missing {
  /* Missing components need a visible box; restore display for them */
  display: block;
  padding: 6px 10px;
  color: #f56c6c;
  font-size: 12px;
  border: 1px dashed #f56c6c;
}

/* ── Floating action bar (virtual chip nodes) ───────────────────────────── */
/*
 * These still use the old inline action-bar approach because they are
 * compact chips in the virtual-slots panel (not full-size components),
 * and the overlay can't easily reach inside the panel container.
 */
.lc-node-actions {
  position: absolute;
  top: 0;
  right: 0;
  transform: translateY(-100%);
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 0;
  background: #409eff;
  border-radius: 4px 4px 0 0;
  padding: 2px 4px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s;
  white-space: nowrap;
  line-height: 1;
}
.lc-canvas-node--virtual-item:hover > .lc-node-actions,
.lc-canvas-node--selected > .lc-node-actions {
  opacity: 1;
  pointer-events: auto;
}
.lc-node-actions__name {
  font-size: 10px;
  color: #fff;
  user-select: none;
  padding: 0 4px 0 2px;
  opacity: 0.9;
  line-height: 1;
}
.lc-node-actions__btn {
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
.lc-node-actions__btn:hover {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
}
.lc-node-actions__btn--delete:hover {
  background: #f56c6c;
}

/* ── Canvas slot zone ─────────────────────────────────────────────────── */
.lc-canvas-slot {
  box-sizing: border-box;
  transition: background 0.12s, border-color 0.12s;
}

/*
 * Non-empty layout / widget slots: display:contents so slot children render
 * directly inside the component's real slot area (100% WYSIWYG).
 */
.lc-canvas-slot--layout:not(.lc-canvas-slot--empty),
.lc-canvas-slot--widget:not(.lc-canvas-slot--empty) {
  display: contents;
}

/* Empty layout slot: visible drop target so users can drop into it */
.lc-canvas-slot--layout.lc-canvas-slot--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  border: 1px dashed #c0c4cc;
  border-radius: 3px;
  background: #fafbfc;
}

/* Empty widget slot (in panel): compact chip target */
.lc-canvas-slot--widget.lc-canvas-slot--empty {
  display: inline-flex;
  align-items: center;
  min-width: 32px;
  min-height: 16px;
  border: 1px dashed #c0c4cc;
  border-radius: 3px;
  padding: 1px 4px;
  background: #f5f7fa;
}

/* Drag-over highlight */
.lc-canvas-slot--over {
  background: #ecf5ff !important;
  border-color: #409eff !important;
}

/* Drop blocked */
.lc-canvas-slot--blocked {
  background: #fef0f0 !important;
  border-color: #f56c6c !important;
  cursor: not-allowed;
}
.lc-canvas-slot--blocked .lc-canvas-slot__hint {
  color: #f56c6c;
}

/*
 * During drag mode: show ALL slot zones (including non-empty ones) as visible
 * bordered drop targets.  The two-class selectors below have the same
 * specificity as the display:contents rules above, so placing them after is
 * enough to win — no !important needed.
 */
.lc-canvas-slot--dragging.lc-canvas-slot--layout,
.lc-canvas-slot--dragging.lc-canvas-slot--widget {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 4px;
  min-height: 36px;
  border: 2px dashed rgba(64, 158, 255, 0.5);
  border-radius: 4px;
  padding: 4px;
  background: rgba(64, 158, 255, 0.03);
  box-sizing: border-box;
}
.lc-canvas-slot--dragging.lc-canvas-slot--over {
  background: rgba(64, 158, 255, 0.12) !important;
  border-color: #409eff !important;
}
.lc-canvas-slot--dragging.lc-canvas-slot--blocked {
  background: rgba(245, 108, 108, 0.05) !important;
  border-color: rgba(245, 108, 108, 0.5) !important;
}

/* Empty slot hint text */
.lc-canvas-slot__hint {
  font-size: 10px;
  color: #b8becc;
  user-select: none;
  pointer-events: none;
  white-space: nowrap;
}

/* ── Virtual item chip (e.g. ElOption inside ElSelect's panel) ──────────── */
.lc-canvas-node--virtual-item {
  display: inline-flex;  /* overrides display:contents from .lc-canvas-node */
  position: relative;    /* needed for the lc-node-actions absolute bar */
  align-items: center;
  padding: 4px 10px;
  min-width: 60px;
  min-height: 28px;
  margin: 2px 0;
  background: #f0f2f5;
  border: 1px dashed transparent;
  border-radius: 3px;
}
.lc-canvas-node--virtual-item:hover {
  border-color: #c0c4cc;
}
.lc-canvas-node--selected.lc-canvas-node--virtual-item {
  border-color: #409eff;
  background: #ecf5ff;
}
.lc-canvas-node__virtual-label {
  font-size: 12px;
  color: #606266;
  user-select: none;
  pointer-events: none;
}

/* ── Static layout slot placeholder (empty slot, no drag interaction) ─────── */
.lc-canvas-slot-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  min-width: 60px;
  border: 1px dashed #dcdfe6;
  border-radius: 3px;
  background: #f5f7fa;
  font-size: 10px;
  color: #c0c4cc;
  user-select: none;
  pointer-events: none;
}

/* ── Drag-host mode: component wrapper becomes visible ──────────────────── */
/*
 * When dragging, lc-canvas-node--dragging-host overrides display:contents so
 * the shell div has a real box. This lets us position a name badge and draw
 * a highlight ring relative to the component block.
 */
.lc-canvas-node--dragging-host {
  display: block;
  position: relative;
}

/* Component name badge — floats above top-right corner of the block */
.lc-canvas-node__drag-name {
  position: absolute;
  top: 0;
  right: 0;
  transform: translateY(-100%);
  background: #409eff;
  color: #fff;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 3px 3px 0 0;
  line-height: 1.6;
  white-space: nowrap;
  pointer-events: none;
  z-index: 10;
}

/* Highlight the component block when one of its slot zones is being hovered */
.lc-canvas-node--slot-hovered {
  outline: 2px solid rgba(64, 158, 255, 0.7);
  outline-offset: 2px;
}
</style>

<script setup lang="ts">
import { inject, ref, type Ref } from 'vue'
import type { ComponentConfig, FormSchema } from '../../types'
import { draggingConfig } from '../useDragState'
import { LcCanvasWidgetNode } from './CanvasWidgetNode'

const props = defineProps<{ schema: FormSchema }>()

const addWidget =
  inject<(parentId: string | null, slotName: string | null, cfg: ComponentConfig) => void>(
    'lc:addWidget',
  )!
const selectWidget = inject<(id: string | null) => void>('lc:selectWidget')!

const isOver = ref(false)

function onDragOver(e: DragEvent) {
  if (!draggingConfig.value) return
  e.preventDefault()
  isOver.value = true
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
}

function onDragLeave(e: DragEvent) {
  if (!e.currentTarget || !(e.currentTarget as Element).contains(e.relatedTarget as Node)) {
    isOver.value = false
  }
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  isOver.value = false
  if (!draggingConfig.value) return
  addWidget(null, null, draggingConfig.value)
  draggingConfig.value = null
}
</script>

<template>
  <div
    class="lc-canvas"
    :class="{ 'drag-over': isOver }"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
    @click.self="selectWidget(null)"
  >
    <div v-if="schema.widgets.length === 0" class="lc-canvas-empty">
      从左侧拖拽组件到此处
    </div>
    <LcCanvasWidgetNode
      v-for="widget in schema.widgets"
      :key="widget.id"
      :widget="widget"
    />
  </div>
</template>

<!-- ─────────────────────────────────────────────────────────────────────────
     Canvas + WYSIWYG node styles
     These are NOT scoped so they apply to dynamically-rendered h() nodes.
     ──────────────────────────────────────────────────────────────────────── -->
<style>
/* ── Canvas container ───────────────────────────────────────────────────── */
.lc-canvas {
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

/* ── Widget wrapper (selection ring) ──────────────────────────────────── */
.lc-canvas-node {
  position: relative;
  border: 1px dashed #c0c4cc;
  border-radius: 4px;
  margin: 6px 0;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  overflow: visible;
}
.lc-canvas-node:hover {
  border-color: #409eff;
}
.lc-canvas-node--selected {
  border: 2px solid #409eff !important;
}
.lc-canvas-node--layout {
  border-style: solid;
  border-color: #dcdfe6;
}
.lc-canvas-node--missing {
  padding: 6px 10px;
  color: #f56c6c;
  font-size: 12px;
}

/* ── Floating action bar ────────────────────────────────────────────────── */
/*
 * Absolutely positioned at the top-right of the node wrapper.
 * Uses translateY(-100%) so it floats ABOVE the component border,
 * taking up zero layout space.  Invisible by default; fades in on
 * hover or when the node is selected.
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
.lc-node-actions__btn--drag {
  cursor: grab;
  font-size: 12px;
  letter-spacing: -1px;
}
.lc-node-actions__btn--delete:hover {
  background: #f56c6c;
}

/* ── Canvas slot zone ─────────────────────────────────────────────────── */
/*
 * This div is passed AS the slot content to the real component, so it
 * renders INSIDE the component's visual slot area — e.g. inside a card's
 * header, inside a grid column, inside ElInput's prefix area.
 */
.lc-canvas-slot {
  box-sizing: border-box;
  transition: background 0.12s, border-color 0.12s;
}

/* Layout slot: block, takes full width of the parent cell */
.lc-canvas-slot--layout {
  display: block;
  min-height: 56px;
  padding: 4px;
  border: 1px dashed #c0c4cc;
  border-radius: 3px;
  background: #fafbfc;
}
.lc-canvas-slot--layout.lc-canvas-slot--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 56px;
}

/* Widget slot: compact, wraps slot children (e.g. inside ElInput prefix) */
.lc-canvas-slot--widget {
  display: inline-flex;
  align-items: center;
  min-width: 10px;
}
.lc-canvas-slot--widget.lc-canvas-slot--empty {
  min-width: 32px;
  min-height: 16px;
  border: 1px dashed #c0c4cc;
  border-radius: 3px;
  padding: 1px 4px;
  background: #f5f7fa;
}

/* Drag-over highlight for any slot */
.lc-canvas-slot--over {
  background: #ecf5ff !important;
  border-color: #409eff !important;
}

/* Drop blocked — dragged component not allowed in this slot */
.lc-canvas-slot--blocked {
  background: #fef0f0 !important;
  border-color: #f56c6c !important;
  cursor: not-allowed;
}
.lc-canvas-slot--blocked .lc-canvas-slot__hint {
  color: #f56c6c;
}

/* Empty slot hint text */
.lc-canvas-slot__hint {
  font-size: 10px;
  color: #b8becc;
  user-select: none;
  pointer-events: none;
  white-space: nowrap;
}

/* ── Empty-slot chip panel (widget slots, shown on select / while dragging) */
.lc-canvas-node__slots-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 4px 6px 5px;
  border-top: 1px dashed #e4e7ed;
  background: #fafbfc;
}
/* Chips inside the panel are always block-visible */
.lc-canvas-node__slots-panel .lc-canvas-slot--widget {
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
.lc-canvas-node__slots-panel .lc-canvas-slot--widget.lc-canvas-slot--over {
  background: #ecf5ff;
  border-color: #409eff;
}

/* ── Virtual item chip (e.g. ElOption inside ElSelect's panel) ──────────── */
/*
 * Shown in the slots panel instead of being embedded in the component's
 * slot area.  Acts like a mini canvas node: position:relative so the
 * floating action bar can sit above it.
 */
.lc-canvas-node--virtual-item {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  min-width: 60px;
  min-height: 28px;
  margin: 2px 0;
  background: #f0f2f5;
}
.lc-canvas-node__virtual-label {
  font-size: 12px;
  color: #606266;
  user-select: none;
  pointer-events: none;
}
</style>

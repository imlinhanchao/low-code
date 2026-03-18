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

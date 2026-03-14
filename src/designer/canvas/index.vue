<script setup lang="ts">
import { inject, ref, type Ref } from 'vue'
import type { ComponentConfig, FormSchema } from '../../types'
import { draggingConfig } from '../useDragState'
import CanvasWidget from './widget.vue'

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
  // Only handle drops that weren't stopped by a nested slot-zone
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
    <CanvasWidget
      v-for="widget in schema.widgets"
      :key="widget.id"
      :widget="widget"
    />
  </div>
</template>

<style scoped>
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
</style>

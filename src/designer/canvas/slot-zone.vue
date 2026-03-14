<script setup lang="ts">
import { inject, ref, type Ref } from 'vue'
import type { ComponentConfig, WidgetSchema } from '../../types'
import { draggingConfig } from '../useDragState'
// Circular import is safe in Vue 3 — components are resolved lazily at render time
// eslint-disable-next-line import/no-cycle
import CanvasWidget from './widget.vue'

const props = defineProps<{
  parentId: string
  slotName: string
  slotLabel: string
  children: WidgetSchema[]
}>()

const addWidget =
  inject<(parentId: string | null, slotName: string | null, cfg: ComponentConfig) => void>(
    'lc:addWidget',
  )!

const isOver = ref(false)

function onDragOver(e: DragEvent) {
  if (!draggingConfig.value) return
  e.preventDefault()
  e.stopPropagation()
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
  e.stopPropagation()
  isOver.value = false
  if (!draggingConfig.value) return
  addWidget(props.parentId, props.slotName, draggingConfig.value)
  draggingConfig.value = null
}
</script>

<template>
  <div
    class="lc-slot-zone"
    :class="{ 'is-over': isOver, 'has-children': children.length > 0 }"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <div class="lc-slot-zone-label">{{ slotLabel }}</div>
    <div class="lc-slot-children">
      <div v-if="children.length === 0" class="lc-slot-empty">
        拖放组件到此插槽
      </div>
      <CanvasWidget
        v-for="child in children"
        :key="child.id"
        :widget="child"
      />
    </div>
  </div>
</template>

<style scoped>
.lc-slot-zone {
  border: 1px dashed #b0b7c0;
  border-radius: 3px;
  margin: 3px 0;
  background: #fafbfc;
  min-height: 44px;
  transition: border-color 0.15s, background 0.15s;
  box-sizing: border-box;
}
.lc-slot-zone.is-over {
  border-color: #409eff;
  background: #ecf5ff;
}
.lc-slot-zone-label {
  padding: 2px 8px;
  border-bottom: 1px dashed #e4e7ed;
  background: #f0f2f5;
  font-size: 10px;
  color: #909399;
  user-select: none;
}
.lc-slot-children {
  padding: 4px 4px 2px;
  min-height: 28px;
}
.lc-slot-empty {
  text-align: center;
  color: #c0c4cc;
  font-size: 11px;
  padding: 6px 0;
  pointer-events: none;
  user-select: none;
}
</style>

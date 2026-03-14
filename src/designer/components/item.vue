<script setup lang="ts">
import type { ComponentConfig } from '../../types'
import { draggingConfig } from '../useDragState'

const props = defineProps<{ config: ComponentConfig }>()

function onDragStart(e: DragEvent) {
  draggingConfig.value = props.config
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'copy'
    e.dataTransfer.setData('text/plain', props.config.name)
  }
}

function onDragEnd() {
  draggingConfig.value = null
}
</script>

<template>
  <div
    class="lc-palette-item"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
  >
    {{ config.name }}
  </div>
</template>

<style scoped>
.lc-palette-item {
  display: flex;
  align-items: center;
  padding: 6px 10px;
  margin: 4px 6px;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: grab;
  user-select: none;
  font-size: 13px;
  color: #303133;
  transition: border-color 0.2s, background 0.2s;
}
.lc-palette-item:hover {
  border-color: #409eff;
  background: #ecf5ff;
  color: #409eff;
}
.lc-palette-item:active {
  cursor: grabbing;
}
</style>

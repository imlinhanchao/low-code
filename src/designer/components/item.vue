<script setup lang="ts">
import { Icon } from '@iconify/vue'
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
    <span v-if="config.icon" class="lc-palette-item__icon">
      <Icon :icon="config.icon" width="16" height="16" />
    </span>
    <span v-else class="lc-palette-item__icon lc-palette-item__icon--default">
      <Icon icon="mdi:puzzle-outline" width="16" height="16" />
    </span>
    <span class="lc-palette-item__label">{{ config.name }}</span>
  </div>
</template>

<style scoped>
.lc-palette-item {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 10px;
  margin: 3px 8px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  cursor: grab;
  user-select: none;
  font-size: 12px;
  color: #303133;
  transition: border-color 0.15s, background 0.15s, box-shadow 0.15s, color 0.15s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.lc-palette-item:hover {
  border-color: #409eff;
  background: #ecf5ff;
  color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.18);
}
.lc-palette-item:active {
  cursor: grabbing;
}
.lc-palette-item__icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  color: inherit;
  opacity: 0.75;
}
.lc-palette-item__icon--default {
  opacity: 0.35;
}
.lc-palette-item__label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

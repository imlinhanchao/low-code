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


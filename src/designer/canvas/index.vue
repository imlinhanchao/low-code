<script setup lang="ts">
import { computed } from 'vue'
import type { ComponentConfig, FormSchema, WidgetSchema } from '../../types'
import { draggingConfig } from '../useDragState'
import CanvasWidget from './widget.vue'

const props = defineProps<{
  schema: FormSchema
  components: ComponentConfig[]
  selectedId: string | null
}>()

const emit = defineEmits<{
  'update:schema': [schema: FormSchema]
  'update:selectedId': [id: string | null]
}>()

function findConfig(name: string): ComponentConfig | undefined {
  return props.components.find(c => c.name === name)
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}

function buildWidget(config: ComponentConfig): WidgetSchema {
  return {
    id: generateId(),
    name: config.name,
    props: { ...config.props },
    models: { ...config.models },
    slotContent: config.slots?.find(s => s.name === 'default') ? config.name : '',
  }
}

// ---------- drag-over / drop ----------
const isDragOver = computed(() => draggingConfig.value !== null)

function onDragOver(e: DragEvent) {
  if (draggingConfig.value) {
    e.preventDefault()
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
  }
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  if (!draggingConfig.value) return
  const widget = buildWidget(draggingConfig.value)
  emit('update:schema', {
    widgets: [...props.schema.widgets, widget],
  })
  emit('update:selectedId', widget.id)
  draggingConfig.value = null
}

// ---------- select / delete ----------
function onSelect(id: string) {
  emit('update:selectedId', id)
}

function onDelete(id: string) {
  const widgets = props.schema.widgets.filter(w => w.id !== id)
  emit('update:schema', { widgets })
  if (props.selectedId === id) {
    emit('update:selectedId', null)
  }
}
</script>

<template>
  <div
    class="lc-canvas"
    :class="{ 'drag-over': isDragOver }"
    @dragover="onDragOver"
    @drop="onDrop"
    @click.self="emit('update:selectedId', null)"
  >
    <div v-if="schema.widgets.length === 0" class="lc-canvas-empty">
      从左侧拖拽组件到此处
    </div>
    <CanvasWidget
      v-for="widget in schema.widgets"
      :key="widget.id"
      :widget="widget"
      :config="findConfig(widget.name)!"
      :selected="widget.id === selectedId"
      @select="onSelect"
      @delete="onDelete"
    />
  </div>
</template>

<style scoped>
.lc-canvas {
  height: 100%;
  padding: 16px;
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

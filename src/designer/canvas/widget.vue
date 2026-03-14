<script setup lang="ts">
import { computed } from 'vue'
import type { ComponentConfig, WidgetSchema } from '../../types'

const props = defineProps<{
  widget: WidgetSchema
  config: ComponentConfig
  selected: boolean
}>()

const emit = defineEmits<{
  select: [id: string]
  delete: [id: string]
}>()

const mergedProps = computed(() => ({
  ...props.widget.props,
  ...props.widget.models,
  style: 'pointer-events:none',
}))
</script>

<template>
  <div
    class="lc-canvas-widget"
    :class="{ 'is-selected': selected }"
    @click.stop="emit('select', widget.id)"
  >
    <span class="lc-widget-label">{{ config.name }}</span>
    <button
      class="lc-widget-delete"
      title="删除"
      @click.stop="emit('delete', widget.id)"
    >✕</button>
    <div class="lc-widget-preview">
      <component
        :is="config.component"
        v-bind="mergedProps"
      >{{ widget.slotContent ?? '' }}</component>
    </div>
  </div>
</template>

<style scoped>
.lc-canvas-widget {
  position: relative;
  border: 1px dashed #c0c4cc;
  border-radius: 4px;
  padding: 8px 8px 6px;
  margin: 6px 0;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.2s;
}
.lc-canvas-widget:hover {
  border-color: #409eff;
}
.lc-canvas-widget.is-selected {
  border: 2px solid #409eff;
  background: #f0f7ff;
}
.lc-widget-label {
  display: inline-block;
  font-size: 11px;
  color: #909399;
  margin-bottom: 4px;
}
.lc-widget-delete {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 18px;
  height: 18px;
  border: none;
  background: #f56c6c;
  color: #fff;
  border-radius: 50%;
  font-size: 10px;
  line-height: 1;
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 0;
}
.lc-canvas-widget:hover .lc-widget-delete,
.lc-canvas-widget.is-selected .lc-widget-delete {
  display: flex;
}
.lc-widget-preview {
  pointer-events: none;
}
</style>

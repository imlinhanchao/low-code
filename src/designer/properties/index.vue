<script setup lang="ts">
import { computed } from 'vue'
import type { ComponentConfig, WidgetSchema } from '../../types'

const props = defineProps<{
  widget: WidgetSchema | null
  config: ComponentConfig | null
}>()

const emit = defineEmits<{
  'update:widget': [widget: WidgetSchema]
}>()

const hasProp = computed(() =>
  props.widget !== null &&
  (Object.keys(props.widget.props).length > 0 ||
    Object.keys(props.widget.models).length > 0 ||
    props.config?.slots?.some(s => s.name === 'default'))
)

function updateProp(key: string, value: unknown) {
  if (!props.widget) return
  emit('update:widget', {
    ...props.widget,
    props: { ...props.widget.props, [key]: value },
  })
}

function updateModel(key: string, value: unknown) {
  if (!props.widget) return
  emit('update:widget', {
    ...props.widget,
    models: { ...props.widget.models, [key]: value },
  })
}

function updateSlotContent(value: string) {
  if (!props.widget) return
  emit('update:widget', { ...props.widget, slotContent: value })
}

function valueToString(v: unknown): string {
  return v == null ? '' : String(v)
}
</script>

<template>
  <div class="lc-properties">
    <div class="lc-properties-title">属性设置</div>

    <template v-if="widget && config">
      <div class="lc-properties-section">{{ config.name }}</div>

      <!-- Props -->
      <template v-if="Object.keys(widget.props).length">
        <div class="lc-properties-group-label">属性</div>
        <div
          v-for="(val, key) in widget.props"
          :key="'prop-' + key"
          class="lc-prop-row"
        >
          <label class="lc-prop-label">{{ key }}</label>
          <input
            class="lc-prop-input"
            :value="valueToString(val)"
            @input="updateProp(key, ($event.target as HTMLInputElement).value)"
          />
        </div>
      </template>

      <!-- Models (v-model bindings) -->
      <template v-if="Object.keys(widget.models).length">
        <div class="lc-properties-group-label">数据绑定</div>
        <div
          v-for="(val, key) in widget.models"
          :key="'model-' + key"
          class="lc-prop-row"
        >
          <label class="lc-prop-label">{{ key }}</label>
          <input
            class="lc-prop-input"
            :value="valueToString(val)"
            @input="updateModel(key, ($event.target as HTMLInputElement).value)"
          />
        </div>
      </template>

      <!-- Default slot text content -->
      <template v-if="config.slots?.some(s => s.name === 'default')">
        <div class="lc-properties-group-label">插槽内容</div>
        <div class="lc-prop-row">
          <label class="lc-prop-label">默认</label>
          <input
            class="lc-prop-input"
            :value="widget.slotContent ?? ''"
            @input="updateSlotContent(($event.target as HTMLInputElement).value)"
          />
        </div>
      </template>
    </template>

    <div v-else class="lc-properties-empty">请选择一个组件</div>
  </div>
</template>

<style scoped>
.lc-properties {
  height: 100%;
  overflow-y: auto;
  background: #fff;
  border-left: 1px solid #dcdfe6;
  box-sizing: border-box;
}
.lc-properties-title {
  padding: 10px 14px 6px;
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  border-bottom: 1px solid #dcdfe6;
  background: #fff;
}
.lc-properties-section {
  padding: 8px 14px 4px;
  font-size: 13px;
  font-weight: 600;
  color: #409eff;
}
.lc-properties-group-label {
  padding: 6px 14px 2px;
  font-size: 11px;
  color: #909399;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.lc-prop-row {
  display: flex;
  align-items: center;
  padding: 4px 14px;
  gap: 8px;
}
.lc-prop-label {
  flex: 0 0 90px;
  font-size: 12px;
  color: #606266;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.lc-prop-input {
  flex: 1;
  height: 28px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 0 8px;
  font-size: 12px;
  color: #303133;
  outline: none;
  min-width: 0;
  box-sizing: border-box;
}
.lc-prop-input:focus {
  border-color: #409eff;
}
.lc-properties-empty {
  padding: 24px 14px;
  color: #c0c4cc;
  font-size: 13px;
  text-align: center;
}
</style>

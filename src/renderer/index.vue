<script setup lang="ts">
import { computed, provide } from 'vue'
import type { ComponentConfig, FormSchema } from '../types'
import { builtinLayouts } from '../layouts/index'
import LcWidgetNode from './WidgetNode'

const props = defineProps<{
  schema: FormSchema
  components: ComponentConfig[]
  modelValue?: Record<string, unknown>
}>()

const emit = defineEmits<{
  'update:modelValue': [data: Record<string, unknown>]
}>()

const formData = computed(
  () => (props.modelValue ?? {}) as Record<string, Record<string, unknown>>,
)

/** All known configs: built-in layouts are always included */
const allConfigs = computed<ComponentConfig[]>(() => [
  ...builtinLayouts,
  ...props.components,
])

function getConfig(name: string): ComponentConfig | undefined {
  return allConfigs.value.find((c) => c.name === name)
}

function getFormData() {
  return formData.value
}

function updateModel(widgetId: string, key: string, value: unknown) {
  const current = { ...formData.value }
  current[widgetId] = { ...(current[widgetId] ?? {}), [key]: value }
  emit('update:modelValue', current)
}

// Provide context for recursive LcWidgetNode rendering
provide('lc:getConfig', getConfig)
provide('lc:getFormData', getFormData)
provide('lc:updateModel', updateModel)
</script>

<template>
  <div class="lc-renderer">
    <LcWidgetNode
      v-for="widget in schema.widgets"
      :key="widget.id"
      :widget="widget"
    />
  </div>
</template>

<style scoped>
.lc-renderer {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-start;
  width: 100%;
}
</style>

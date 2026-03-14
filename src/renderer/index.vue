<script setup lang="ts">
import { computed } from 'vue'
import type { ComponentConfig, FormSchema } from '../types'

const props = defineProps<{
  schema: FormSchema
  components: ComponentConfig[]
  modelValue?: Record<string, unknown>
}>()

const emit = defineEmits<{
  'update:modelValue': [data: Record<string, unknown>]
}>()

/** Live model store: widgetId → value */
const formData = computed<Record<string, unknown>>(() => props.modelValue ?? {})

function findConfig(name: string): ComponentConfig | undefined {
  return props.components.find(c => c.name === name)
}

function getModelValue(widgetId: string, key: string): unknown {
  return (formData.value as Record<string, Record<string, unknown>>)[widgetId]?.[key]
    ?? ''
}

function onUpdateModel(widgetId: string, key: string, value: unknown) {
  const current = { ...(formData.value as Record<string, Record<string, unknown>>) }
  current[widgetId] = { ...(current[widgetId] ?? {}), [key]: value }
  emit('update:modelValue', current)
}

/** Build props for a rendered widget, wiring model updates */
function buildProps(widgetId: string, config: ComponentConfig, staticProps: Record<string, unknown>, models: Record<string, unknown>) {
  const result: Record<string, unknown> = { ...staticProps }

  for (const key of Object.keys(models)) {
    // Live value from formData, fall back to schema default
    result[key] = (formData.value as Record<string, Record<string, unknown>>)[widgetId]?.[key] ?? models[key]

    // Vue 3 v-model convention: modelValue → onUpdate:modelValue
    const eventKey = key === 'modelValue' ? 'onUpdate:modelValue' : `onUpdate:${key}`
    result[eventKey] = (v: unknown) => onUpdateModel(widgetId, key, v)
  }

  return result
}
</script>

<template>
  <div class="lc-renderer">
    <template v-for="widget in schema.widgets" :key="widget.id">
      <template v-if="findConfig(widget.name)">
        <component
          :is="findConfig(widget.name)!.component"
          v-bind="buildProps(widget.id, findConfig(widget.name)!, widget.props, widget.models)"
        >{{ widget.slotContent ?? '' }}</component>
      </template>
    </template>
  </div>
</template>

<style scoped>
.lc-renderer {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-start;
}
</style>

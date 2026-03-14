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
  () => (props.modelValue ?? {}) as Record<string, unknown>,
)

/** All known configs: built-in layouts + user components + slot-specific components */
const allConfigs = computed<ComponentConfig[]>(() => {
  const base = [...builtinLayouts, ...props.components]
  const known = new Set(base.map((c) => c.name))
  const extra: ComponentConfig[] = []
  for (const cfg of base) {
    for (const slot of cfg.slots ?? []) {
      for (const sc of slot.components ?? []) {
        if (!known.has(sc.name)) {
          known.add(sc.name)
          extra.push(sc)
        }
      }
    }
  }
  return [...base, ...extra]
})

function getConfig(name: string): ComponentConfig | undefined {
  return allConfigs.value.find((c) => c.name === name)
}

function getFormData() {
  return formData.value
}

function updateModel(fieldName: string, value: unknown) {
  const current = { ...formData.value }
  current[fieldName] = value
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

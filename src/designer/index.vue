<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ComponentConfig, FormSchema, WidgetSchema } from '../types'
import PaletteList from './components/list.vue'
import DesignerCanvas from './canvas/index.vue'
import PropertiesPanel from './properties/index.vue'

const props = defineProps<{
  components: ComponentConfig[]
  modelValue?: FormSchema
}>()

const emit = defineEmits<{
  'update:modelValue': [schema: FormSchema]
}>()

const schema = computed<FormSchema>({
  get: () => props.modelValue ?? { widgets: [] },
  set: (v) => emit('update:modelValue', v),
})

const selectedId = ref<string | null>(null)

const selectedWidget = computed<WidgetSchema | null>(
  () => schema.value.widgets.find(w => w.id === selectedId.value) ?? null,
)

const selectedConfig = computed<ComponentConfig | null>(
  () => props.components.find(c => c.name === selectedWidget.value?.name) ?? null,
)

function onUpdateWidget(updated: WidgetSchema) {
  schema.value = {
    widgets: schema.value.widgets.map(w => (w.id === updated.id ? updated : w)),
  }
}
</script>

<template>
  <article class="lc-designer">
    <aside class="lc-designer-panel lc-panel-left">
      <PaletteList :components="components" />
    </aside>
    <section class="lc-designer-canvas">
      <DesignerCanvas
        :schema="schema"
        :components="components"
        :selected-id="selectedId"
        @update:schema="(v) => (schema = v)"
        @update:selected-id="(v) => (selectedId = v)"
      />
    </section>
    <aside class="lc-designer-panel lc-panel-right">
      <PropertiesPanel
        :widget="selectedWidget"
        :config="selectedConfig"
        @update:widget="onUpdateWidget"
      />
    </aside>
  </article>
</template>

<style scoped>
.lc-designer {
  display: flex;
  height: 100%;
  min-height: 500px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.lc-designer-panel {
  flex: 0 0 200px;
  overflow: hidden;
}
.lc-panel-left {
  border-right: 1px solid #dcdfe6;
}
.lc-panel-right {
  border-left: 1px solid #dcdfe6;
}
.lc-designer-canvas {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}
</style>

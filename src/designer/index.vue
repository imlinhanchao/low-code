<script setup lang="ts">
import { ref, computed, provide } from 'vue'
import type { ComponentConfig, FormSchema, WidgetSchema, SlotConfig, PropConfig } from '../types'
import { isPropConfig } from '../types'
import PaletteList from './components/list.vue'
import DesignerCanvas from './canvas/index.vue'
import PropertiesPanel from './properties/index.vue'
import { builtinLayouts } from '../layouts/index'

// ── Props / emits ────────────────────────────────────────────────────────────
const props = defineProps<{
  components: ComponentConfig[]
  modelValue?: FormSchema
}>()

const emit = defineEmits<{
  'update:modelValue': [schema: FormSchema]
}>()

// ── Schema (v-model) ─────────────────────────────────────────────────────────
const schema = computed<FormSchema>({
  get: () => props.modelValue ?? { widgets: [] },
  set: (v) => emit('update:modelValue', v),
})

// ── Selection ────────────────────────────────────────────────────────────────
const selectedId = ref<string | null>(null)

// ── All configs: built-in layouts + user components + slot-specific components ─
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

/** Components that only appear inside specific slots (e.g. ElOption inside ElSelect) */
const slotOnlyComponents = computed<ComponentConfig[]>(() => {
  const topNames = new Set([...builtinLayouts, ...props.components].map((c) => c.name))
  return allConfigs.value.filter((c) => !topNames.has(c.name))
})

// ── Tree helpers ─────────────────────────────────────────────────────────────
function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}

/** Extract the runtime default value from a prop descriptor (or plain value for layouts). */
function getPropDefaultValue(v: unknown): unknown {
  if (!isPropConfig(v)) return v           // plain primitive (layout props)
  const cfg = v as PropConfig
  if (cfg.default !== undefined) return cfg.default
  if (cfg.type === Boolean) return false
  if (cfg.type === Number) return 0
  return ''   // String / Function props start empty
}

function buildWidget(config: ComponentConfig): WidgetSchema {
  const propValues: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(config.props ?? {})) {
    propValues[k] = getPropDefaultValue(v)
  }
  return {
    id: generateId(),
    name: config.name,
    category: config.category ?? 'widget',
    props: propValues,
    models: { ...(config.models ?? {}) },
    // Seed slotContent for non-layout widgets that expose a 'default' slot
    // (e.g. buttons show their label as initial text; users can replace it by
    // dropping widgets into the slot, which takes precedence in the renderer).
    slotContent:
      config.category !== 'layout' && config.slots?.some((s) => s.name === 'default')
        ? config.name
        : undefined,
    events: Object.fromEntries(Object.keys(config.events ?? {}).map((k) => [k, ''])),
    slots: {},
  }
}

function updateInTree(
  widgets: WidgetSchema[],
  id: string,
  updater: (w: WidgetSchema) => WidgetSchema,
): WidgetSchema[] {
  return widgets.map((w) => {
    if (w.id === id) return updater(w)
    const newSlots: Record<string, WidgetSchema[]> = {}
    for (const [slot, children] of Object.entries(w.slots)) {
      newSlots[slot] = updateInTree(children, id, updater)
    }
    return { ...w, slots: newSlots }
  })
}

function removeFromTree(widgets: WidgetSchema[], id: string): WidgetSchema[] {
  return widgets
    .filter((w) => w.id !== id)
    .map((w) => {
      const newSlots: Record<string, WidgetSchema[]> = {}
      for (const [slot, children] of Object.entries(w.slots)) {
        newSlots[slot] = removeFromTree(children, id)
      }
      return { ...w, slots: newSlots }
    })
}

function findInTree(widgets: WidgetSchema[], id: string): WidgetSchema | null {
  for (const w of widgets) {
    if (w.id === id) return w
    for (const children of Object.values(w.slots)) {
      const found = findInTree(children, id)
      if (found) return found
    }
  }
  return null
}

// ── Provided operations ───────────────────────────────────────────────────────
function addWidget(
  parentId: string | null,
  slotName: string | null,
  config: ComponentConfig,
): void {
  const widget = buildWidget(config)
  if (parentId === null) {
    schema.value = { widgets: [...schema.value.widgets, widget] }
  } else {
    schema.value = {
      widgets: updateInTree(schema.value.widgets, parentId, (parent) => ({
        ...parent,
        slots: {
          ...parent.slots,
          [slotName!]: [...(parent.slots[slotName!] ?? []), widget],
        },
      })),
    }
  }
  selectedId.value = widget.id
}

function removeWidget(widgetId: string): void {
  schema.value = { widgets: removeFromTree(schema.value.widgets, widgetId) }
  if (selectedId.value === widgetId) selectedId.value = null
}

function selectWidget(widgetId: string | null): void {
  selectedId.value = widgetId
}

function updateWidget(updated: WidgetSchema): void {
  schema.value = {
    widgets: updateInTree(schema.value.widgets, updated.id, () => updated),
  }
}

function reorderSlotChildren(
  parentId: string,
  slotName: string,
  fromIdx: number,
  toIdx: number,
): void {
  schema.value = {
    widgets: updateInTree(schema.value.widgets, parentId, (parent) => {
      const children = [...(parent.slots[slotName] ?? [])]
      const [item] = children.splice(fromIdx, 1)
      children.splice(toIdx, 0, item)
      return { ...parent, slots: { ...parent.slots, [slotName]: children } }
    }),
  }
}

provide('lc:addWidget', addWidget)
provide('lc:removeWidget', removeWidget)
provide('lc:selectWidget', selectWidget)
provide('lc:selectedId', selectedId)
provide('lc:allConfigs', allConfigs)
provide('lc:reorderSlotChildren', reorderSlotChildren)

// ── Properties panel data ─────────────────────────────────────────────────────
const selectedWidget = computed<WidgetSchema | null>(() =>
  selectedId.value ? findInTree(schema.value.widgets, selectedId.value) : null,
)

const selectedConfig = computed<ComponentConfig | null>(
  () => allConfigs.value.find((c) => c.name === selectedWidget.value?.name) ?? null,
)

const effectiveSelectedSlots = computed<SlotConfig[]>(() => {
  if (!selectedConfig.value) return []
  if (selectedConfig.value.computeSlots) {
    return selectedConfig.value.computeSlots(selectedWidget.value?.props ?? {})
  }
  return selectedConfig.value.slots ?? []
})
</script>

<template>
  <article class="lc-designer">
    <aside class="lc-designer-panel lc-panel-left">
      <PaletteList :layouts="builtinLayouts" :components="components" :slot-only-components="slotOnlyComponents" />
    </aside>

    <section class="lc-designer-canvas">
      <DesignerCanvas :schema="schema" />
    </section>

    <aside class="lc-designer-panel lc-panel-right">
      <PropertiesPanel
        :widget="selectedWidget"
        :config="selectedConfig"
        :effective-slots="effectiveSelectedSlots"
        @update:widget="updateWidget"
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
  flex: 0 0 210px;
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

<script setup lang="ts">
import { ref, computed, provide, watch } from 'vue'
import type { ComponentConfig, ComponentGroup, FormSchema, GlobalConfig, WidgetSchema, SlotConfig, PropConfig } from '../types'
import { isPropConfig } from '../types'
import PaletteList from './components/list.vue'
import DesignerCanvas from './canvas/index.vue'
import PropertiesPanel from './properties/index.vue'

// ── Props / emits ────────────────────────────────────────────────────────────
const props = defineProps<{
  components: ComponentGroup[]
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

// ── Properties-panel view state (independent of canvas selection) ─────────────
/**
 * The widget id currently displayed in the properties panel.
 * Normally mirrors selectedId, but can be a slot-child id when the user
 * clicks "configure" on a slot child without moving the canvas focus.
 */
const viewingId = ref<string | null>(null)
/** History stack for the back-button in the properties panel */
const viewHistory = ref<string[]>([])

// Sync viewingId whenever the canvas selection changes
watch(selectedId, (id) => {
  viewHistory.value = []
  viewingId.value = id
})

/** Flat list of all user-supplied components (in group order) */
const flatComponents = computed<ComponentConfig[]>(() =>
  props.components.flatMap((g) => g.components),
)

// ── All configs: built-in layouts + user components + slot-specific components ─
const allConfigs = computed<ComponentConfig[]>(() => {
  const base = [...flatComponents.value]
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
  const topNames = new Set([...flatComponents.value].map((c) => c.name))
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
  // Props with no explicit default are left undefined so they aren't passed
  // to the component at all (avoids e.g. maxlength=0 blocking text input).
  return undefined
}

function buildWidget(config: ComponentConfig): WidgetSchema {
  const propValues: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(config.props ?? {})) {
    const val = getPropDefaultValue(v)
    if (val !== undefined) propValues[k] = val
  }
  const id = generateId()
  const modelKeys = Object.keys(config.models ?? {})
  // Auto-generate a field name per model key so form data is flat:
  // e.g. { modelValue: 'modelValue_abc' } → formData = { modelValue_abc: 'hello' }
  const fields: Record<string, string> | undefined = modelKeys.length > 0
    ? Object.fromEntries(modelKeys.map((k) => [k, `${k}_${id}`]))
    : undefined
  return {
    id,
    name: config.name,
    category: config.category ?? 'widget',
    fields,
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
  // Only switch selection to the new widget when it is NOT being added into
  // the currently focused component's slot — keep the parent focused in that case.
  if (parentId !== selectedId.value) {
    selectedId.value = widget.id
  }
}

function removeWidget(widgetId: string): void {
  schema.value = { widgets: removeFromTree(schema.value.widgets, widgetId) }
  if (selectedId.value === widgetId) selectedId.value = null
}

function selectWidget(widgetId: string | null): void {
  selectedId.value = widgetId
}

function updateWidget(updated: WidgetSchema): void {
  // Use viewingId as the "find" key so slot-child edits work correctly.
  const currentId = viewingId.value ?? selectedId.value
  if (!currentId) return
  const oldId = currentId
  schema.value = {
    widgets: updateInTree(schema.value.widgets, oldId, () => updated),
  }
  // Keep all view pointers updated when the widget id is renamed
  if (oldId !== updated.id) {
    if (viewingId.value === oldId) viewingId.value = updated.id
    if (selectedId.value === oldId) selectedId.value = updated.id
    viewHistory.value = viewHistory.value.map((hId) => (hId === oldId ? updated.id : hId))
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

function moveWidget(
  widgetId: string,
  newParentId: string | null,
  newSlotName: string | null,
): void {
  const widget = findInTree(schema.value.widgets, widgetId)
  if (!widget) return
  // Remove from current location first
  const newWidgets = removeFromTree(schema.value.widgets, widgetId)
  // Guard: if the target parent was inside the moved widget, abort
  if (newParentId !== null && !findInTree(newWidgets, newParentId)) return
  if (newParentId === null) {
    schema.value = { widgets: [...newWidgets, widget] }
  } else {
    schema.value = {
      widgets: updateInTree(newWidgets, newParentId, (parent) => ({
        ...parent,
        slots: {
          ...parent.slots,
          [newSlotName!]: [...(parent.slots[newSlotName!] ?? []), widget],
        },
      })),
    }
  }
  // Only switch selection to the moved widget when it is NOT being moved into
  // the currently focused component's slot — keep the parent focused in that case.
  if (newParentId !== selectedId.value) {
    selectedId.value = widget.id
  }
}


provide('lc:addWidget', addWidget)
provide('lc:moveWidget', moveWidget)
provide('lc:removeWidget', removeWidget)
provide('lc:selectWidget', selectWidget)
provide('lc:selectedId', selectedId)
provide('lc:allConfigs', allConfigs)
provide('lc:reorderSlotChildren', reorderSlotChildren)
provide('lc:schema', schema)

// ── Properties-panel navigation (slot-child view without canvas focus change) ─
/**
 * Open the properties panel for a widget without changing the canvas selection.
 * Pushes the current viewingId onto the history stack so the back button works.
 */
function viewWidget(widgetId: string): void {
  if (viewingId.value !== null) {
    viewHistory.value = [...viewHistory.value, viewingId.value]
  }
  viewingId.value = widgetId
}

/** Navigate back to the previously-viewed widget (or to the canvas selection). */
function viewBack(): void {
  const history = viewHistory.value
  if (history.length === 0) {
    viewingId.value = selectedId.value
    return
  }
  viewingId.value = history[history.length - 1]
  viewHistory.value = history.slice(0, -1)
}

const hasViewHistory = computed(() => viewHistory.value.length > 0)

provide('lc:viewWidget', viewWidget)
provide('lc:viewBack', viewBack)

// ── Properties panel data ─────────────────────────────────────────────────────
const selectedWidget = computed<WidgetSchema | null>(() =>
  selectedId.value ? findInTree(schema.value.widgets, selectedId.value) : null,
)

const selectedConfig = computed<ComponentConfig | null>(
  () => allConfigs.value.find((c) => c.name === selectedWidget.value?.name) ?? null,
)

/** Widget currently shown in the properties panel (may differ from canvas selection) */
const viewingWidget = computed<WidgetSchema | null>(() =>
  viewingId.value ? findInTree(schema.value.widgets, viewingId.value) : null,
)

const viewingConfig = computed<ComponentConfig | null>(
  () => allConfigs.value.find((c) => c.name === viewingWidget.value?.name) ?? null,
)

const effectiveViewingSlots = computed<SlotConfig[]>(() => {
  if (!viewingConfig.value) return []
  if (viewingConfig.value.computeSlots) {
    return viewingConfig.value.computeSlots(viewingWidget.value?.props ?? {})
  }
  return viewingConfig.value.slots ?? []
})

const globalConfig = computed<GlobalConfig>(() => schema.value.global ?? {})

function updateGlobalConfig(global: GlobalConfig) {
  schema.value = { ...schema.value, global }
}
</script>

<template>
  <article class="lc-designer">
    <aside class="lc-designer-panel lc-panel-left">
      <PaletteList :groups="components" />
    </aside>

    <section class="lc-designer-canvas">
      <DesignerCanvas :schema="schema" />
    </section>

    <aside class="lc-designer-panel lc-panel-right">
      <PropertiesPanel
        :widget="viewingWidget"
        :config="viewingConfig"
        :effective-slots="effectiveViewingSlots"
        :global-config="globalConfig"
        :has-back-button="hasViewHistory"
        @update:widget="updateWidget"
        @update:global-config="updateGlobalConfig"
      />
    </aside>
  </article>
</template>


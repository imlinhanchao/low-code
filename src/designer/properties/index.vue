<script setup lang="ts">
import { computed, inject, ref, watch, type Component, type Ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useI18n } from '../i18n'
import type { ComponentConfig, EventParam, FormSchema, GlobalConfig, ComponentProp, SlotConfig, WidgetSchema } from '../../types'
import { isPropConfig, resolveSlotName } from '../../types'
import GlobalConfigPanel from './GlobalConfigPanel.vue'
import { draggingConfig } from '../useDragState'

const allConfigs = inject<Ref<ComponentConfig[]>>('lc:allConfigs')
const { t, getLocale, tt } = useI18n()

const props = defineProps<{
  widget: WidgetSchema | null
  config: ComponentConfig | null
  effectiveSlots: SlotConfig[]
  globalConfig: GlobalConfig
  hasBackButton?: boolean
}>()

const emit = defineEmits<{
  'update:widget': [widget: WidgetSchema]
  'update:globalConfig': [config: GlobalConfig]
}>()

// ── Tab state ────────────────────────────────────────────────────────────────

const activeTab = ref<'props' | 'global'>('props')

// Switch to properties tab when a new widget is selected
watch(() => props.widget, (w) => {
  if (w) activeTab.value = 'props'
  idError.value = ''
})

const selectWidget = inject<(id: string | null) => void>('lc:selectWidget')
const viewWidget = inject<(id: string) => void>('lc:viewWidget')
const viewBack = inject<() => void>('lc:viewBack')
const addWidget = inject<(parentId: string | null, slotName: string | null, cfg: ComponentConfig) => void>('lc:addWidget')
const schema = inject<Ref<FormSchema>>('lc:schema')

// ── Widget ID editing ─────────────────────────────────────────────────────────

const idError = ref('')

function collectWidgetIds(widgets: WidgetSchema[]): Set<string> {
  const ids = new Set<string>()
  for (const w of widgets) {
    ids.add(w.id)
    for (const children of Object.values(w.slots)) {
      for (const id of collectWidgetIds(children)) ids.add(id)
    }
  }
  return ids
}

const allWidgetIds = computed<Set<string>>(() =>
  collectWidgetIds(schema?.value?.widgets ?? []),
)

function handleIdChange(newId: string) {
  if (!props.widget) return
  const trimmed = newId.trim()
  if (!trimmed) {
    idError.value = t('designer.idRequired')
    return
  }
  if (trimmed === props.widget.id) {
    idError.value = ''
    return
  }
  if (allWidgetIds.value.has(trimmed)) {
    idError.value = t('designer.idOccupied', { id: trimmed })
    return
  }
  idError.value = ''
  emit('update:widget', { ...props.widget, id: trimmed })
}

function updateModelField(modelKey: string, fieldName: string) {
  if (!props.widget) return
  const newFields = { ...(props.widget.fields ?? {}) }
  const trimmed = fieldName.trim()
  if (trimmed) {
    newFields[modelKey] = trimmed
  } else {
    delete newFields[modelKey]
  }
  emit('update:widget', { ...props.widget, fields: newFields })
}

function updateModelSource(modelKey: string, source: string) {
  if (!props.widget) return
  const newSources = { ...(props.widget.sources ?? {}) }
  if (source && source !== '$model') {
    newSources[modelKey] = source
  } else {
    delete newSources[modelKey]
  }
  emit('update:widget', { ...props.widget, sources: newSources })
}

function updateProp(key: string, value: unknown) {
  if (!props.widget) return
  const newProps = { ...props.widget.props }
  if (value === undefined) {
    delete newProps[key]
  } else {
    newProps[key] = value
  }
  emit('update:widget', { ...props.widget, props: newProps })
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

function removeSlotChild(slotName: string, childId: string) {
  if (!props.widget) return
  emit('update:widget', {
    ...props.widget,
    slots: {
      ...props.widget.slots,
      [slotName]: (props.widget.slots[slotName] ?? []).filter((c) => c.id !== childId),
    },
  })
}

// ── Drag-to-reorder / cross-slot state for slot children ─────────────────────
const dragFromSlot = ref<string | null>(null)
const dragFromIdx  = ref(-1)
const dragOverSlot = ref<string | null>(null)
const dragOverIdx  = ref(-1)

function onSlotChildDragStart(slotName: string, idx: number, e: DragEvent) {
  dragFromSlot.value = slotName
  dragFromIdx.value  = idx
  dragOverSlot.value = slotName
  dragOverIdx.value  = idx
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
}

/**
 * Dragover on a specific child row.
 * For slot-child drags: accept and update drop position (supports cross-slot).
 * For palette drags: do nothing so the event bubbles to the slot section.
 */
function onSlotChildDragOver(slotName: string, idx: number, e: DragEvent) {
  if (dragFromSlot.value === null) return
  e.preventDefault()
  e.stopPropagation()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
  dragOverSlot.value = slotName
  dragOverIdx.value  = idx
}

/**
 * Drop on a specific child row.
 * For slot-child drags: reorder within slot or move across slots.
 * For palette drags: do nothing (let it bubble to slot section).
 */
function onSlotChildDrop(slotName: string, idx: number, e: DragEvent) {
  if (dragFromSlot.value === null) return
  e.preventDefault()
  e.stopPropagation()
  const from     = dragFromIdx.value
  const fromSlot = dragFromSlot.value
  resetDrag()
  if (!props.widget) return
  if (fromSlot === slotName) {
    // Same-slot reorder
    if (from === idx) return
    const children = [...(props.widget.slots[slotName] ?? [])]
    const [item] = children.splice(from, 1)
    children.splice(idx, 0, item)
    emit('update:widget', {
      ...props.widget,
      slots: { ...props.widget.slots, [slotName]: children },
    })
  } else {
    // Cross-slot move: insert before idx in target slot
    const fromChildren = [...(props.widget.slots[fromSlot] ?? [])]
    const [item] = fromChildren.splice(from, 1)
    const toChildren = [...(props.widget.slots[slotName] ?? [])]
    toChildren.splice(idx, 0, item)
    emit('update:widget', {
      ...props.widget,
      slots: { ...props.widget.slots, [fromSlot]: fromChildren, [slotName]: toChildren },
    })
  }
}

function resetDrag() {
  dragFromSlot.value = null
  dragFromIdx.value  = -1
  dragOverSlot.value = null
  dragOverIdx.value  = -1
}

/**
 * Computes the display name for a slot child widget using the ComponentConfig.slotName
 * field.  Falls back to `child.name` when slotName is not defined or returns a falsy value.
 */
function getSlotChildDisplayName(child: WidgetSchema): string {
  const cfg = allConfigs?.value?.find((c) => c.name === child.name)
  if (!cfg) return child.name
  return resolveSlotName(cfg, child.props)
}

// ── Slot section drag handlers (palette drops + cross-slot appends) ───────────

/** Track which slot section is being hovered during a palette drag */
const slotDropOver = ref<string | null>(null)

/** Returns false when the dragged config is not accepted by the given slot */
function isSlotAccepted(slotName: string): boolean {
  if (!draggingConfig.value) return false
  const slot = props.effectiveSlots.find((s) => s.name === slotName)
  if (!slot) return false
  const accept = slot.components?.map((c) => c.name) ?? []
  return accept.length === 0 || accept.includes(draggingConfig.value.name)
}

/**
 * Dragover on the slot section container.
 * Fires when hovering over the section area itself (child rows stop propagation).
 */
function onSlotSectionDragOver(slotName: string, e: DragEvent) {
  if (dragFromSlot.value !== null) {
    // Slot-child drag: accept append-to-end
    e.preventDefault()
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
    dragOverSlot.value = slotName
    dragOverIdx.value = (props.widget?.slots[slotName] ?? []).length
    return
  }
  // Palette drag
  if (!isSlotAccepted(slotName)) return
  e.preventDefault()
  slotDropOver.value = slotName
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
}

function onSlotSectionDragLeave(slotName: string, e: DragEvent) {
  const rel = e.relatedTarget as HTMLElement | null
  const cur = e.currentTarget as HTMLElement | null
  if (cur && rel && cur.contains(rel)) return
  if (dragFromSlot.value !== null) {
    if (dragOverSlot.value === slotName) {
      dragOverSlot.value = null
      dragOverIdx.value  = -1
    }
  } else {
    if (slotDropOver.value === slotName) slotDropOver.value = null
  }
}

function onSlotSectionDrop(slotName: string, e: DragEvent) {
  if (dragFromSlot.value !== null) {
    // Slot-child drag: append to end of target slot
    e.preventDefault()
    const from     = dragFromIdx.value
    const fromSlot = dragFromSlot.value
    resetDrag()
    if (!props.widget) return
    // Allow same-slot append (move to end) only when item is not already last
    const sameSlot = fromSlot === slotName
    const lastIdx = (props.widget.slots[fromSlot] ?? []).length - 1
    if (sameSlot && from === lastIdx) return
    const fromChildren = [...(props.widget.slots[fromSlot] ?? [])]
    const [item] = fromChildren.splice(from, 1)
    if (sameSlot) {
      emit('update:widget', {
        ...props.widget,
        slots: { ...props.widget.slots, [slotName]: [...fromChildren, item] },
      })
    } else {
      const toChildren = [...(props.widget.slots[slotName] ?? []), item]
      emit('update:widget', {
        ...props.widget,
        slots: { ...props.widget.slots, [fromSlot]: fromChildren, [slotName]: toChildren },
      })
    }
    return
  }
  // Palette drop
  e.preventDefault()
  slotDropOver.value = null
  if (!draggingConfig.value || !props.widget) return
  if (!isSlotAccepted(slotName)) return
  addWidget?.(props.widget.id, slotName, draggingConfig.value)
  draggingConfig.value = null
}

function updateEvent(key: string, value: string) {
  if (!props.widget) return
  emit('update:widget', {
    ...props.widget,
    events: { ...(props.widget.events ?? {}), [key]: value },
  })
}

function valueToString(v: unknown): string {
  return v == null ? '' : String(v)
}

/** Show the slotContent editor for leaf widgets that still use slotContent */
const showSlotContent = computed(
  () =>
    props.config?.category !== 'layout' &&
    props.widget?.slotContent !== undefined &&
    !(props.widget?.slots['default'] ?? []).length,
)

/** Config prop entries as [key, value] – value may be a ComponentProp or a plain primitive */
const configPropEntries = computed(() => Object.entries(props.config?.props ?? {}))

/** Event entries from config, if any */
const configEvents = computed(() => Object.entries(props.config?.events ?? {}))

// ── Type helpers for template use ────────────────────────────────────────────

function propKind(v: unknown): 'boolean' | 'select' | 'function' | 'number' | 'object' | 'object-sub' | 'object-json' | 'array-items' | 'array-json' | 'multiline' | 'string' {
  if (!isPropConfig(v)) return 'string'
  const cfg = v as ComponentProp
  if (cfg.type === Boolean) return 'boolean'
  if (cfg.type === Function) return 'function'
  if (cfg.type === Object) {
    if (cfg.dialog) return 'object'
    return cfg.props ? 'object-sub' : 'object-json'
  }
  if (cfg.type === Array) {
    return cfg.item ? 'array-items' : 'array-json'
  }
  if (cfg.type === Number) return 'number'
  if (cfg.options?.length) return 'select'
  if (cfg.multiline) return 'multiline'
  return 'string'
}

function propLabel(key: string, v: unknown): string {
  if (isPropConfig(v)) {
    const label = (v as ComponentProp).label
    if (typeof label === 'object' && label !== null) {
      return label[getLocale()] || label['en-US'] || Object.values(label)[0]
    }
    return (label as string) ?? key
  }
  return key
}

function resolveLabel(label: string | Record<string, string> | undefined, fallback: string): string {
  if (!label) return fallback
  if (typeof label === 'object' && label !== null) {
    return label[getLocale()] || label['en-US'] || Object.values(label)[0]
  }
  return label
}

function propOptions(v: unknown): string[] {
  if (isPropConfig(v)) return (v as ComponentProp).options ?? []
  return []
}

function propTooltip(key: string, v: unknown): string {
  if (isPropConfig(v)) return (v as ComponentProp).tooltip ?? ''
  return ''
}

// ── Code-editor dialog ────────────────────────────────────────────────────────

interface CodeDialogState {
  title: string
  /** Displayed as the function signature line */
  signature: string
  code: string
  fullscreen: boolean
  onApply: (code: string) => void
}

const codeDialog = ref<CodeDialogState | null>(null)

function openFunctionPropDialog(key: string, v: unknown) {
  const cfg = v as ComponentProp
  const paramNames = cfg.params?.map((p: EventParam) => p.name) ?? []
  codeDialog.value = {
    title: `函数属性: ${cfg.label ?? key}`,
    signature: `${key}(${paramNames.join(', ')})`,
    code: valueToString(props.widget?.props[key]),
    fullscreen: false,
    onApply: (code) => updateProp(key, code),
  }
}

function openEventCodeDialog(eventName: string, params: EventParam[]) {
  codeDialog.value = {
    title: `事件处理: ${eventName}`,
    signature: `${eventName}(${params.map((p) => p.name).join(', ')})`,
    code: props.widget?.events?.[eventName] ?? '',
    fullscreen: false,
    onApply: (code) => updateEvent(eventName, code),
  }
}

function applyCode() {
  if (!codeDialog.value) return
  codeDialog.value.onApply(codeDialog.value.code)
  codeDialog.value = null
}

function closeCodeDialog() {
  codeDialog.value = null
}

function updateCodeDialogText(code: string) {
  if (codeDialog.value) codeDialog.value.code = code
}

function isFnPropSet(key: string): boolean {
  const v = props.widget?.props[key]
  return typeof v === 'string' && v.trim().length > 0
}

function isEventSet(eventName: string): boolean {
  return !!(props.widget?.events?.[eventName]?.trim())
}

// ── Object-prop dialog ────────────────────────────────────────────────────────

interface ObjectDialogState {
  title: string
  dialogComponent: Component
  modelValue: unknown
  fullscreen: boolean
  onApply: (value: unknown) => void
}

const objectDialog = ref<ObjectDialogState | null>(null)

function openObjectPropDialog(key: string, v: unknown) {
  const cfg = v as ComponentProp
  if (!cfg.dialog) return
  objectDialog.value = {
    title: `编辑: ${cfg.label ?? key}`,
    dialogComponent: cfg.dialog as Component,
    modelValue: props.widget?.props[key] ?? cfg.default ?? null,
    fullscreen: false,
    onApply: (value) => updateProp(key, value),
  }
}

function applyObjectDialog() {
  if (!objectDialog.value) return
  objectDialog.value.onApply(objectDialog.value.modelValue)
  objectDialog.value = null
}

function closeObjectDialog() {
  objectDialog.value = null
}

function isObjectPropSet(key: string): boolean {
  const v = props.widget?.props[key]
  return v != null && (typeof v !== 'object' || Object.keys(v as object).length > 0)
}

// ── JSON editor dialog (for Object/Array props without schema) ─────────────────

interface JsonDialogState {
  title: string
  text: string
  fullscreen: boolean
  onApply: (value: unknown) => void
  error: string
}

const jsonDialog = ref<JsonDialogState | null>(null)

function openJsonPropDialog(key: string, cfg: ComponentProp) {
  const current = props.widget?.props[key] ?? cfg.default ?? (cfg.type === Array ? [] : {})
  jsonDialog.value = {
    title: `编辑: ${cfg.label ?? key}`,
    text: JSON.stringify(current, null, 2),
    fullscreen: false,
    onApply: (value) => updateProp(key, value),
    error: '',
  }
}

function openArrayItemJsonDialog(key: string, idx: number, item: unknown) {
  jsonDialog.value = {
    title: `编辑项目 ${idx + 1}`,
    text: JSON.stringify(item ?? {}, null, 2),
    fullscreen: false,
    onApply: (value) => updateArrayItem(key, idx, value),
    error: '',
  }
}

function applyJsonDialog() {
  if (!jsonDialog.value) return
  try {
    const value = JSON.parse(jsonDialog.value.text)
    jsonDialog.value.onApply(value)
    jsonDialog.value = null
  } catch (e) {
    jsonDialog.value!.error = `无效的 JSON 格式: ${(e as Error).message}`
  }
}

function closeJsonDialog() {
  jsonDialog.value = null
}

function isComplexPropSet(key: string): boolean {
  const v = props.widget?.props[key]
  if (v == null) return false
  if (Array.isArray(v)) return v.length > 0
  if (typeof v === 'object') return Object.keys(v as object).length > 0
  return false
}

// ── Object sub-prop helpers ───────────────────────────────────────────────────

function getSubPropValue(key: string, subKey: string): unknown {
  const obj = props.widget?.props[key]
  if (obj != null && typeof obj === 'object' && !Array.isArray(obj)) {
    return (obj as Record<string, unknown>)[subKey]
  }
  return undefined
}

function updateSubProp(key: string, subKey: string, value: unknown) {
  const current = (props.widget?.props[key] as Record<string, unknown>) ?? {}
  const updated = { ...current }
  if (value === undefined || value === '') {
    delete updated[subKey]
  } else {
    updated[subKey] = value
  }
  updateProp(key, updated)
}

// ── Array item helpers ────────────────────────────────────────────────────────

function getArrayItems(key: string): unknown[] {
  const v = props.widget?.props[key]
  return Array.isArray(v) ? v : []
}

function addArrayItem(key: string, cfg: ComponentProp) {
  const items = [...getArrayItems(key)]
  const itemCfg = cfg.item
  if (!itemCfg || itemCfg.type === Object) {
    const defaultItem: Record<string, unknown> = {}
    if (itemCfg?.props) {
      for (const [k, v] of Object.entries(itemCfg.props)) {
        if (v.default !== undefined) defaultItem[k] = v.default
      }
    }
    items.push(defaultItem)
  } else if (itemCfg.type === Boolean) {
    items.push(false)
  } else if (itemCfg.type === Number) {
    items.push(itemCfg.default ?? 0)
  } else {
    items.push(itemCfg.default ?? '')
  }
  updateProp(key, items)
}

function removeArrayItem(key: string, idx: number) {
  const items = [...getArrayItems(key)]
  items.splice(idx, 1)
  updateProp(key, items)
}

function updateArrayItem(key: string, idx: number, value: unknown) {
  const items = [...getArrayItems(key)]
  items[idx] = value
  updateProp(key, items)
}

function updateArrayItemField(key: string, idx: number, fieldKey: string, value: unknown) {
  const items = [...getArrayItems(key)]
  const item =
    typeof items[idx] === 'object' && items[idx] !== null
      ? { ...(items[idx] as Record<string, unknown>) }
      : {}
  if (value === undefined || value === '') {
    delete item[fieldKey]
  } else {
    item[fieldKey] = value
  }
  items[idx] = item
  updateProp(key, items)
}

/** Safely casts an unknown value to a Record for use in template expressions */
function asRecord(v: unknown): Record<string, unknown> {
  return (typeof v === 'object' && v !== null ? v : {}) as Record<string, unknown>
}
</script>

<template>
  <div class="lc-properties">
    <!-- Back button: shown when viewing a slot child's properties -->
    <div v-if="hasBackButton" class="lc-prop-back-row">
      <button class="lc-prop-back-btn" :title="t('designer.back')" @click="viewBack?.()">← {{ t('designer.back') }}</button>
    </div>
    <!-- Tab bar -->
    <div class="lc-prop-tabs">
      <button
        class="lc-prop-tab"
        :class="{ 'lc-prop-tab--active': activeTab === 'props' }"
        @click="activeTab = 'props'"
      >{{ t('designer.propsPanel') }}</button>
      <button
        class="lc-prop-tab"
        :class="{ 'lc-prop-tab--active': activeTab === 'global' }"
        @click="activeTab = 'global'"
      >{{ t('designer.globalConfig') }}</button>
    </div>

    <!-- Properties tab -->
    <template v-if="activeTab === 'props'">
      <template v-if="widget && config">
        <div class="lc-properties-section">{{ tt(config.label) }}</div>

      <!-- Common attributes (always available for every widget) -->
      <div class="lc-properties-group-label">公共</div>
      <div class="lc-prop-row">
        <label class="lc-prop-label" title="id">{{ t('designer.widgetId') }}</label>
        <input
          class="lc-prop-input"
          :class="{ 'lc-prop-input--error': idError }"
          :value="widget.id"
          title="在事件/全局方法中通过 $getRefs(id) 访问此组件实例"
          @change="handleIdChange(($event.target as HTMLInputElement).value)"
          @input="idError = ''"
        />
      </div>
      <div v-if="idError" class="lc-prop-error">{{ idError }}</div>
      <div class="lc-prop-row">
        <label class="lc-prop-label" title="class">CSS类名</label>
        <input
          class="lc-prop-input"
          :value="(widget.props['class'] as string) ?? ''"
          placeholder="class1 class2"
          @input="updateProp('class', ($event.target as HTMLInputElement).value || undefined)"
        />
      </div>
      <div class="lc-prop-row">
        <label class="lc-prop-label" title="hidden">隐藏</label>
        <label class="lc-prop-checkbox-wrap">
          <input
            type="checkbox"
            :checked="!!widget.props['hidden']"
            @change="updateProp('hidden', ($event.target as HTMLInputElement).checked || undefined)"
          />
        </label>
      </div>
      <div v-if="widget.category === 'widget' && Object.keys(widget.models).length > 0" class="lc-prop-row">
        <label class="lc-prop-label" title="readonly">只读</label>
        <label class="lc-prop-checkbox-wrap">
          <input
            type="checkbox"
            :checked="!!widget.props['readonly']"
            @change="updateProp('readonly', ($event.target as HTMLInputElement).checked || undefined)"
          />
        </label>
      </div>

      <!-- Props (type-aware) -->
      <template v-if="configPropEntries.length">
        <div class="lc-properties-group-label">属性</div>
        <template
          v-for="[key, cfgVal] in configPropEntries"
          :key="'prop-' + key"
        >
          <!-- Object with sub-props: collapsible inline editor -->
          <details v-if="propKind(cfgVal) === 'object-sub'" class="lc-prop-block-group">
            <summary class="lc-prop-block-header">
              <span class="lc-prop-label">{{ propLabel(key, cfgVal) }}</span>
              <span v-if="propTooltip(key, cfgVal)" class="lc-prop-tooltip-icon" :data-tooltip="propTooltip(key, cfgVal)">ⓘ</span>
            </summary>
            <div class="lc-prop-block-body">
              <div
                v-for="[sk, sv] in Object.entries((cfgVal as ComponentProp).props!)"
                :key="sk"
                class="lc-prop-row"
              >
                <label class="lc-prop-label lc-prop-label--sub" :title="sk">{{ propLabel(sk, sv) }}</label>
                <span v-if="propTooltip(sk, sv)" class="lc-prop-tooltip-icon" :data-tooltip="propTooltip(sk, sv)">ⓘ</span>
                <label v-if="propKind(sv) === 'boolean'" class="lc-prop-checkbox-wrap">
                  <input
                    type="checkbox"
                    :checked="!!getSubPropValue(key, sk)"
                    @change="updateSubProp(key, sk, ($event.target as HTMLInputElement).checked)"
                  />
                </label>
                <select
                  v-else-if="propKind(sv) === 'select'"
                  class="lc-prop-input"
                  :value="valueToString(getSubPropValue(key, sk))"
                  @change="updateSubProp(key, sk, ($event.target as HTMLSelectElement).value)"
                >
                  <option value="">-- 请选择 --</option>
                  <option v-for="opt in propOptions(sv)" :key="opt" :value="opt">{{ opt }}</option>
                </select>
                <input
                  v-else-if="propKind(sv) === 'number'"
                  class="lc-prop-input"
                  type="number"
                  :value="getSubPropValue(key, sk) ?? ''"
                  @input="updateSubProp(key, sk, ($event.target as HTMLInputElement).value === '' ? undefined : Number(($event.target as HTMLInputElement).value))"
                />
                <textarea
                  v-else-if="propKind(sv) === 'multiline'"
                  class="lc-prop-input lc-prop-textarea"
                  :value="valueToString(getSubPropValue(key, sk))"
                  rows="3"
                  @input="updateSubProp(key, sk, ($event.target as HTMLTextAreaElement).value)"
                />
                <input
                  v-else
                  class="lc-prop-input"
                  :value="valueToString(getSubPropValue(key, sk))"
                  @input="updateSubProp(key, sk, ($event.target as HTMLInputElement).value)"
                />
              </div>
            </div>
          </details>

          <!-- Array with item type: collapsible list of items -->
          <details v-else-if="propKind(cfgVal) === 'array-items'" class="lc-prop-block-group">
            <summary class="lc-prop-block-header">
              <span class="lc-prop-label">{{ propLabel(key, cfgVal) }}</span>
              <span v-if="propTooltip(key, cfgVal)" class="lc-prop-tooltip-icon" :data-tooltip="propTooltip(key, cfgVal)">ⓘ</span>
              <button class="lc-arr-add-btn" title="添加项目" @click.stop.prevent="addArrayItem(key, cfgVal as ComponentProp)"><Icon icon="mdi:plus" /></button>
            </summary>
            <div class="lc-prop-block-body">
              <div v-if="!getArrayItems(key).length" class="lc-arr-empty">暂无项目</div>
              <div
                v-for="(arrItem, idx) in getArrayItems(key)"
                :key="idx"
                class="lc-arr-item" :class="{ 'lc-arr-item--complex': (cfgVal as ComponentProp).item?.props }"
              >
                <!-- Primitive item (Boolean / Number / String) -->
                <template v-if="(cfgVal as ComponentProp).item!.type !== Object">
                  <span class="lc-arr-item-idx">{{ (idx as number) + 1 }}</span>
                  <label v-if="(cfgVal as ComponentProp).item!.type === Boolean" class="lc-prop-checkbox-wrap">
                    <input
                      type="checkbox"
                      :checked="!!arrItem"
                      @change="updateArrayItem(key, idx, ($event.target as HTMLInputElement).checked)"
                    />
                  </label>
                  <input
                    v-else-if="(cfgVal as ComponentProp).item!.type === Number"
                    class="lc-prop-input"
                    type="number"
                    :value="(arrItem as number) ?? ''"
                    @input="updateArrayItem(key, idx, ($event.target as HTMLInputElement).value === '' ? undefined : Number(($event.target as HTMLInputElement).value))"
                  />
                  <input
                    v-else
                    class="lc-prop-input"
                    :value="valueToString(arrItem)"
                    @input="updateArrayItem(key, idx, ($event.target as HTMLInputElement).value)"
                  />
                  <button class="lc-arr-del-btn" title="删除" @click="removeArrayItem(key, idx)"><Icon icon="mdi:close" /></button>
                </template>

                <!-- Object item with sub-props: inline sub-fields -->
                <template v-else-if="(cfgVal as ComponentProp).item!.props">
                  <div class="lc-arr-item-header">
                    <span class="lc-arr-item-idx">{{ (idx as number) + 1 }}</span>
                    <button class="lc-arr-del-btn" title="删除" @click="removeArrayItem(key, idx)"><Icon icon="mdi:close" /></button>
                  </div>
                  <div class="lc-arr-item-body">
                    <div
                      v-for="[fk, fv] in Object.entries((cfgVal as ComponentProp).item!.props!)"
                      :key="fk"
                      class="lc-prop-row"
                    >
                      <label class="lc-prop-label lc-prop-label--sub" :title="fk">{{ propLabel(fk, fv) }}</label>
                      <span v-if="propTooltip(fk, fv)" class="lc-prop-tooltip-icon" :data-tooltip="propTooltip(fk, fv)">ⓘ</span>
                      <label v-if="propKind(fv) === 'boolean'" class="lc-prop-checkbox-wrap">
                        <input
                          type="checkbox"
                          :checked="!!asRecord(arrItem)[fk]"
                          @change="updateArrayItemField(key, idx, fk, ($event.target as HTMLInputElement).checked)"
                        />
                      </label>
                      <select
                        v-else-if="propKind(fv) === 'select'"
                        class="lc-prop-input"
                        :value="valueToString(asRecord(arrItem)[fk])"
                        @change="updateArrayItemField(key, idx, fk, ($event.target as HTMLSelectElement).value)"
                      >
                        <option value="">-- 请选择 --</option>
                        <option v-for="opt in propOptions(fv)" :key="opt" :value="opt">{{ opt }}</option>
                      </select>
                      <input
                        v-else-if="propKind(fv) === 'number'"
                        class="lc-prop-input"
                        type="number"
                        :value="asRecord(arrItem)[fk] ?? ''"
                        @input="updateArrayItemField(key, idx, fk, ($event.target as HTMLInputElement).value === '' ? undefined : Number(($event.target as HTMLInputElement).value))"
                      />
                      <input
                        v-else
                        class="lc-prop-input"
                        :value="valueToString(asRecord(arrItem)[fk])"
                        @input="updateArrayItemField(key, idx, fk, ($event.target as HTMLInputElement).value)"
                      />
                    </div>
                  </div>
                </template>

                <!-- Object item without props: JSON edit button -->
                <template v-else>
                  <span class="lc-arr-item-idx">{{ (idx as number) + 1 }}</span>
                  <button class="lc-fn-btn lc-fn-btn--set" @click="openArrayItemJsonDialog(key, idx, arrItem)">编辑 JSON</button>
                  <button class="lc-arr-del-btn" title="删除" @click="removeArrayItem(key, idx)"><Icon icon="mdi:close" /></button>
                </template>
              </div>
            </div>
          </details>

          <!-- Normal prop row for all other types (boolean, select, function, object, number, multiline, string, object-json, array-json) -->
          <div v-else class="lc-prop-row">
            <label class="lc-prop-label" :title="key">{{ propLabel(key, cfgVal) }}</label>
            <span v-if="propTooltip(key, cfgVal)" class="lc-prop-tooltip-icon" :data-tooltip="propTooltip(key, cfgVal)">ⓘ</span>

            <!-- Boolean checkbox -->
            <label v-if="propKind(cfgVal) === 'boolean'" class="lc-prop-checkbox-wrap">
              <input
                type="checkbox"
                :checked="!!widget.props[key]"
                @change="updateProp(key, ($event.target as HTMLInputElement).checked)"
              />
            </label>

            <!-- Enum select -->
            <select
              v-else-if="propKind(cfgVal) === 'select'"
              class="lc-prop-input"
              :value="valueToString(widget.props[key])"
              @change="updateProp(key, ($event.target as HTMLSelectElement).value)"
            >
              <option value="">-- 请选择 --</option>
              <option v-for="opt in propOptions(cfgVal)" :key="opt" :value="opt">{{ opt }}</option>
            </select>

            <!-- Function prop button -->
            <template v-else-if="propKind(cfgVal) === 'function'">
              <button
                class="lc-fn-btn"
                :class="{ 'lc-fn-btn--set': isFnPropSet(key) }"
                @click="openFunctionPropDialog(key, cfgVal)"
              >
                <span v-if="isFnPropSet(key)" class="lc-fn-dot" />
                编辑函数
              </button>
            </template>

            <!-- Object prop button (opens custom dialog component) -->
            <template v-else-if="propKind(cfgVal) === 'object'">
              <button
                class="lc-fn-btn"
                :class="{ 'lc-fn-btn--set': isObjectPropSet(key) }"
                @click="openObjectPropDialog(key, cfgVal)"
              >
                <span v-if="isObjectPropSet(key)" class="lc-fn-dot" />
                {{ isObjectPropSet(key) ? '已设置' : '设置' }}
              </button>
            </template>

            <!-- Object/Array without schema: JSON edit button -->
            <template v-else-if="propKind(cfgVal) === 'object-json' || propKind(cfgVal) === 'array-json'">
              <button
                class="lc-fn-btn"
                :class="{ 'lc-fn-btn--set': isComplexPropSet(key) }"
                @click="openJsonPropDialog(key, cfgVal as ComponentProp)"
              >
                <span v-if="isComplexPropSet(key)" class="lc-fn-dot" />
                {{ isComplexPropSet(key) ? '已设置' : '编辑 JSON' }}
              </button>
            </template>

            <!-- Number input -->
            <input
              v-else-if="propKind(cfgVal) === 'number'"
              class="lc-prop-input"
              type="number"
              :value="widget.props[key] ?? ''"
              @input="updateProp(key, ($event.target as HTMLInputElement).value === '' ? undefined : Number(($event.target as HTMLInputElement).value))"
            />

            <!-- Multiline string (e.g. HTML content) -->
            <textarea
              v-else-if="propKind(cfgVal) === 'multiline'"
              class="lc-prop-input lc-prop-textarea"
              :value="valueToString(widget.props[key])"
              rows="4"
              @input="updateProp(key, ($event.target as HTMLTextAreaElement).value)"
            />

            <!-- String / plain text (default) -->
            <input
              v-else
              class="lc-prop-input"
              :value="valueToString(widget.props[key])"
              @input="updateProp(key, ($event.target as HTMLInputElement).value)"
            />
          </div>
        </template>
      </template>

      <!-- Models (v-model bindings) — each model has a field name + default value -->
      <template v-if="Object.keys(widget.models).length">
        <div class="lc-properties-group-label">
          数据绑定
          <span
            class="lc-prop-tooltip-icon lc-prop-tooltip-icon--group"
            data-tooltip="字段名默认从 $model 读写。支持点语法指定嵌套对象：$model.section、$global.section（读写）；$scope.section 等嵌套作用域对象（读写，用于插槽内行数据）；$scope 本身只读"
          >ⓘ</span>
        </div>
        <div
          v-for="(val, key) in widget.models"
          :key="'model-' + key"
          class="lc-model-row"
        >
          <span class="lc-model-key">{{ key }}</span>
          <div class="lc-model-fields">
              <div class="lc-prop-row lc-model-field-row">
                <label class="lc-prop-label lc-prop-label--sub">数据源</label>
                <input
                  class="lc-prop-input"
                  :value="widget.sources?.[key] ?? '$model'"
                  placeholder="$model"
                  @change="updateModelSource(key as string, ($event.target as HTMLInputElement).value.trim())"
                />
              </div>
              <div class="lc-prop-row lc-model-field-row">
                <label class="lc-prop-label lc-prop-label--sub">字段名</label>
                <input
                  class="lc-prop-input"
                  :value="widget.fields?.[key] ?? ''"
                  placeholder="如: username"
                  @input="updateModelField(key, ($event.target as HTMLInputElement).value)"
                />
              </div>
              <div class="lc-prop-row lc-model-field-row">
                <label class="lc-prop-label lc-prop-label--sub">默认值</label>
                <input
                  class="lc-prop-input"
                  :value="valueToString(val)"
                  @input="updateModel(key, ($event.target as HTMLInputElement).value)"
                />
              </div>
            </div>
        </div>
      </template>

      <!-- Simple text content for the default slot (leaf widgets like buttons) -->
      <template v-if="showSlotContent">
        <div class="lc-properties-group-label">文本内容</div>
        <div class="lc-prop-row">
          <label class="lc-prop-label">内容</label>
          <input
            class="lc-prop-input"
            :value="widget.slotContent ?? ''"
            @input="updateSlotContent(($event.target as HTMLInputElement).value)"
          />
        </div>
      </template>

      <!-- Unified slot management: all slots, showing component blocks + drag support -->
      <template v-if="effectiveSlots.length > 0">
        <div class="lc-properties-group-label">{{ t('slots') }}</div>
        <div
          v-for="slot in effectiveSlots"
          :key="'slot-' + slot.name"
          class="lc-slot-section"
          :class="{
            'lc-slot-section--palette-over': slotDropOver === slot.name,
            'lc-slot-section--child-over':   dragOverSlot === slot.name && dragFromSlot !== null,
          }"
          @dragover="onSlotSectionDragOver(slot.name, $event)"
          @dragleave="onSlotSectionDragLeave(slot.name, $event)"
          @drop="onSlotSectionDrop(slot.name, $event)"
        >
          <div class="lc-slot-section-header">
            <span class="lc-slot-section-label">{{ resolveLabel(slot.label, slot.name) }}</span>
            <span class="lc-slot-section-count">{{ (widget.slots[slot.name] ?? []).length ? (widget.slots[slot.name] ?? []).length : t('empty') }}</span>
          </div>
          <!-- Children blocks (draggable within slot and across slots) -->
          <div
            v-for="(child, idx) in (widget.slots[slot.name] ?? [])"
            :key="child.id"
            class="lc-slot-child-row"
            :class="{
              'lc-slot-child-row--dragging':    dragFromSlot === slot.name && dragFromIdx === idx,
              'lc-slot-child-row--drop-before': dragOverSlot === slot.name && dragOverIdx === idx && (dragFromSlot !== slot.name || dragFromIdx > idx),
              'lc-slot-child-row--drop-after':  dragOverSlot === slot.name && dragOverIdx === idx && dragFromSlot === slot.name && dragFromIdx < idx,
            }"
            draggable="true"
            @dragstart="onSlotChildDragStart(slot.name, idx, $event)"
            @dragover="onSlotChildDragOver(slot.name, idx, $event)"
            @drop="onSlotChildDrop(slot.name, idx, $event)"
            @dragend="resetDrag"
          >
            <span class="lc-slot-child-drag-handle" title="拖拽排序">⠿</span>
            <span class="lc-slot-child-name">{{ getSlotChildDisplayName(child) }}</span>
            <button
              class="lc-slot-child-btn lc-slot-child-configure"
              title="组件设置"
              @click="viewWidget?.(child.id)"
            >⚙</button>
            <button
              class="lc-slot-child-btn lc-slot-child-remove"
              title="从插槽移除"
              @click="removeSlotChild(slot.name, child.id)"
            >✕</button>
          </div>
          <!-- Empty slot hint when no children -->
          <div
            v-if="!(widget.slots[slot.name] ?? []).length"
            class="lc-slot-empty-hint"
          >拖拽组件到此处</div>
        </div>
      </template>

      <!-- Events – button per event that opens the code dialog -->
      <template v-if="configEvents.length > 0">
        <div class="lc-properties-group-label">事件</div>
        <div
          v-for="[eventName, params] in configEvents"
          :key="'event-' + eventName"
          class="lc-event-row"
        >
          <span class="lc-event-name">{{ eventName }}({{ params.map(p => p.name).join(', ') }})</span>
          <button
            class="lc-fn-btn"
            :class="{ 'lc-fn-btn--set': isEventSet(eventName) }"
            @click="openEventCodeDialog(eventName, params)"
          >
            <span v-if="isEventSet(eventName)" class="lc-fn-dot" />
            {{ isEventSet(eventName) ? '已设置' : '设置处理器' }}
          </button>
        </div>
      </template>
      </template>

      <div v-else class="lc-properties-empty">请选择一个组件</div>
    </template>

    <!-- Global config tab -->
    <GlobalConfigPanel
      v-else
      :global-config="globalConfig"
      @update:global-config="emit('update:globalConfig', $event)"
    />

  </div>

  <!-- Code editor dialog (teleported to body to escape overflow/z-index constraints) -->
  <Teleport to="body">
    <div v-if="codeDialog" class="lc-code-backdrop" @click.self="closeCodeDialog">
      <div
        class="lc-code-dialog"
        :class="{ 'lc-code-dialog--fs': codeDialog.fullscreen }"
      >
        <div class="lc-code-dialog-header">
          <span class="lc-code-dialog-title">{{ codeDialog.title }}</span>
          <div class="lc-code-dialog-header-btns">
            <button
              class="lc-code-hdr-btn"
              :title="codeDialog.fullscreen ? '退出全屏' : '全屏编辑'"
              @click="codeDialog.fullscreen = !codeDialog.fullscreen"
            >{{ codeDialog.fullscreen ? '⊠' : '⊡' }}</button>
            <button class="lc-code-hdr-btn" title="关闭" @click="closeCodeDialog">✕</button>
          </div>
        </div>
        <div class="lc-code-signature">{{ codeDialog.signature }} {</div>
        <textarea
          class="lc-code-editor"
          placeholder="// 在此输入函数体"
          :value="codeDialog.code"
          @input="updateCodeDialogText(($event.target as HTMLTextAreaElement).value)"
        />
        <div class="lc-code-closing">}</div>
        <div class="lc-code-footer">
          <button class="lc-code-btn-primary" @click="applyCode">确 定</button>
          <button class="lc-code-btn" @click="closeCodeDialog">取 消</button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Object prop dialog (teleported to body) -->
  <Teleport to="body">
    <div v-if="objectDialog" class="lc-code-backdrop" @click.self="closeObjectDialog">
      <div
        class="lc-code-dialog lc-object-dialog"
        :class="{ 'lc-code-dialog--fs': objectDialog.fullscreen }"
      >
        <div class="lc-code-dialog-header">
          <span class="lc-code-dialog-title">{{ objectDialog.title }}</span>
          <div class="lc-code-dialog-header-btns">
            <button
              class="lc-code-hdr-btn"
              :title="objectDialog.fullscreen ? '退出全屏' : '全屏编辑'"
              @click="objectDialog.fullscreen = !objectDialog.fullscreen"
            >{{ objectDialog.fullscreen ? '⊠' : '⊡' }}</button>
            <button class="lc-code-hdr-btn" title="关闭" @click="closeObjectDialog">✕</button>
          </div>
        </div>
        <div class="lc-object-dialog-body">
          <component
            :is="objectDialog.dialogComponent"
            :model-value="objectDialog.modelValue"
            @update:model-value="objectDialog.modelValue = $event"
          />
        </div>
        <div class="lc-code-footer">
          <button class="lc-code-btn-primary" @click="applyObjectDialog">确 定</button>
          <button class="lc-code-btn" @click="closeObjectDialog">取 消</button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- JSON editor dialog (for unstructured Object / Array props) -->
  <Teleport to="body">
    <div v-if="jsonDialog" class="lc-code-backdrop" @click.self="closeJsonDialog">
      <div
        class="lc-code-dialog"
        :class="{ 'lc-code-dialog--fs': jsonDialog.fullscreen }"
      >
        <div class="lc-code-dialog-header">
          <span class="lc-code-dialog-title">{{ jsonDialog.title }}</span>
          <div class="lc-code-dialog-header-btns">
            <button
              class="lc-code-hdr-btn"
              :title="jsonDialog.fullscreen ? '退出全屏' : '全屏编辑'"
              @click="jsonDialog.fullscreen = !jsonDialog.fullscreen"
            >{{ jsonDialog.fullscreen ? '⊠' : '⊡' }}</button>
            <button class="lc-code-hdr-btn" title="关闭" @click="closeJsonDialog">✕</button>
          </div>
        </div>
        <textarea
          class="lc-code-editor"
          placeholder='{"key": "value"}'
          :value="jsonDialog.text"
          @input="jsonDialog.text = ($event.target as HTMLTextAreaElement).value; jsonDialog.error = ''"
        />
        <div v-if="jsonDialog.error" class="lc-prop-error" style="padding: 4px 14px;">{{ jsonDialog.error }}</div>
        <div class="lc-code-footer">
          <button class="lc-code-btn-primary" @click="applyJsonDialog">确 定</button>
          <button class="lc-code-btn" @click="closeJsonDialog">取 消</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>


<!-- Global styles for the Teleport-ed dialog (cannot be scoped) -->

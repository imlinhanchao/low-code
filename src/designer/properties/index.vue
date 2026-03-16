<script setup lang="ts">
import { computed, inject, ref, watch, type Component, type Ref } from 'vue'
import type { ComponentConfig, EventParam, FormSchema, GlobalConfig, PropConfig, SlotConfig, WidgetSchema } from '../../types'
import { isPropConfig } from '../../types'
import GlobalConfigPanel from './GlobalConfigPanel.vue'
import { draggingConfig } from '../useDragState'

const props = defineProps<{
  widget: WidgetSchema | null
  config: ComponentConfig | null
  effectiveSlots: SlotConfig[]
  globalConfig: GlobalConfig
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
    idError.value = 'ID 不能为空'
    return
  }
  if (trimmed === props.widget.id) {
    idError.value = ''
    return
  }
  if (allWidgetIds.value.has(trimmed)) {
    idError.value = `ID "${trimmed}" 已被占用`
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

// ── Drag-to-reorder state for slot children ───────────────────────────────────
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

function onSlotChildDragOver(slotName: string, idx: number, e: DragEvent) {
  if (dragFromSlot.value !== slotName) return
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
  dragOverSlot.value = slotName
  dragOverIdx.value  = idx
}

function onSlotChildDrop(slotName: string, idx: number, e: DragEvent) {
  e.preventDefault()
  const from     = dragFromIdx.value
  const fromSlot = dragFromSlot.value
  resetDrag()
  if (fromSlot !== slotName || from === idx || !props.widget) return
  const children = [...(props.widget.slots[slotName] ?? [])]
  const [item] = children.splice(from, 1)
  children.splice(idx, 0, item)
  emit('update:widget', {
    ...props.widget,
    slots: { ...props.widget.slots, [slotName]: children },
  })
}

function resetDrag() {
  dragFromSlot.value = null
  dragFromIdx.value  = -1
  dragOverSlot.value = null
  dragOverIdx.value  = -1
}

// ── Slot drop targets (right sidebar) ────────────────────────────────────────

/** Track which slot row is being hovered during a palette drag */
const slotDropOver = ref<string | null>(null)

/** Returns false when the dragged config is not accepted by the given slot */
function isSlotAccepted(slotName: string): boolean {
  if (!draggingConfig.value) return false
  const slot = props.effectiveSlots.find((s) => s.name === slotName)
  if (!slot) return false
  const accept = slot.components?.map((c) => c.name) ?? []
  return accept.length === 0 || accept.includes(draggingConfig.value.name)
}

function onSlotRowDragOver(slotName: string, e: DragEvent) {
  if (!isSlotAccepted(slotName)) return
  e.preventDefault()
  e.stopPropagation()
  slotDropOver.value = slotName
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
}

function onSlotRowDragLeave(slotName: string) {
  if (slotDropOver.value === slotName) slotDropOver.value = null
}

function onSlotRowDrop(slotName: string, e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
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

/** Returns the count label for a slot row ("N 项" or "空") */
function slotCountLabel(slotName: string): string {
  const count = (props.widget?.slots[slotName] ?? []).length
  return count > 0 ? `${count} 项` : '空'
}

/** Slots that have at least one child in the schema (to show in the panel always) */
const populatedSlots = computed(() =>
  props.effectiveSlots.filter((s) => (props.widget?.slots[s.name] ?? []).length > 0),
)

/** Show the slotContent editor for leaf widgets that still use slotContent */
const showSlotContent = computed(
  () =>
    props.config?.category !== 'layout' &&
    props.widget?.slotContent !== undefined &&
    !(props.widget?.slots['default'] ?? []).length,
)

/** Config prop entries as [key, value] – value may be a PropConfig or a plain primitive */
const configPropEntries = computed(() => Object.entries(props.config?.props ?? {}))

/** Event entries from config, if any */
const configEvents = computed(() => Object.entries(props.config?.events ?? {}))

// ── Type helpers for template use ────────────────────────────────────────────

function propKind(v: unknown): 'boolean' | 'select' | 'function' | 'number' | 'object' | 'string' {
  if (!isPropConfig(v)) return 'string'
  const cfg = v as PropConfig
  if (cfg.type === Boolean) return 'boolean'
  if (cfg.type === Function) return 'function'
  if (cfg.type === Object) return 'object'
  if (cfg.type === Number) return 'number'
  if (cfg.options?.length) return 'select'
  return 'string'
}

function propLabel(key: string, v: unknown): string {
  if (isPropConfig(v)) return (v as PropConfig).label ?? key
  return key
}

function propOptions(v: unknown): string[] {
  if (isPropConfig(v)) return (v as PropConfig).options ?? []
  return []
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
  const cfg = v as PropConfig
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
  const cfg = v as PropConfig
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
</script>

<template>
  <div class="lc-properties">
    <!-- Tab bar -->
    <div class="lc-prop-tabs">
      <button
        class="lc-prop-tab"
        :class="{ 'lc-prop-tab--active': activeTab === 'props' }"
        @click="activeTab = 'props'"
      >属性设置</button>
      <button
        class="lc-prop-tab"
        :class="{ 'lc-prop-tab--active': activeTab === 'global' }"
        @click="activeTab = 'global'"
      >全局配置</button>
    </div>

    <!-- Properties tab -->
    <template v-if="activeTab === 'props'">
      <template v-if="widget && config">
        <div class="lc-properties-section">{{ config.name }}</div>

      <!-- Common attributes (always available for every widget) -->
      <div class="lc-properties-group-label">公共</div>
      <div class="lc-prop-row">
        <label class="lc-prop-label" title="id">组件ID</label>
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

      <!-- Props (type-aware) -->
      <template v-if="configPropEntries.length">
        <div class="lc-properties-group-label">属性</div>
        <div
          v-for="[key, cfgVal] in configPropEntries"
          :key="'prop-' + key"
          class="lc-prop-row"
        >
          <label class="lc-prop-label" :title="key">{{ propLabel(key, cfgVal) }}</label>

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

          <!-- Number input -->
          <input
            v-else-if="propKind(cfgVal) === 'number'"
            class="lc-prop-input"
            type="number"
            :value="widget.props[key] ?? ''"
            @input="updateProp(key, ($event.target as HTMLInputElement).value === '' ? undefined : Number(($event.target as HTMLInputElement).value))"
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

      <!-- Models (v-model bindings) — each model has a field name + default value -->
      <template v-if="Object.keys(widget.models).length">
        <div class="lc-properties-group-label">数据绑定</div>
        <div
          v-for="(val, key) in widget.models"
          :key="'model-' + key"
          class="lc-model-row"
        >
          <span class="lc-model-key">{{ key }}</span>
          <div class="lc-model-fields">
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

      <!-- Slot children management (slots that already have children) -->
      <template v-if="populatedSlots.length > 0">
        <div class="lc-properties-group-label">插槽内容</div>
        <div
          v-for="slot in populatedSlots"
          :key="'slot-' + slot.name"
          class="lc-slot-section"
        >
          <div class="lc-slot-section-label">{{ slot.label ?? slot.name }}</div>
          <div
            v-for="(child, idx) in widget.slots[slot.name]"
            :key="child.id"
            class="lc-slot-child-row"
            :class="{
              'lc-slot-child-row--dragging':    dragFromSlot === slot.name && dragFromIdx === idx,
              'lc-slot-child-row--drop-before': dragOverSlot === slot.name && dragOverIdx === idx && dragFromIdx > idx,
              'lc-slot-child-row--drop-after':  dragOverSlot === slot.name && dragOverIdx === idx && dragFromIdx < idx,
            }"
            draggable="true"
            @dragstart="onSlotChildDragStart(slot.name, idx, $event)"
            @dragover="onSlotChildDragOver(slot.name, idx, $event)"
            @drop="onSlotChildDrop(slot.name, idx, $event)"
            @dragend="resetDrag"
          >
            <span class="lc-slot-child-drag-handle" title="拖拽排序">⠿</span>
            <span class="lc-slot-child-name">{{ child.name }}</span>
            <button
              class="lc-slot-child-btn lc-slot-child-configure"
              title="组件设置"
              @click="selectWidget?.(child.id)"
            >⚙</button>
            <button
              class="lc-slot-child-btn lc-slot-child-remove"
              title="从插槽移除"
              @click="removeSlotChild(slot.name, child.id)"
            >✕</button>
          </div>
        </div>
      </template>

      <!-- Slot drop targets: all available slots (drag palette items here) -->
      <template v-if="effectiveSlots.length > 0">
        <div class="lc-properties-group-label">插槽列表</div>
        <div
          v-for="slot in effectiveSlots"
          :key="'slotdrop-' + slot.name"
          class="lc-slot-drop-row"
          :class="{ 'lc-slot-drop-row--over': slotDropOver === slot.name }"
          @dragover="onSlotRowDragOver(slot.name, $event)"
          @dragleave="onSlotRowDragLeave(slot.name)"
          @drop="onSlotRowDrop(slot.name, $event)"
        >
          <span class="lc-slot-drop-name">{{ slot.label ?? slot.name }}</span>
          <span class="lc-slot-drop-count">{{ slotCountLabel(slot.name) }}</span>
          <span class="lc-slot-drop-hint">拖拽组件到此处</span>
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
</template>


<!-- Global styles for the Teleport-ed dialog (cannot be scoped) -->

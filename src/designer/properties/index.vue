<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue'
import type { ComponentConfig, EventParam, GlobalConfig, PropConfig, SlotConfig, WidgetSchema } from '../../types'
import { isPropConfig } from '../../types'
import GlobalConfigPanel from './GlobalConfigPanel.vue'

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
})

const selectWidget = inject<(id: string | null) => void>('lc:selectWidget')

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

function propKind(v: unknown): 'boolean' | 'select' | 'function' | 'number' | 'string' {
  if (!isPropConfig(v)) return 'string'
  const cfg = v as PropConfig
  if (cfg.type === Boolean) return 'boolean'
  if (cfg.type === Function) return 'function'
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
</template>

<style scoped>
.lc-properties {
  height: 100%;
  overflow-y: auto;
  background: #fff;
  border-left: 1px solid #dcdfe6;
  box-sizing: border-box;
}
/* Tab bar */
.lc-prop-tabs {
  display: flex;
  border-bottom: 1px solid #dcdfe6;
  background: #f5f7fa;
  position: sticky;
  top: 0;
  z-index: 1;
}
.lc-prop-tab {
  flex: 1;
  padding: 8px 4px;
  font-size: 12px;
  color: #606266;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-weight: 500;
  transition: color 0.15s, border-color 0.15s;
}
.lc-prop-tab:hover {
  color: #409eff;
}
.lc-prop-tab--active {
  color: #409eff;
  border-bottom-color: #409eff;
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
  font-size: 10px;
  font-weight: 600;
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
  flex: 0 0 84px;
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
  background: #fff;
}
.lc-prop-input:focus {
  border-color: #409eff;
}
.lc-model-row {
  padding: 4px 14px;
  border-bottom: 1px solid #f0f0f0;
}
.lc-model-key {
  font-size: 11px;
  color: #909399;
  font-weight: 600;
  display: block;
  margin-bottom: 2px;
  padding-left: 4px;
}
.lc-model-fields {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.lc-model-field-row {
  padding: 2px 0;
}
.lc-prop-label--sub {
  flex: 0 0 60px;
  color: #909399;
}
.lc-prop-checkbox-wrap {
  flex: 1;
  display: flex;
  align-items: center;
}
.lc-prop-checkbox-wrap input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

/* Function-prop / event buttons */
.lc-fn-btn {
  flex: 1;
  position: relative;
  height: 28px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #f5f7fa;
  color: #606266;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  white-space: nowrap;
}
.lc-fn-btn:hover {
  border-color: #409eff;
  color: #409eff;
}
.lc-fn-btn--set {
  border-color: #67c23a;
  color: #67c23a;
  background: #f0f9eb;
}
.lc-fn-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f56c6c;
  flex-shrink: 0;
}

/* Slot children */
.lc-slot-section {
  padding: 2px 14px 4px;
}
.lc-slot-section-label {
  font-size: 11px;
  color: #909399;
  margin-bottom: 2px;
}
.lc-slot-child-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3px 6px;
  background: #f5f7fa;
  border: 1px solid #ebeef5;
  border-radius: 3px;
  margin-bottom: 2px;
  cursor: default;
  user-select: none;
}
.lc-slot-child-drag-handle {
  color: #c0c4cc;
  cursor: grab;
  font-size: 12px;
  letter-spacing: -1px;
  margin-right: 4px;
  flex-shrink: 0;
}
.lc-slot-child-drag-handle:active {
  cursor: grabbing;
}
.lc-slot-child-row--dragging {
  opacity: 0.4;
}
.lc-slot-child-row--drop-before {
  border-top: 2px solid #409eff;
}
.lc-slot-child-row--drop-after {
  border-bottom: 2px solid #409eff;
}
.lc-slot-child-name {
  flex: 1;
  font-size: 11px;
  color: #606266;
}
.lc-slot-child-btn {
  width: 16px;
  height: 16px;
  border: none;
  border-radius: 50%;
  font-size: 9px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  flex-shrink: 0;
  margin-left: 2px;
}
.lc-slot-child-configure {
  background: #409eff;
  color: #fff;
}
.lc-slot-child-configure:hover {
  background: #66b1ff;
}
.lc-slot-child-remove {
  background: #f56c6c;
  color: #fff;
}
.lc-slot-child-remove:hover {
  background: #f78989;
}

/* Events row */
.lc-event-row {
  display: flex;
  align-items: center;
  padding: 4px 14px;
  gap: 8px;
}
.lc-event-name {
  flex: 0 0 auto;
  max-width: 110px;
  font-size: 11px;
  color: #606266;
  font-family: 'Consolas', 'Monaco', monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lc-properties-empty {
  padding: 24px 14px;
  color: #c0c4cc;
  font-size: 13px;
  text-align: center;
}
</style>

<!-- Global styles for the Teleport-ed dialog (cannot be scoped) -->
<style>
.lc-code-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.lc-code-dialog {
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.22);
  display: flex;
  flex-direction: column;
  width: 560px;
  max-width: 96vw;
  max-height: 72vh;
  overflow: hidden;
}
.lc-code-dialog--fs {
  width: 100vw !important;
  max-width: 100vw !important;
  height: 100vh !important;
  max-height: 100vh !important;
  border-radius: 0 !important;
}
.lc-code-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid #dcdfe6;
  background: #f5f7fa;
  flex-shrink: 0;
}
.lc-code-dialog-title {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}
.lc-code-dialog-header-btns {
  display: flex;
  gap: 4px;
}
.lc-code-hdr-btn {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #909399;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}
.lc-code-hdr-btn:hover {
  background: #ebeef5;
  color: #303133;
}
.lc-code-signature {
  padding: 6px 14px 2px;
  font-size: 12px;
  font-family: 'Consolas', 'Monaco', monospace;
  color: #909399;
  background: #fafafa;
  flex-shrink: 0;
  border-bottom: 1px dashed #ebeef5;
}
.lc-code-editor {
  flex: 1;
  min-height: 180px;
  padding: 10px 14px;
  font-size: 13px;
  font-family: 'Consolas', 'Monaco', monospace;
  color: #303133;
  border: none;
  outline: none;
  resize: none;
  line-height: 1.6;
  background: #fff;
}
.lc-code-closing {
  padding: 2px 14px 6px;
  font-size: 12px;
  font-family: 'Consolas', 'Monaco', monospace;
  color: #909399;
  background: #fafafa;
  flex-shrink: 0;
  border-top: 1px dashed #ebeef5;
}
.lc-code-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 10px 14px;
  border-top: 1px solid #dcdfe6;
  background: #f5f7fa;
  flex-shrink: 0;
}
.lc-code-btn-primary {
  padding: 6px 18px;
  border: none;
  border-radius: 4px;
  background: #409eff;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
}
.lc-code-btn-primary:hover {
  background: #66b1ff;
}
.lc-code-btn {
  padding: 6px 18px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  color: #606266;
  font-size: 13px;
  cursor: pointer;
}
.lc-code-btn:hover {
  border-color: #409eff;
  color: #409eff;
}
</style>

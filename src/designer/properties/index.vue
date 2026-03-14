<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import type { ComponentConfig, SlotConfig, WidgetSchema } from '../../types'

const props = defineProps<{
  widget: WidgetSchema | null
  config: ComponentConfig | null
  effectiveSlots: SlotConfig[]
}>()

const emit = defineEmits<{
  'update:widget': [widget: WidgetSchema]
}>()

const selectWidget = inject<(id: string | null) => void>('lc:selectWidget')

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

/** Event entries from config, if any */
const configEvents = computed(() => Object.entries(props.config?.events ?? {}))
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

      <!-- Events configuration -->
      <template v-if="configEvents.length > 0">
        <div class="lc-properties-group-label">事件</div>
        <div
          v-for="[eventName, params] in configEvents"
          :key="'event-' + eventName"
          class="lc-event-row"
        >
          <div class="lc-event-signature">
            {{ eventName }}({{ params.map(p => p.name).join(', ') }})
          </div>
          <textarea
            class="lc-event-editor"
            :placeholder="`// ${eventName} 事件处理函数体`"
            :value="widget.events?.[eventName] ?? ''"
            @input="updateEvent(eventName, ($event.target as HTMLTextAreaElement).value)"
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
  position: sticky;
  top: 0;
  z-index: 1;
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
}
.lc-prop-input:focus {
  border-color: #409eff;
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

/* Events */
.lc-event-row {
  padding: 4px 14px 6px;
}
.lc-event-signature {
  font-size: 11px;
  color: #606266;
  font-family: 'Consolas', 'Monaco', monospace;
  margin-bottom: 3px;
  padding: 2px 4px;
  background: #f5f7fa;
  border-radius: 3px;
  word-break: break-all;
}
.lc-event-editor {
  width: 100%;
  min-height: 72px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 12px;
  font-family: 'Consolas', 'Monaco', monospace;
  color: #303133;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
  line-height: 1.5;
}
.lc-event-editor:focus {
  border-color: #409eff;
}
.lc-properties-empty {
  padding: 24px 14px;
  color: #c0c4cc;
  font-size: 13px;
  text-align: center;
}
</style>

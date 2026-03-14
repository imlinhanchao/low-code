<script setup lang="ts">
import { inject, computed, type Ref } from 'vue'
import type { ComponentConfig, WidgetSchema } from '../../types'
import SlotZone from './slot-zone.vue'

const props = defineProps<{ widget: WidgetSchema }>()

// All operations are provided by LcDesigner
const selectedId = inject<Ref<string | null>>('lc:selectedId')!
const removeWidget = inject<(id: string) => void>('lc:removeWidget')!
const selectWidget = inject<(id: string | null) => void>('lc:selectWidget')!
const allConfigs = inject<Ref<ComponentConfig[]>>('lc:allConfigs')!

const isSelected = computed(() => selectedId.value === props.widget.id)
const isLayout = computed(() => props.widget.category === 'layout')

const config = computed(() =>
  allConfigs.value.find((c) => c.name === props.widget.name),
)

/** Effective slot list: prefer computeSlots(props) over static slots array */
const effectiveSlots = computed(() => {
  if (!config.value) return []
  if (config.value.computeSlots) return config.value.computeSlots(props.widget.props)
  return config.value.slots ?? []
})

/** Props passed to the component preview (pointer-events disabled so clicks select the widget) */
const previewProps = computed(() => ({
  ...props.widget.props,
  ...props.widget.models,
  style: 'pointer-events:none; user-select:none;',
}))

/** Slots that should be visible in the properties panel (non-empty or selected) */
const visibleSlots = computed(() =>
  effectiveSlots.value.filter(
    (s) => isSelected.value || (props.widget.slots[s.name] ?? []).length > 0,
  ),
)
</script>

<template>
  <div
    class="lc-canvas-widget"
    :class="{
      'is-selected': isSelected,
      'is-layout': isLayout,
    }"
    @click.stop="selectWidget(widget.id)"
  >
    <!-- ── Toolbar ── -->
    <div class="lc-widget-toolbar">
      <span class="lc-widget-badge">{{ config?.name ?? widget.name }}</span>
      <button class="lc-widget-delete" title="删除" @click.stop="removeWidget(widget.id)">✕</button>
    </div>

    <!-- ── Layout container: body = slot zones ── -->
    <div v-if="isLayout" class="lc-layout-body">
      <div v-if="effectiveSlots.length === 0" class="lc-layout-no-slots">(无子插槽)</div>
      <SlotZone
        v-for="slot in effectiveSlots"
        :key="slot.name"
        :parent-id="widget.id"
        :slot-name="slot.name"
        :slot-label="slot.label ?? slot.name"
        :children="widget.slots[slot.name] ?? []"
      />
    </div>

    <!-- ── Regular widget: component preview + optional slot zones ── -->
    <template v-else>
      <!-- Component preview (pointer-events disabled) -->
      <div class="lc-widget-preview">
        <component :is="config?.component" v-bind="previewProps">
          {{ widget.slotContent ?? '' }}
        </component>
      </div>

      <!-- Named slot zones — shown when selected OR when slot already has children -->
      <div v-if="visibleSlots.length > 0" class="lc-widget-slots">
        <SlotZone
          v-for="slot in visibleSlots"
          :key="slot.name"
          :parent-id="widget.id"
          :slot-name="slot.name"
          :slot-label="slot.label ?? slot.name"
          :children="widget.slots[slot.name] ?? []"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.lc-canvas-widget {
  position: relative;
  border: 1px dashed #c0c4cc;
  border-radius: 4px;
  padding: 0;
  margin: 6px 0;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.2s;
  overflow: hidden;
}
.lc-canvas-widget:hover {
  border-color: #409eff;
}
.lc-canvas-widget.is-selected {
  border: 2px solid #409eff;
  background: #f0f7ff;
}
.lc-canvas-widget.is-layout {
  border-style: solid;
  border-color: #dcdfe6;
}
.lc-canvas-widget.is-layout.is-selected {
  border-color: #409eff;
}

/* Toolbar */
.lc-widget-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 6px 2px 8px;
  background: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
  min-height: 22px;
}
.lc-widget-badge {
  font-size: 10px;
  color: #909399;
  user-select: none;
}
.lc-widget-delete {
  width: 16px;
  height: 16px;
  border: none;
  background: #f56c6c;
  color: #fff;
  border-radius: 50%;
  font-size: 9px;
  line-height: 1;
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 0;
  flex-shrink: 0;
}
.lc-canvas-widget:hover .lc-widget-delete,
.lc-canvas-widget.is-selected .lc-widget-delete {
  display: flex;
}

/* Layout body */
.lc-layout-body {
  padding: 6px;
}
.lc-layout-no-slots {
  color: #c0c4cc;
  font-size: 11px;
  padding: 8px;
  text-align: center;
}

/* Regular widget */
.lc-widget-preview {
  padding: 8px;
  pointer-events: none;
}
.lc-widget-slots {
  border-top: 1px dashed #e4e7ed;
  padding: 4px 6px 6px;
  background: #fafbfc;
}
</style>


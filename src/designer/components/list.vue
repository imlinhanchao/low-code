<script setup lang="ts">
import { ref } from 'vue'
import type { ComponentConfig, ComponentGroup } from '../../types'
import PaletteItem from './item.vue'

defineProps<{
  layouts: ComponentConfig[]
  groups: ComponentGroup[]
  /** Components valid only inside specific slots (e.g. ElOption for ElSelect) */
  slotOnlyComponents?: ComponentConfig[]
}>()

// ── Collapse state ─────────────────────────────────────────────────────────────
const collapsed = ref<Record<string, boolean>>({})
function toggle(key: string) {
  collapsed.value[key] = !collapsed.value[key]
}

const DEFAULT_GROUP_LABEL = '自定义组件'
</script>

<template>
  <div class="lc-palette">
    <div class="lc-palette-title">组件列表</div>

    <!-- Built-in layout section (collapsible) -->
    <div class="lc-palette-section">
      <div class="lc-palette-section-label lc-palette-section-label--toggle" @click="toggle('\x00layouts')">
        <span class="lc-palette-section-arrow" :class="{ 'is-collapsed': collapsed['\x00layouts'] }">▶</span>
        布局组件
      </div>
      <div v-show="!collapsed['\x00layouts']" class="lc-palette-items">
        <PaletteItem v-for="cfg in layouts" :key="cfg.name" :config="cfg" />
      </div>
    </div>

    <!-- User-configured component sections (one per group, all collapsible) -->
    <div v-for="(grp, idx) in groups" :key="idx" class="lc-palette-section">
      <div class="lc-palette-section-label lc-palette-section-label--toggle" @click="toggle(`\x00g${idx}`)">
        <span class="lc-palette-section-arrow" :class="{ 'is-collapsed': collapsed[`\x00g${idx}`] }">▶</span>
        {{ grp.group || DEFAULT_GROUP_LABEL }}
      </div>
      <div v-show="!collapsed[`\x00g${idx}`]" class="lc-palette-items">
        <PaletteItem v-for="cfg in grp.components" :key="cfg.name" :config="cfg" />
      </div>
    </div>

    <!-- Slot-specific components (e.g. ElOption for ElSelect) -->
    <div v-if="slotOnlyComponents && slotOnlyComponents.length > 0" class="lc-palette-section">
      <div class="lc-palette-section-label lc-palette-section-label--toggle" @click="toggle('\x00slots')">
        <span class="lc-palette-section-arrow" :class="{ 'is-collapsed': collapsed['\x00slots'] }">▶</span>
        插槽组件
      </div>
      <div v-show="!collapsed['\x00slots']" class="lc-palette-items">
        <PaletteItem v-for="cfg in slotOnlyComponents" :key="cfg.name" :config="cfg" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.lc-palette {
  height: 100%;
  overflow-y: auto;
  background: #f5f7fa;
  border-right: 1px solid #dcdfe6;
}
.lc-palette-title {
  padding: 10px 14px 6px;
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  border-bottom: 1px solid #dcdfe6;
  background: #fff;
}
.lc-palette-section {
  padding: 4px 0;
}
.lc-palette-section-label {
  padding: 6px 10px 2px;
  font-size: 10px;
  font-weight: 600;
  color: #909399;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  user-select: none;
}
.lc-palette-section-label--toggle {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}
.lc-palette-section-label--toggle:hover {
  color: #606266;
}
.lc-palette-section-arrow {
  display: inline-block;
  font-size: 8px;
  transition: transform 0.2s;
  transform: rotate(90deg);
}
.lc-palette-section-arrow.is-collapsed {
  transform: rotate(0deg);
}
.lc-palette-items {
  padding: 2px 6px;
}
</style>

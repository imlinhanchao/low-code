<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ComponentConfig } from '../../types'
import PaletteItem from './item.vue'

const props = defineProps<{
  layouts: ComponentConfig[]
  components: ComponentConfig[]
  /** Components valid only inside specific slots (e.g. ElOption for ElSelect) */
  slotOnlyComponents?: ComponentConfig[]
}>()

// ── Collapse state ─────────────────────────────────────────────────────────────
const collapsed = ref<Record<string, boolean>>({})
function toggle(key: string) {
  collapsed.value[key] = !collapsed.value[key]
}

// ── Group custom components by their `group` field ─────────────────────────────
// Components without a `group` go into the DEFAULT_GROUP bucket.
// We preserve insertion order of group names.
const DEFAULT_GROUP = '自定义组件'
const componentGroups = computed<{ key: string; label: string; items: ComponentConfig[] }[]>(() => {
  const map = new Map<string, ComponentConfig[]>()
  for (const cfg of props.components) {
    const key = cfg.group ?? DEFAULT_GROUP
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(cfg)
  }
  return Array.from(map.entries()).map(([key, items]) => ({
    key,
    label: key,
    items,
  }))
})
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
    <div v-for="group in componentGroups" :key="group.key" class="lc-palette-section">
      <div class="lc-palette-section-label lc-palette-section-label--toggle" @click="toggle(group.key)">
        <span class="lc-palette-section-arrow" :class="{ 'is-collapsed': collapsed[group.key] }">▶</span>
        {{ group.label }}
      </div>
      <div v-show="!collapsed[group.key]" class="lc-palette-items">
        <PaletteItem v-for="cfg in group.items" :key="cfg.name" :config="cfg" />
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

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ComponentConfig, ComponentGroup } from '../../types'
import PaletteItem from './item.vue'

const props = defineProps<{
  layouts: ComponentConfig[]
  groups: ComponentGroup[]
}>()

// ── Collapse state ─────────────────────────────────────────────────────────────
const collapsed = ref<Record<string, boolean>>({})
function toggle(key: string) {
  collapsed.value[key] = !collapsed.value[key]
}

const DEFAULT_GROUP_LABEL = '自定义组件'

// ── Slot-child resolution ──────────────────────────────────────────────────────
// Build the set of all top-level component names (layouts + group components).
// Any component that appears in a slot's whitelist but NOT in this set is a
// "slot-only" child and should be displayed beneath its parent.
const topLevelNames = computed<Set<string>>(() => {
  const names = new Set<string>()
  for (const cfg of props.layouts) names.add(cfg.name)
  for (const grp of props.groups) {
    for (const cfg of grp.components) names.add(cfg.name)
  }
  return names
})

/** Returns the unique slot-only child configs for a given component config. */
function getSlotChildren(cfg: ComponentConfig): ComponentConfig[] {
  const children: ComponentConfig[] = []
  const seen = new Set<string>()
  for (const slot of cfg.slots ?? []) {
    for (const sc of slot.components ?? []) {
      if (!topLevelNames.value.has(sc.name) && !seen.has(sc.name)) {
        seen.add(sc.name)
        children.push(sc)
      }
    }
  }
  return children
}
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
        <template v-for="cfg in grp.components" :key="cfg.name">
          <PaletteItem :config="cfg" />
          <!-- Slot-only children: shown indented below their parent -->
          <div v-if="getSlotChildren(cfg).length > 0" class="lc-palette-slot-children">
            <PaletteItem
              v-for="child in getSlotChildren(cfg)"
              :key="child.name"
              :config="child"
              class="lc-palette-item--slot-child"
            />
          </div>
        </template>
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
.lc-palette-slot-children {
  margin-left: 12px;
  border-left: 2px solid #dcdfe6;
  padding-left: 2px;
}
</style>

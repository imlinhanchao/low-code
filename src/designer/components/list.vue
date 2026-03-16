<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ComponentConfig, ComponentGroup } from '../../types'
import PaletteItem from './item.vue'

const props = defineProps<{
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

    <!-- User-configured component sections (one per group, all collapsible) -->
    <div v-for="(grp, idx) in groups" :key="idx" class="lc-palette-section">
      <div class="lc-palette-section-label lc-palette-section-label--toggle" @click="toggle(`\x00g${idx}`)">
        <span class="lc-palette-section-arrow" :class="{ 'is-collapsed': collapsed[`\x00g${idx}`] }">▶</span>
        {{ grp.group || DEFAULT_GROUP_LABEL }}
      </div>
      <div v-show="!collapsed[`\x00g${idx}`]" class="lc-palette-items">
        <template v-for="cfg in grp.components" :key="cfg.name">
          <PaletteItem :config="cfg" :class="{ 'is-full': getSlotChildren(cfg).length > 0 }" />
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


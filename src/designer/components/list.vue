<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '../i18n'
import type { ComponentConfig, ComponentGroup } from '../../types'
import PaletteItem from './item.vue'

const props = defineProps<{
  groups: ComponentGroup[]
}>()

const { t, tt } = useI18n()

function resolveLabel(label: string | Record<string, string> | undefined, fallback: string): string {
  return tt(label) || fallback
}

// ── Collapse state ─────────────────────────────────────────────────────────────
const collapsed = ref<Record<string, boolean>>({})
function toggle(key: string) {
  collapsed.value[key] = !collapsed.value[key]
}

const DEFAULT_GROUP_LABEL = '自定义组件'

// ── Slot-child resolution ──────────────────────────────────────────────────────
function getUnifiedName(name: string | Record<string, string>): string {
  if (typeof name === 'string') return name
  return JSON.stringify(name) // Use JSON as stable key for sets
}

// Build the set of all top-level component names (layouts + group components).
// Any component that appears in a slot's whitelist but NOT in this set is a
// "slot-only" child and should be displayed beneath its parent.
const topLevelNames = computed<Set<string>>(() => {
  const names = new Set<string>()
  for (const grp of props.groups) {
    for (const cfg of grp.components) names.add(getUnifiedName(cfg.name))
  }
  return names
})

/** Returns the unique slot-only child configs for a given component config. */
function getSlotChildren(cfg: ComponentConfig): ComponentConfig[] {
  const children: ComponentConfig[] = []
  const seen = new Set<string>()
  for (const slot of cfg.slots ?? []) {
    for (const sc of slot.components ?? []) {
      const uname = getUnifiedName(sc.name)
      if (!topLevelNames.value.has(uname) && !seen.has(uname)) {
        seen.add(uname)
        children.push(sc)
      }
    }
  }
  return children
}
</script>

<template>
  <div class="lc-palette">
    <div class="lc-palette-title">{{ t('designer.componentLib') }}</div>

    <!-- User-configured component sections (one per group, all collapsible) -->
    <div v-for="(grp, idx) in groups" :key="idx" class="lc-palette-section">
      <div class="lc-palette-section-label lc-palette-section-label--toggle" @click="toggle(`\x00g${idx}`)">
        <span class="lc-palette-section-arrow" :class="{ 'is-collapsed': collapsed[`\x00g${idx}`] }">▶</span>
        {{ resolveLabel(grp.group, DEFAULT_GROUP_LABEL) }}
      </div>
      <div v-show="!collapsed[`\x00g${idx}`]" class="lc-palette-items">
        <template v-for="cfg in grp.components" :key="getUnifiedName(cfg.name)">
          <PaletteItem :config="cfg" :class="{ 'is-full': getSlotChildren(cfg).length > 0 }" />
          <!-- Slot-only children: shown indented below their parent -->
          <div v-if="getSlotChildren(cfg).length > 0" class="lc-palette-slot-children">
            <PaletteItem
              v-for="child in getSlotChildren(cfg)"
              :key="getUnifiedName(child.name)"
              :config="child"
              class="lc-palette-item--slot-child"
            />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>


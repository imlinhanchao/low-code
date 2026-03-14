<script setup lang="ts">
import type { ComponentConfig } from '../../types'
import PaletteItem from './item.vue'

defineProps<{
  layouts: ComponentConfig[]
  components: ComponentConfig[]
  /** Components valid only inside specific slots (e.g. ElOption for ElSelect) */
  slotOnlyComponents?: ComponentConfig[]
}>()
</script>

<template>
  <div class="lc-palette">
    <div class="lc-palette-title">组件列表</div>

    <!-- Built-in layout section -->
    <div class="lc-palette-section">
      <div class="lc-palette-section-label">布局组件</div>
      <div class="lc-palette-items">
        <PaletteItem v-for="cfg in layouts" :key="cfg.name" :config="cfg" />
      </div>
    </div>

    <!-- User-configured components section -->
    <div v-if="components.length > 0" class="lc-palette-section">
      <div class="lc-palette-section-label">自定义组件</div>
      <div class="lc-palette-items">
        <PaletteItem v-for="cfg in components" :key="cfg.name" :config="cfg" />
      </div>
    </div>

    <!-- Slot-specific components (e.g. ElOption for ElSelect) -->
    <div v-if="slotOnlyComponents && slotOnlyComponents.length > 0" class="lc-palette-section">
      <div class="lc-palette-section-label">插槽组件</div>
      <div class="lc-palette-items">
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
.lc-palette-items {
  padding: 2px 6px;
}
</style>

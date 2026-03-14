<script setup lang="ts">
import type { ComponentConfig } from '../../types'
import PaletteItem from './item.vue'

defineProps<{ components: ComponentConfig[] }>()
</script>

<template>
  <div class="lc-palette">
    <div class="lc-palette-title">组件列表</div>
    <PaletteItem
      v-for="cfg in components"
      :key="cfg.name"
      :config="cfg"
    />
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
</style>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{ tabLabels?: string }>()
const tabs = computed(() => {
  const raw = props.tabLabels ?? '标签1,标签2'
  return raw.split(',').map(s => s.trim()).filter(Boolean)
})
const activeTab = ref(0)
</script>

<template>
  <div class="lc-tabs-layout">
    <div class="lc-tabs-nav">
      <span
        v-for="(label, i) in tabs"
        :key="i"
        class="lc-tab-item"
        :class="{ 'is-active': activeTab === i }"
        @click="activeTab = i"
      >{{ label }}</span>
    </div>
    <div class="lc-tabs-body">
      <div
        v-for="(_, i) in tabs"
        :key="i"
        v-show="activeTab === i"
        class="lc-tab-pane"
      >
        <slot :name="'tab-' + i" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.lc-tabs-layout {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  width: 100%;
}
.lc-tabs-nav {
  display: flex;
  border-bottom: 1px solid #e4e7ed;
  background: #fafafa;
}
.lc-tab-item {
  padding: 8px 16px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: color 0.2s, border-color 0.2s;
}
.lc-tab-item.is-active {
  border-bottom-color: #409eff;
  color: #409eff;
}
.lc-tab-item:hover:not(.is-active) {
  color: #409eff;
}
.lc-tabs-body {
  padding: 8px;
}
.lc-tab-pane {
  min-height: 32px;
}
</style>

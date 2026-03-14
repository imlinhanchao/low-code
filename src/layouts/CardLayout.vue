<script setup lang="ts">
defineProps<{ header?: string; shadow?: string }>()
</script>

<template>
  <div class="lc-card-layout">
    <div class="lc-card-header">
      <slot name="header">{{ header ?? '卡片标题' }}</slot>
    </div>
    <div class="lc-card-body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.lc-card-layout {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
  width: 100%;
}
.lc-card-header {
  padding: 10px 16px;
  border-bottom: 1px solid #ebeef5;
  background: #fafafa;
  font-weight: 600;
  font-size: 14px;
  color: #303133;
}
.lc-card-body {
  padding: 16px;
  min-height: 32px;
}
</style>

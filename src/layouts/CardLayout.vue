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


<script setup lang="ts">
defineProps<{ content?: string }>()
</script>

<template>
  <span class="lc-static-text">{{ content ?? '静态文本' }}</span>
</template>


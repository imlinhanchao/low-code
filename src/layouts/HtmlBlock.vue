<script setup lang="ts">
defineProps<{ html?: string }>()
</script>

<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="lc-html-block" v-html="html ?? '<p>HTML 内容</p>'" />
</template>

<style scoped>
.lc-html-block {
  min-height: 20px;
}
</style>

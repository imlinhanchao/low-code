<script setup lang="ts">
import { useSlots } from 'vue'
const props = defineProps<{ html?: string }>()
const slots = useSlots()
</script>

<!-- eslint-disable vue/no-v-html -->
<template>
  <span v-if="slots.default" class="lc-static-text"><slot /></span>
  <span v-else class="lc-static-text" v-html="props.html ?? '静态文本'" />
</template>


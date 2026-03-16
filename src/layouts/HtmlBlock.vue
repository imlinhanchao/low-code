<script setup lang="ts">
import { useSlots } from 'vue'
const props = defineProps<{ html?: string }>()
const slots = useSlots()
</script>

<!-- eslint-disable vue/no-v-html -->
<template>
  <div v-if="slots.default" class="lc-html-block"><slot /></div>
  <div v-else class="lc-html-block" v-html="props.html ?? '<p>HTML 内容</p>'" />
</template>


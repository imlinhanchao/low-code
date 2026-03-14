<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ columns?: number }>()
const count = computed(() => Math.max(1, Number(props.columns) || 2))
const gridStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${count.value}, 1fr)`,
  gap: '8px',
  minHeight: '48px',
  width: '100%',
}))
</script>

<template>
  <div :style="gridStyle">
    <div v-for="i in count" :key="i" class="lc-grid-col">
      <slot :name="'col-' + (i - 1)" />
    </div>
  </div>
</template>

<style scoped>
.lc-grid-col {
  min-height: 32px;
  border: 1px dashed #e4e7ed;
  border-radius: 3px;
  padding: 4px;
  box-sizing: border-box;
}
</style>

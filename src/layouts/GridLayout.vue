<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{ 
  columns?: {
    sm: number;
    md: number;
    lg: number;
  };
  count?: number;
  gap?: number;
}>(), { 
  columns: () => ({ sm: 1, md: 2, lg: 3 }), 
  count: 6,
  gap: 8
})
const gridStyle = computed(() => ({
  display: 'grid',
  gap: `${props.gap}px`,
  minHeight: '1.5em',
  width: '100%',
  '--columns-sm': props.columns?.sm,
  '--columns-md': props.columns?.md,
  '--columns-lg': props.columns?.lg,
}))
</script>

<template>
  <div class="lc-grid" :style="gridStyle">
    <div v-for="i in count" :key="i" class="lc-grid-col">
      <slot :name="'col-' + (i - 1)" />
    </div>
  </div>
</template>

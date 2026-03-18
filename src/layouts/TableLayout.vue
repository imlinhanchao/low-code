<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ rows?: number; cols?: number }>()
const rowCount = computed(() => Math.max(1, Number(props.rows) || 2))
const colCount = computed(() => Math.max(1, Number(props.cols) || 2))
</script>

<template>
  <table class="lc-table-layout">
    <tbody>
      <tr v-for="r in rowCount" :key="r">
        <td v-for="c in colCount" :key="c">
          <slot :name="'cell-' + (r - 1) + '-' + (c - 1)" />
        </td>
      </tr>
    </tbody>
  </table>
</template>


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

<style scoped>
.lc-table-layout {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}
.lc-table-layout td {
  border: 1px solid #dcdfe6;
  padding: 6px 8px;
  vertical-align: top;
  min-width: 60px;
  min-height: 30px;
}
</style>

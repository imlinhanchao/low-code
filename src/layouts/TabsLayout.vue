<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{ tabLabels?: string }>()
const tabs = computed(() => {
  const raw = props.tabLabels ?? '标签1,标签2'
  return raw.split(',').map(s => s.trim()).filter(Boolean)
})
const activeTab = ref(0)
</script>

<template>
  <div class="lc-tabs-layout">
    <div class="lc-tabs-nav">
      <span
        v-for="(label, i) in tabs"
        :key="i"
        class="lc-tab-item"
        :class="{ 'is-active': activeTab === i }"
        @click="activeTab = i"
      >{{ label }}</span>
    </div>
    <div class="lc-tabs-body">
      <div
        v-for="(_, i) in tabs"
        :key="i"
        v-show="activeTab === i"
        class="lc-tab-pane"
      >
        <slot :name="'tab-' + i" />
      </div>
    </div>
  </div>
</template>


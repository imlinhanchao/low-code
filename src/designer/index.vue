<script setup lang="ts">
  import components from './components/list.vue'
</script>

<template>
  <article class="designer-container">
    <aside class="designer-components">
      <components />
    </aside>
    <section class="designer-canvas"></section>
    <aside class="designer-properties"></aside>
  </article>
</template>
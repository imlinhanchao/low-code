<template>
  <button class="my-button" @click="handleClick">
    <slot />
  </button>
</template>

<script setup lang="ts">
const emit = defineEmits(['click'])

const handleClick = (event: MouseEvent) => {
  emit('click', event)
}
</script>

<style lang="less" scoped>
@primary-color: #42b883;

.my-button {
  padding: 8px 16px;
  background-color: @primary-color;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: darken(@primary-color, 10%);
  }
}
</style>

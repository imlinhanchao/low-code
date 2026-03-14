<template>
  <div class="debug-container">
    <h1>组件库预览 (调试页面)</h1>
    <section>
      <h2>MyButton</h2>
      <MyButton @click="handleClick">点击我</MyButton>
    </section>
  </div>
</template>

<script setup lang="ts">
import { MyButton } from './src/index'

const handleClick = () => {
  alert('MyButton clicked!')
}
</script>

<style>
.debug-container {
  padding: 20px;
  font-family: sans-serif;
}
section {
  margin-top: 20px;
  padding: 10px;
  border: 1px dashed #ccc;
}
/* 这里由于 tsdown 暂时不支持编译 style，我们直接在 App.vue 里复写按钮样式用于调试 */
.my-button {
  padding: 8px 16px;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>

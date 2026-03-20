<template>
  <div class="x-input-wrapper" :class="{ 'is-disabled': $attrs.disabled !== undefined && $attrs.disabled !== false }">
    <!-- 输入框外前置 -->
    <div v-if="$slots.prepend" class="x-input-prepend">
      <slot name="prepend"></slot>
    </div>
    
    <div class="x-input-inner-wrapper">
      <!-- 输入框内前置 -->
      <span v-if="$slots.prefix" class="x-input-prefix">
        <slot name="prefix"></slot>
      </span>
      
      <!-- 原生输入框 -->
      <input
        v-bind="$attrs"
        class="x-input-inner"
        :value="modelValue"
        @input="onInput"
      />
      
      <!-- 输入框内后置 -->
      <span v-if="$slots.suffix" class="x-input-suffix">
        <slot name="suffix"></slot>
      </span>
    </div>

    <!-- 输入框外后置 -->
    <div v-if="$slots.append" class="x-input-append">
      <slot name="append"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSlots } from 'vue'

defineOptions({
  name: 'XInput',
  // 防止 attrs 绑定到外层的 div 上，而是绑定到 inner 的 input 上
  inheritAttrs: false
})

defineProps<{
  modelValue?: string | number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<style>
.x-input-wrapper {
  display: inline-flex;
  width: 100%;
  box-sizing: border-box;
  vertical-align: middle;
  font-size: 14px;
}

.x-input-wrapper.is-disabled .x-input-inner-wrapper,
.x-input-wrapper.is-disabled .x-input-inner {
  background-color: #f5f7fa;
  cursor: not-allowed;
  color: #a8abb2;
}

.x-input-prepend,
.x-input-append {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  background-color: #f5f7fa;
  color: #909399;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  white-space: nowrap;
}

.x-input-prepend {
  border-right: 0;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.x-input-append {
  border-left: 0;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.x-input-inner-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  flex-grow: 1;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #ffffff;
  transition: border-color 0.2s;
  overflow: hidden;
}

.x-input-wrapper:has(> .x-input-prepend) .x-input-inner-wrapper {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.x-input-wrapper:has(> .x-input-append) .x-input-inner-wrapper {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.x-input-inner-wrapper:focus-within {
  border-color: #409eff;
}

.x-input-prefix,
.x-input-suffix {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: #c0c4cc;
}

.x-input-inner {
  width: 100%;
  flex-grow: 1;
  border: none!important;
  outline: none!important;
  box-shadow: none!important;
  padding: 8px 11px;
  box-sizing: border-box;
  background: transparent;
  color: #606266;
  font-size: 14px;
}

.x-input-inner:disabled {
  cursor: not-allowed;
}

.x-input-inner::placeholder {
  color: #a8abb2;
}
</style>

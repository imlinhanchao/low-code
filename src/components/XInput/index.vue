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

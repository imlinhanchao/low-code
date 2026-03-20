<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useI18n } from '../i18n'

const props = defineProps<{
  modelValue: unknown
  title?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
}>()

const { t } = useI18n()
const visible = ref(false)
const expression = ref('')

function open() {
  expression.value = typeof props.modelValue === 'string' ? props.modelValue : ''
  visible.value = true
}

function apply(e?: Event) {
  if (e) {
    e.preventDefault()
    e.stopPropagation()
  }
  const val = expression.value.trim()
  emit('update:modelValue', val || undefined)
  visible.value = false
}
</script>

<template>
  <div class="lc-expression-editor" @click.stop>
    <button
      type="button"
      class="lc-expression-btn"
      :class="{ 'lc-expression-btn--active': typeof modelValue === 'string' }"
      :title="t('designer.expression')"
      @click.stop.prevent="open"
    >
      <Icon icon="mdi:function-variant" />
    </button>

    <div v-if="visible" class="lc-expression-dialog-overlay" @click.self="visible = false">
      <div class="lc-expression-dialog">
        <div class="lc-expression-dialog-header">
          <span>{{ title || t('designer.editExpression') }}</span>
          <button class="lc-expression-dialog-close" @click="visible = false">
            <Icon icon="mdi:close" />
          </button>
        </div>
        <div class="lc-expression-dialog-body">
          <p class="lc-expression-hint">
            支持使用 <code>$model</code>, <code>$global</code>, <code>$scope</code> 编写表达式。
            例如：<code>$model.age > 18</code> 或 <code>!$global.readonly</code>
          </p>
          <textarea
            v-model="expression"
            class="lc-expression-input"
            rows="4"
            placeholder="输入 JavaScript 表达式..."
            autofocus
          ></textarea>
        </div>
        <div class="lc-expression-dialog-footer">
          <button type="button" class="lc-btn" @click.stop.prevent="visible = false">{{ t('designer.cancel') }}</button>
          <button type="button" class="lc-btn lc-btn--primary" @click.stop.prevent="apply">{{ t('designer.apply') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lc-expression-editor {
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
}

.lc-expression-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: #666;
  width: 24px;
  height: 24px;
}

.lc-expression-btn:hover {
  border-color: #666;
  color: #333;
}

.lc-expression-btn--active {
  color: #409eff;
  border-color: #409eff;
  background: #ecf5ff;
}

.lc-expression-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.lc-expression-dialog {
  background: #fff;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

.lc-expression-dialog-header {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: bold;
}

.lc-expression-dialog-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  font-size: 18px;
  padding: 4px;
}

.lc-expression-dialog-body {
  padding: 16px;
}

.lc-expression-hint {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
  line-height: 1.4;
}

.lc-expression-hint code {
  background: #f5f5f5;
  padding: 2px 4px;
  border-radius: 3px;
  color: #d14;
}

.lc-expression-input {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
  font-family: monospace;
  font-size: 14px;
  resize: vertical;
}

.lc-expression-dialog-footer {
  padding: 12px 16px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.lc-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
}

.lc-btn--primary {
  background: #409eff;
  color: #fff;
  border-color: #409eff;
}
</style>

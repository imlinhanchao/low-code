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
            {{ t('designer.expressionHint') }}
          </p>
          <textarea
            v-model="expression"
            class="lc-expression-input"
            rows="4"
            :placeholder="t('designer.expressionPlaceholder')"
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

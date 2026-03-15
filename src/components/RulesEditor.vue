<script setup lang="ts">
import { ref, watch } from 'vue'

/**
 * A dialog body component for editing ElForm `rules`.
 * modelValue shape: Record<string, Array<{ required?, min?, max?, message, trigger }>>
 *
 * The component renders each field as an expandable section where rules can be
 * added/removed.  It emits `update:modelValue` on every change.
 */

interface RuleItem {
  required?: boolean
  min?: number
  max?: number
  type?: string
  pattern?: string
  message?: string
  trigger?: string
}

type Rules = Record<string, RuleItem[]>

const props = defineProps<{ modelValue: unknown }>()
const emit = defineEmits<{ 'update:modelValue': [value: Rules] }>()

function toRules(v: unknown): Rules {
  if (v && typeof v === 'object' && !Array.isArray(v)) return v as Rules
  return {}
}

const rules = ref<Rules>(toRules(props.modelValue))

watch(() => props.modelValue, (v) => {
  rules.value = toRules(v)
})

function emitChange() {
  emit('update:modelValue', JSON.parse(JSON.stringify(rules.value)))
}

// ── Field management ──────────────────────────────────────────────────────────

const newFieldName = ref('')

function addField() {
  const name = newFieldName.value.trim()
  if (!name || name in rules.value) return
  rules.value[name] = []
  newFieldName.value = ''
  emitChange()
}

function removeField(field: string) {
  delete rules.value[field]
  emitChange()
}

// ── Rule management ───────────────────────────────────────────────────────────

function addRule(field: string) {
  if (!rules.value[field]) rules.value[field] = []
  rules.value[field].push({ message: '', trigger: 'blur' })
  emitChange()
}

function removeRule(field: string, idx: number) {
  rules.value[field].splice(idx, 1)
  emitChange()
}

function updateRule(field: string, idx: number, key: keyof RuleItem, value: unknown) {
  const rule = rules.value[field][idx] as Record<string, unknown>
  if (value === '' || value === undefined) {
    delete rule[key]
  } else {
    rule[key] = value
  }
  emitChange()
}
</script>

<template>
  <div class="re-root">
    <!-- Add field row -->
    <div class="re-add-field-row">
      <input
        v-model="newFieldName"
        class="re-input"
        placeholder="字段名 (如: username)"
        @keydown.enter="addField"
      />
      <button class="re-btn re-btn--primary" @click="addField">添加字段</button>
    </div>

    <!-- Fields -->
    <div v-if="Object.keys(rules).length === 0" class="re-empty">暂无规则，请添加字段</div>

    <div
      v-for="(fieldRules, field) in rules"
      :key="field"
      class="re-field"
    >
      <div class="re-field-header">
        <span class="re-field-name">{{ field }}</span>
        <button class="re-icon-btn re-icon-btn--add" title="添加规则" @click="addRule(String(field))">＋</button>
        <button class="re-icon-btn re-icon-btn--del" title="删除字段" @click="removeField(String(field))">✕</button>
      </div>

      <div
        v-for="(rule, idx) in fieldRules"
        :key="idx"
        class="re-rule-row"
      >
        <!-- required -->
        <label class="re-rule-cell re-rule-cell--check" title="required">
          <input type="checkbox" :checked="!!rule.required" @change="updateRule(String(field), idx, 'required', ($event.target as HTMLInputElement).checked || undefined)" />
          <span>必填</span>
        </label>

        <!-- min -->
        <label class="re-rule-cell" title="min">
          <span class="re-rule-label">min</span>
          <input type="number" class="re-input re-input--sm" :value="rule.min ?? ''" @input="updateRule(String(field), idx, 'min', ($event.target as HTMLInputElement).value === '' ? undefined : Number(($event.target as HTMLInputElement).value))" />
        </label>

        <!-- max -->
        <label class="re-rule-cell" title="max">
          <span class="re-rule-label">max</span>
          <input type="number" class="re-input re-input--sm" :value="rule.max ?? ''" @input="updateRule(String(field), idx, 'max', ($event.target as HTMLInputElement).value === '' ? undefined : Number(($event.target as HTMLInputElement).value))" />
        </label>

        <!-- trigger -->
        <label class="re-rule-cell" title="trigger">
          <span class="re-rule-label">触发</span>
          <select class="re-input re-input--sm" :value="rule.trigger ?? 'blur'" @change="updateRule(String(field), idx, 'trigger', ($event.target as HTMLSelectElement).value)">
            <option value="blur">blur</option>
            <option value="change">change</option>
            <option value="submit">submit</option>
          </select>
        </label>

        <!-- message -->
        <label class="re-rule-cell re-rule-cell--msg" title="message">
          <span class="re-rule-label">提示</span>
          <input class="re-input" :value="rule.message ?? ''" @input="updateRule(String(field), idx, 'message', ($event.target as HTMLInputElement).value)" />
        </label>

        <button class="re-icon-btn re-icon-btn--del" title="删除规则" @click="removeRule(String(field), idx)">✕</button>
      </div>
    </div>
  </div>
</template>


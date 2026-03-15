<script setup lang="ts">
import { ref, watch } from 'vue'

/**
 * A dialog body component for editing a single FormItem's `rules` array.
 * modelValue shape: Array<{ required?, min?, max?, type?, pattern?, message?, trigger? }>
 *
 * Unlike RulesEditor (which maps field names → arrays), this editor works
 * directly with a flat array of rules — no field-name input required.
 * It is the appropriate editor for ElFormItem.rules.
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

const props = defineProps<{ modelValue: unknown }>()
const emit = defineEmits<{ 'update:modelValue': [value: RuleItem[]] }>()

function toRules(v: unknown): RuleItem[] {
  if (Array.isArray(v)) return v as RuleItem[]
  return []
}

const rules = ref<RuleItem[]>(toRules(props.modelValue))

watch(() => props.modelValue, (v) => {
  rules.value = toRules(v)
})

function emitChange() {
  emit('update:modelValue', JSON.parse(JSON.stringify(rules.value)))
}

function addRule() {
  rules.value.push({ message: '', trigger: 'blur' })
  emitChange()
}

function removeRule(idx: number) {
  rules.value.splice(idx, 1)
  emitChange()
}

function updateRule(idx: number, key: keyof RuleItem, value: unknown) {
  if (idx < 0 || idx >= rules.value.length) return
  const rule = rules.value[idx] as Record<string, unknown>
  if (value === '' || value === undefined) {
    delete rule[key]
  } else {
    rule[key] = value
  }
  emitChange()
}
</script>

<template>
  <div class="fre-root">
    <!-- Header bar -->
    <div class="fre-toolbar">
      <button class="fre-btn fre-btn--primary" @click="addRule">＋ 添加规则</button>
    </div>

    <!-- Empty state -->
    <div v-if="rules.length === 0" class="fre-empty">暂无规则，点击"添加规则"开始</div>

    <!-- Rule rows -->
    <div
      v-for="(rule, idx) in rules"
      :key="idx"
      class="fre-rule-row"
    >
      <!-- required -->
      <label class="fre-rule-cell fre-rule-cell--check" title="required">
        <input
          type="checkbox"
          :checked="!!rule.required"
          @change="updateRule(idx, 'required', ($event.target as HTMLInputElement).checked ? true : undefined)"
        />
        <span>必填</span>
      </label>

      <!-- min -->
      <label class="fre-rule-cell" title="min">
        <span class="fre-rule-label">min</span>
        <input
          type="number"
          class="fre-input fre-input--sm"
          :value="rule.min ?? ''"
          @input="updateRule(idx, 'min', ($event.target as HTMLInputElement).value === '' ? undefined : Number(($event.target as HTMLInputElement).value))"
        />
      </label>

      <!-- max -->
      <label class="fre-rule-cell" title="max">
        <span class="fre-rule-label">max</span>
        <input
          type="number"
          class="fre-input fre-input--sm"
          :value="rule.max ?? ''"
          @input="updateRule(idx, 'max', ($event.target as HTMLInputElement).value === '' ? undefined : Number(($event.target as HTMLInputElement).value))"
        />
      </label>

      <!-- trigger -->
      <label class="fre-rule-cell" title="trigger">
        <span class="fre-rule-label">触发</span>
        <select
          class="fre-input fre-input--sm"
          :value="rule.trigger ?? 'blur'"
          @change="updateRule(idx, 'trigger', ($event.target as HTMLSelectElement).value)"
        >
          <option value="blur">blur</option>
          <option value="change">change</option>
          <option value="submit">submit</option>
        </select>
      </label>

      <!-- message -->
      <label class="fre-rule-cell fre-rule-cell--msg" title="message">
        <span class="fre-rule-label">提示</span>
        <input
          class="fre-input"
          :value="rule.message ?? ''"
          @input="updateRule(idx, 'message', ($event.target as HTMLInputElement).value)"
        />
      </label>

      <button class="fre-icon-btn fre-icon-btn--del" title="删除规则" @click="removeRule(idx)">✕</button>
    </div>
  </div>
</template>

<style scoped>
.fre-root {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 12px;
}
.fre-toolbar {
  display: flex;
}
.fre-empty {
  color: #c0c4cc;
  text-align: center;
  padding: 12px 0;
}
.fre-rule-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding: 6px 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fafafa;
}
.fre-rule-cell {
  display: flex;
  align-items: center;
  gap: 4px;
}
.fre-rule-cell--check {
  cursor: pointer;
  gap: 3px;
}
.fre-rule-cell--msg {
  flex: 1;
}
.fre-rule-label {
  color: #909399;
  white-space: nowrap;
}
.fre-input {
  flex: 1;
  height: 26px;
  border: 1px solid #dcdfe6;
  border-radius: 3px;
  padding: 0 6px;
  font-size: 12px;
  outline: none;
  color: #303133;
  background: #fff;
  box-sizing: border-box;
}
.fre-input--sm {
  width: 56px;
  flex: none;
}
.fre-input:focus {
  border-color: #409eff;
}
.fre-btn {
  padding: 0 12px;
  height: 26px;
  border: 1px solid #dcdfe6;
  border-radius: 3px;
  font-size: 12px;
  cursor: pointer;
  background: #fff;
  color: #606266;
  white-space: nowrap;
}
.fre-btn--primary {
  background: #409eff;
  border-color: #409eff;
  color: #fff;
}
.fre-btn--primary:hover {
  background: #66b1ff;
}
.fre-icon-btn {
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 50%;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  flex-shrink: 0;
}
.fre-icon-btn--del {
  background: #f56c6c;
  color: #fff;
}
.fre-icon-btn--del:hover {
  background: #f78989;
}
</style>

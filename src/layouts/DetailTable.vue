<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps<{
  modelValue?: Record<string, unknown>[]
  showIndex?: boolean
  mode?: 'table' | 'list'
  headers?: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>[]]
}>()

const rows = computed<Record<string, unknown>[]>(() => props.modelValue ?? [])
const checked = ref<Set<number>>(new Set())
const showConfirm = ref(false)

const allChecked = computed(() =>
  rows.value.length > 0 && checked.value.size === rows.value.length,
)

const isIndeterminate = computed(
  () => checked.value.size > 0 && checked.value.size < rows.value.length,
)

/** Custom directive to set the non-attribute `indeterminate` DOM property */
const vIndeterminate = {
  mounted(el: HTMLInputElement, binding: { value: boolean }) {
    el.indeterminate = binding.value
  },
  updated(el: HTMLInputElement, binding: { value: boolean }) {
    el.indeterminate = binding.value
  },
}

function toggleAll(e: Event) {
  const el = e.target as HTMLInputElement
  if (el.checked) {
    checked.value = new Set(rows.value.map((_, i) => i))
  } else {
    checked.value = new Set()
  }
}

function toggleRow(index: number, e: Event) {
  const el = e.target as HTMLInputElement
  const next = new Set(checked.value)
  if (el.checked) next.add(index)
  else next.delete(index)
  checked.value = next
}

function addRow() {
  emit('update:modelValue', [...rows.value, {}])
}

function confirmDelete() {
  if (checked.value.size === 0) return
  showConfirm.value = true
}

function doDelete() {
  const toDelete = checked.value
  emit(
    'update:modelValue',
    rows.value.filter((_, i) => !toDelete.has(i)),
  )
  checked.value = new Set()
  showConfirm.value = false
}

function cancelDelete() {
  showConfirm.value = false
}

const effectiveHeaders = computed<string[]>(() => props.headers ?? [])
const isTable = computed(() => props.mode === 'table')
</script>

<template>
  <div class="lc-detail-table">
    <!-- Header bar -->
    <div class="lc-detail-table__header">
      <span class="lc-detail-table__title">明细</span>
      <div class="lc-detail-table__actions">
        <button
          class="lc-detail-table__btn"
          title="新增"
          @click="addRow"
        >
          <Icon icon="mdi:plus" width="16" height="16" />
        </button>
        <button
          class="lc-detail-table__btn lc-detail-table__btn--danger"
          title="删除"
          :disabled="checked.size === 0"
          @click="confirmDelete"
        >
          <Icon icon="mdi:delete-outline" width="16" height="16" />
        </button>
      </div>
    </div>

    <!-- Table mode -->
    <template v-if="isTable">
      <table class="lc-detail-table__table">
        <thead>
          <tr>
            <th class="lc-detail-table__check-col">
              <input
                type="checkbox"
                :checked="allChecked"
                v-indeterminate="isIndeterminate"
                @change="toggleAll"
              />
            </th>
            <th v-if="showIndex !== false" class="lc-detail-table__index-col">#</th>
            <th
              v-for="(hdr, ci) in effectiveHeaders"
              :key="ci"
              class="lc-detail-table__th"
            >{{ hdr }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, ri) in rows"
            :key="ri"
            class="lc-detail-table__row"
            :class="{ 'is-checked': checked.has(ri) }"
          >
            <td class="lc-detail-table__check-col">
              <input
                type="checkbox"
                :checked="checked.has(ri)"
                @change="(e) => toggleRow(ri, e)"
              />
            </td>
            <td v-if="showIndex !== false" class="lc-detail-table__index-col">{{ ri + 1 }}</td>
            <td
              v-for="(_, ci) in effectiveHeaders"
              :key="ci"
              class="lc-detail-table__td"
            >
              <slot
                :name="'col-' + ci"
                :row="row"
                :rowIndex="ri"
                :rowCount="rows.length"
              />
            </td>
          </tr>
          <tr v-if="rows.length === 0">
            <td
              :colspan="(showIndex !== false ? 2 : 1) + effectiveHeaders.length"
              class="lc-detail-table__empty"
            >暂无数据</td>
          </tr>
        </tbody>
      </table>
    </template>

    <!-- List mode -->
    <template v-else>
      <div class="lc-detail-table__list">
        <div class="lc-detail-table__list-header">
          <span class="lc-detail-table__check-col">
            <input
              type="checkbox"
              :checked="allChecked"
              v-indeterminate="isIndeterminate"
              @change="toggleAll"
            />
          </span>
          <span v-if="showIndex !== false" class="lc-detail-table__index-col">#</span>
          <span class="lc-detail-table__list-content-col">内容</span>
        </div>
        <div
          v-for="(row, ri) in rows"
          :key="ri"
          class="lc-detail-table__list-row"
          :class="{ 'is-checked': checked.has(ri) }"
        >
          <span class="lc-detail-table__check-col">
            <input
              type="checkbox"
              :checked="checked.has(ri)"
              @change="(e) => toggleRow(ri, e)"
            />
          </span>
          <span v-if="showIndex !== false" class="lc-detail-table__index-col">{{ ri + 1 }}</span>
          <div class="lc-detail-table__list-content">
            <slot
              :row="row"
              :rowIndex="ri"
              :rowCount="rows.length"
            />
          </div>
        </div>
        <div v-if="rows.length === 0" class="lc-detail-table__empty">暂无数据</div>
      </div>
    </template>

    <!-- Confirm dialog -->
    <div v-if="showConfirm" class="lc-detail-table__overlay" @click.self="cancelDelete">
      <div class="lc-detail-table__dialog">
        <div class="lc-detail-table__dialog-title">
          <Icon icon="mdi:alert-circle-outline" class="lc-detail-table__dialog-icon" />
          确认删除
        </div>
        <div class="lc-detail-table__dialog-body">
          确定要删除选中的 {{ checked.size }} 条记录吗？此操作不可撤销。
        </div>
        <div class="lc-detail-table__dialog-footer">
          <button class="lc-detail-table__dialog-btn" @click="cancelDelete">取消</button>
          <button class="lc-detail-table__dialog-btn lc-detail-table__dialog-btn--danger" @click="doDelete">确定删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

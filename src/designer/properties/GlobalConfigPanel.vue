<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '../i18n'
import type { GlobalConfig } from '../../types'

const props = defineProps<{
  globalConfig: GlobalConfig
}>()

const { t } = useI18n()

const emit = defineEmits<{
  'update:globalConfig': [config: GlobalConfig]
}>()

// ── CSS ─────────────────────────────────────────────────────────────────────

const isCssSet = computed(() => !!(props.globalConfig.css?.trim()))

function updateCss(css: string) {
  emit('update:globalConfig', { ...props.globalConfig, css })
}

function openCssDialog() {
  codeDialog.value = {
    title: t('designer.editCss'),
    noBraces: true,
    code: props.globalConfig.css ?? '',
    fullscreen: false,
    onApply: (code) => updateCss(code),
  }
}

// ── Functions ────────────────────────────────────────────────────────────────

/** Built-in lifecycle hooks shown in fixed order */
const LIFECYCLE_HOOKS = computed(() => [
  { name: 'onMounted', label: t('designer.onMounted'), signature: 'onMounted()' },
  {
    name: 'onModelChange',
    label: t('designer.onModelChange'),
    signature: 'onModelChange(fieldName, value, formData)',
  },
])

/** User-defined custom function names (keys not in LIFECYCLE_HOOKS) */
const builtinNames = computed(() => new Set(LIFECYCLE_HOOKS.value.map((h) => h.name)))

const customFunctionNames = computed<string[]>(() =>
  Object.keys(props.globalConfig.functions ?? {}).filter((k) => !builtinNames.value.has(k)),
)

function getFnBody(name: string): string {
  return props.globalConfig.functions?.[name] ?? ''
}

function setFnBody(name: string, body: string) {
  const functions = { ...(props.globalConfig.functions ?? {}), [name]: body }
  emit('update:globalConfig', { ...props.globalConfig, functions })
}

function removeFn(name: string) {
  const functions = { ...(props.globalConfig.functions ?? {}) }
  delete functions[name]
  emit('update:globalConfig', { ...props.globalConfig, functions })
}

// ── Add custom function ───────────────────────────────────────────────────────

const newFnName = ref('')
const showAddFn = ref(false)

function addCustomFunction() {
  const name = newFnName.value.trim()
  if (!name || builtinNames.value.has(name)) return
  setFnBody(name, '')
  openCodeDialog(name, `${name}()`)
  newFnName.value = ''
  showAddFn.value = false
}

// ── Code editor dialog ────────────────────────────────────────────────────────

interface CodeDialogState {
  title: string
  /** Displayed as the function signature line; omit (along with noBraces) for non-function editors */
  signature?: string
  /** When true, the function-brace decoration is hidden (used for CSS editor) */
  noBraces?: boolean
  code: string
  fullscreen: boolean
  onApply: (code: string) => void
}

const codeDialog = ref<CodeDialogState | null>(null)

function openCodeDialog(name: string, signature: string) {
  codeDialog.value = {
    title: `${t('designer.editFn')}: ${name}`,
    signature,
    code: getFnBody(name),
    fullscreen: false,
    onApply: (code) => setFnBody(name, code),
  }
}

function applyCode() {
  if (!codeDialog.value) return
  codeDialog.value.onApply(codeDialog.value.code)
  codeDialog.value = null
}

function closeCodeDialog() {
  codeDialog.value = null
}

function isFnSet(name: string): boolean {
  return !!(getFnBody(name).trim())
}
</script>

<template>
  <div class="lc-global-panel">

    <!-- CSS Section -->
    <div class="lc-global-section-label">CSS 样式</div>
    <div class="lc-global-fn-row">
      <span class="lc-global-fn-name">全局 CSS</span>
      <button
        class="lc-fn-btn"
        :class="{ 'lc-fn-btn--set': isCssSet }"
        @click="openCssDialog"
      >
        <span v-if="isCssSet" class="lc-fn-dot" />
        {{ isCssSet ? '已设置' : '设置' }}
      </button>
    </div>

    <!-- Lifecycle hooks -->
    <div class="lc-global-section-label">生命周期函数</div>
    <div
      v-for="hook in LIFECYCLE_HOOKS"
      :key="hook.name"
      class="lc-global-fn-row"
    >
      <span class="lc-global-fn-name" :title="hook.signature">{{ hook.label }}</span>
      <button
        class="lc-fn-btn"
        :class="{ 'lc-fn-btn--set': isFnSet(hook.name) }"
        @click="openCodeDialog(hook.name, hook.signature)"
      >
        <span v-if="isFnSet(hook.name)" class="lc-fn-dot" />
        {{ isFnSet(hook.name) ? '已设置' : '设置' }}
      </button>
    </div>

    <!-- Custom functions -->
    <div class="lc-global-section-label lc-global-section-label--with-btn">
      <span>全局函数</span>
      <button class="lc-add-btn" @click="showAddFn = !showAddFn">＋</button>
    </div>

    <!-- Add function input -->
    <div v-if="showAddFn" class="lc-global-add-fn-row">
      <input
        v-model="newFnName"
        class="lc-prop-input"
        placeholder="函数名称"
        @keydown.enter="addCustomFunction"
      />
      <button class="lc-fn-btn lc-confirm-btn" @click="addCustomFunction">确定</button>
    </div>

    <div
      v-for="name in customFunctionNames"
      :key="name"
      class="lc-global-fn-row"
    >
      <span class="lc-global-fn-name" :title="name">{{ name }}</span>
      <button
        class="lc-fn-btn"
        :class="{ 'lc-fn-btn--set': isFnSet(name) }"
        @click="openCodeDialog(name, `${name}()`)"
      >
        <span v-if="isFnSet(name)" class="lc-fn-dot" />
        {{ isFnSet(name) ? '已设置' : '编辑' }}
      </button>
      <button class="lc-global-fn-remove" title="删除函数" @click="removeFn(name)">✕</button>
    </div>

  </div>

  <!-- Code editor dialog -->
  <Teleport to="body">
    <div v-if="codeDialog" class="lc-code-backdrop" @click.self="closeCodeDialog">
      <div
        class="lc-code-dialog"
        :class="{ 'lc-code-dialog--fs': codeDialog.fullscreen }"
      >
        <div class="lc-code-dialog-header">
          <span class="lc-code-dialog-title">{{ codeDialog.title }}</span>
          <div class="lc-code-dialog-header-btns">
            <button
              class="lc-code-hdr-btn"
              :title="codeDialog.fullscreen ? '退出全屏' : '全屏编辑'"
              @click="codeDialog.fullscreen = !codeDialog.fullscreen"
            >{{ codeDialog.fullscreen ? '⊠' : '⊡' }}</button>
            <button class="lc-code-hdr-btn" title="关闭" @click="closeCodeDialog">✕</button>
          </div>
        </div>
        <div v-if="!codeDialog.noBraces && codeDialog.signature" class="lc-code-signature">{{ codeDialog.signature }} {</div>
        <textarea
          class="lc-code-editor"
          :placeholder="codeDialog.noBraces ? '/* 在此输入全局 CSS */' : '// 在此输入函数体'"
          :value="codeDialog.code"
          @input="codeDialog.code = ($event.target as HTMLTextAreaElement).value"
        />
        <div v-if="!codeDialog.noBraces && codeDialog.signature" class="lc-code-closing">}</div>
        <div class="lc-code-footer">
          <button class="lc-code-btn-primary" @click="applyCode">确 定</button>
          <button class="lc-code-btn" @click="closeCodeDialog">取 消</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>


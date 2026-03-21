<template>
  <div class="app-root" :class="{
    dark: darkMode
  }">
    <header class="app-header">
      <div class="header-title">
        <h1>Low Code Form Designer</h1>
        <a href="https://github.com/imlinhanchao/low-code/" target="_blank" title="GitHub">
          <Icon icon="mdi:github" width="1.2em" height="1.2em" />
        </a>
        <a href="/" target="_blank" :title="t('document')">
          <Icon icon="fluent:document-folder-16-filled" width="1.2em" height="1.2em" />
        </a>
      </div>
      <div class="header-actions">
        <el-select v-model="locale">
          <el-option value="zh-CN" label="中文"></el-option>
          <el-option value="en-US" label="English"></el-option>
        </el-select>
        <el-button @click="openJson">
          <Icon icon="mdi:code-json" width="16" height="16" style="vertical-align: middle; margin-right: 4px;" />
          <span>{{ t('schema') }}</span>
        </el-button>
        <el-radio-group v-model="mode">
          <el-radio-button value="designer" icon="">
            <Icon icon="mdi:palette-outline" width="16" height="16" style="vertical-align: middle; margin-right: 4px;" />
            <span>{{ t('designer') }}</span>
          </el-radio-button>
          <el-radio-button value="preview" icon="">
            <Icon icon="mdi:eye-outline" width="16" height="16" style="vertical-align: middle; margin-right: 4px;" />
            <span>{{ t('preview') }}</span>
          </el-radio-button>
        </el-radio-group>
        <el-button type="danger" @click="clearSchema">
          <Icon icon="mdi:delete-outline" width="16" height="16" style="vertical-align: middle; margin-right: 4px;" />
          <span>{{ t('clear') }}</span>
        </el-button>
        <el-switch v-model="darkMode">
          <template #active-action>
            <Icon icon="tabler:moon-filled" width="16" height="16" />
          </template>
          <template #inactive-action>
            <Icon icon="tabler:sun-filled" width="16" height="16" color="var(--el-color-primary)" />
          </template>
        </el-switch>
      </div>
    </header>

    <main class="app-body">
      <!-- Designer mode -->
      <LcDesigner
        v-if="mode === 'designer'"
        v-model="schema"
        :components="components"
        class="app-designer"
        :class="{
          'lc-dark': darkMode
        }"
        :locale="locale"
        expressions
      />

      <!-- Preview mode -->
      <div v-else class="app-preview">
        <h2 class="preview-title">{{ t('preview') }}</h2>
        <div class="preview-form">
          <LcRenderer
            :schema="schema"
            :components="components"
            v-model="formData"
            v-model:global="globalData"
            :class="{
              'lc-dark': darkMode
            }"
            expressions
          />
        </div>
        <div class="preview-data">
          <h3>{{ t('formData') }}</h3>
          <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
        </div>
        <div class="preview-data">
          <h3>{{ t('globalData') }}</h3>
          <el-input
            type="textarea"
            :rows="6"
            v-model="globalDataText"
          />
          <p>
            <el-button type="primary" @click="globalDataText = JSON.stringify(globalData, null, 2)">{{ t('refresh') }}</el-button>
            <el-button @click="globalData = JSON.parse(globalDataText)">{{ t('set') }}</el-button>
          </p>
        </div>
      </div>
    </main>

    <el-dialog v-model="showJson" title="Schema JSON" width="800px">
      <el-input
        v-model="jsonContent"
        type="textarea"
        :rows="20"
        style="font-family: monospace"
      />
      <template #footer>
        <el-button @click="copyJson">{{ t('copy') }}</el-button>
        <el-button type="primary" @click="saveJson">{{ t('save') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import 'element-plus/dist/index.css'
import { LcDesigner, LcRenderer, layoutComponents } from 'lc-vue3'
import type { FormSchema } from 'lc-vue3'
import componentList from 'lc-ep'
import { ElInput, ElButton, ElSelect, ElOption, ElDialog, ElMessage, ElRadioGroup, ElRadioButton, ElSwitch } from 'element-plus'
import { Icon } from '@iconify/vue'
import 'element-plus/theme-chalk/dark/css-vars.css'

const darkMode = ref(false)
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  darkMode.value = true
  document.documentElement.classList.add('dark')
}
watch(darkMode, (val) => {
  if (val) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}, { immediate: true })

const components = [
  {
    group: { 'zh-CN': '布局', 'en-US': 'Layout' },
    components: layoutComponents 
  }, ...componentList
]
const mode = ref<'designer' | 'preview'>('designer')

const i18n = reactive({
  'zh-CN': {
    designer: '设计器',
    preview: '预览',
    clear: '清空',
    schema: 'Schema',
    formData: '表单数据',
    globalData: '全局数据',
    refresh: '刷新',
    set: '设置',
    saveSuccess: '保存成功',
    saveError: 'JSON格式错误',
    copySuccess: '复制成功',
    copyError: '复制失败',
    document: '文档',
    copy: '复制',
    save: '保存',
  },
  'en-US': {
    designer: 'Designer',
    preview: 'Preview',
    clear: 'Clear',
    schema: 'Schema',
    formData: 'Form Data',
    globalData: 'Global Data',
    refresh: 'Refresh',
    set: 'Set',
    saveSuccess: 'Save Success',
    saveError: 'JSON Format Error',
    copySuccess: 'Copy Success',
    copyError: 'Copy Error',
    document: 'Document',
    copy: 'Copy',
    save: 'Save',
  }
})

function t(key: string) {
  return i18n[locale.value as keyof typeof i18n][key as keyof (typeof i18n)[keyof typeof i18n]] || key
}

const locale = ref(window.navigator.language.startsWith('zh') ? 'zh-CN' : 'en-US')
const schema = ref<FormSchema>({ widgets: [] })
const formData = ref<Record<string, unknown>>({})

function clearSchema() {
  schema.value = { widgets: [] }
}

const globalData = ref<Record<string, unknown>>({})
const globalDataText = ref<string>('{}')

const showJson = ref(false)
const jsonContent = ref('')

function openJson() {
  jsonContent.value = JSON.stringify(schema.value, null, 2)
  showJson.value = true
}

function saveJson() {
  try {
    const newSchema = JSON.parse(jsonContent.value)
    schema.value = newSchema
    showJson.value = false
    ElMessage.success(t('saveSuccess'))
  } catch (e) {
    ElMessage.error(t('saveError'))
  }
}

function copyJson() {
  navigator.clipboard.writeText(jsonContent.value).then(() => {
    ElMessage.success(t('copySuccess'))
  }).catch(() => {
    ElMessage.error(t('copyError'))
  })
}

watch(globalData, (val) => {
  try {
    globalDataText.value = JSON.stringify(val, null, 2)
  } catch {
    // ignore
  }
})

</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--app-color-bg-page, #f0f2f5);
}
.app-root {
  --app-color-bg-page: #f0f2f5;
  --app-color-bg-header: #fff;
  --app-color-bg-panel: #fff;
  --app-color-text-title: #303133;
  --app-color-text-secondary: #909399;
  --app-color-border-base: #dcdfe6;
  --app-shadow-header: rgba(0, 0, 0, 0.08);

  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.app-root.dark {
  --app-color-bg-page: #151a22;
  --app-color-bg-header: #1b1f27;
  --app-color-bg-panel: #1f2530;
  --app-color-text-title: #e5eaf3;
  --app-color-text-secondary: #8d98aa;
  --app-color-border-base: #3c4558;
  --app-shadow-header: rgba(0, 0, 0, 0.35);
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 52px;
  background: var(--app-color-bg-header);
  border-bottom: 1px solid var(--app-color-border-base);
  box-shadow: 0 1px 4px var(--app-shadow-header);
  flex-shrink: 0;
}
.app-header h1 {
  font-size: 18px;
  color: var(--app-color-text-title);
  font-weight: 600;
}
.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  a {
    color: inherit;
    opacity: 0.5;
    transition: opacity 0.2s;
    &:hover {
      opacity: 1;
    }
  }
}
.header-actions {
  display: flex;
  width: 100%;
  max-width: 500px;
  gap: 8px;
  flex-wrap: nowrap;
  white-space: nowrap;
}

.header-actions .el-radio-group {
  flex-wrap: nowrap;
}

.app-body {
  flex: 1;
  overflow: hidden;
  background: var(--app-color-bg-page);
}
.app-designer {
  height: 100%;
}
.app-preview {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}
.preview-title {
  font-size: 16px;
  color: var(--app-color-text-title);
}
.preview-form {
  background: var(--app-color-bg-panel);
  border: 1px solid var(--app-color-border-base);
  border-radius: 4px;
  padding: 20px;
  min-height: 80px;
}
.preview-data {
  background: var(--app-color-bg-panel);
  border: 1px solid var(--app-color-border-base);
  border-radius: 4px;
  padding: 16px;
}
.preview-data h3 {
  font-size: 13px;
  color: var(--app-color-text-secondary);
  margin-bottom: 8px;
}
.preview-data textarea {
  font-family: monospace;
  margin-bottom: 8px;
}
</style>


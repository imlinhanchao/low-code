<template>
  <div class="app-root">
    <header class="app-header">
      <div class="header-title">
        <h1>Low Code Form Designer</h1>
        <a href="https://github.com/imlinhanchao/low-code/" target="_blank" title="GitHub">
          <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em"><use href="#mdi--github"/></svg>
        </a>
        <a href="/" target="_blank" :title="t('document')">
          <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em"><use href="#fluent--document-folder-16-filled" /></svg>
        </a>
      </div>
      <div class="header-actions">
        <el-select v-model="locale">
          <el-option value="zh-CN" label="中文"></el-option>
          <el-option value="en-US" label="English"></el-option>
        </el-select>
        <el-button @click="openJson">{{ t('schema') }}</el-button>
        <el-radio-group v-model="mode">
          <el-radio-button :label="t('designer')" value="designer" />
          <el-radio-button :label="t('preview')" value="preview" />
        </el-radio-group>
        <el-button type="danger" @click="clearSchema">{{ t('clear') }}</el-button>
      </div>
    </header>

    <main class="app-body">
      <!-- Designer mode -->
      <LcDesigner
        v-if="mode === 'designer'"
        v-model="schema"
        :components="components"
        class="app-designer"
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
import { LcDesigner, LcRenderer, layoutComponents } from 'lc.vue'
import type { FormSchema } from 'lc.vue'
import componentList from 'lc-ep'
import { ElInput, ElButton, ElSelect, ElOption, ElDialog, ElMessage, ElRadioGroup, ElRadioButton } from 'element-plus'

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
  background: #f0f2f5;
}
.app-root {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 52px;
  background: #fff;
  border-bottom: 1px solid #dcdfe6;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  flex-shrink: 0;
}
.app-header h1 {
  font-size: 18px;
  color: #303133;
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
  max-width: 450px;
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
  background: #f0f2f5;
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
  color: #303133;
}
.preview-form {
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 20px;
  min-height: 80px;
}
.preview-data {
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 16px;
}
.preview-data h3 {
  font-size: 13px;
  color: #909399;
  margin-bottom: 8px;
}
.preview-data textarea {
  font-family: monospace;
  margin-bottom: 8px;
}
</style>


<template>
  <div class="app-root">
    <header class="app-header">
      <h1>Low Code Form Designer</h1>
      <div class="header-actions">
        <el-select v-model="locale">
          <el-option value="zh-CN" label="中文"></el-option>
          <el-option value="en-US" label="English"></el-option>
        </el-select>
        <el-button @click="openJson">查看 Schema</el-button>
        <el-button @click="mode = 'designer'">设计器</el-button>
        <el-button type="primary" @click="mode = 'preview'">预览</el-button>
        <el-button type="danger" @click="clearSchema">清空</el-button>
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
        <h2 class="preview-title">表单预览</h2>
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
          <h3>表单数据</h3>
          <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
        </div>
        <div class="preview-data">
          <h3>全局数据</h3>
          <el-input
            type="textarea"
            :rows="6"
            v-model="globalDataText"
          />
          <p>
            <el-button type="primary" @click="globalDataText = JSON.stringify(globalData, null, 2)">刷新</el-button>
            <el-button @click="globalData = JSON.parse(globalDataText)">设置</el-button>
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
        <el-button @click="copyJson">复制</el-button>
        <el-button type="primary" @click="saveJson">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import 'element-plus/dist/index.css'
import { LcDesigner, LcRenderer, layoutComponents } from 'lc.vue'
import type { FormSchema } from 'lc.vue'
import componentList from 'lc-ep'
import { ElInput, ElButton, ElSelect, ElOption, ElDialog, ElMessage } from 'element-plus'

const components = [
  {
    group: '布局',
    components: layoutComponents 
  }, ...componentList
]
const mode = ref<'designer' | 'preview'>('designer')

const locale = ref('zh-CN')
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
    ElMessage.success('保存成功')
  } catch (e) {
    ElMessage.error('JSON格式错误')
  }
}

function copyJson() {
  navigator.clipboard.writeText(jsonContent.value).then(() => {
    ElMessage.success('复制成功')
  }).catch(() => {
    ElMessage.error('复制失败')
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
.header-actions {
  display: flex;
  width: 100%;
  max-width: 450px;
  gap: 8px;
}

.app-body {
  flex: 1;
  overflow: hidden;
  padding: 16px;
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
.preview-data pre {
  font-size: 12px;
  color: #303133;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>


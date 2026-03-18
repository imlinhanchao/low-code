# lc-ep

基于 [Element Plus](https://element-plus.org/) 封装的 lc.vue 插件包，为设计器和渲染器提供丰富的 UI 组件支持。

## 特性

- 🏗️ **开箱即用**: 包含 `ElButton`, `ElInput`, `ElSelect`, `ElDatePicker` 等常用 Element Plus 组件。
- 🔧 **高度可配置**: 每个组件都预设了属性映射（props）、事件（events）和插槽（slots），完美适配 `lc.vue` 设计器。
- 🛠️ **内置编辑器**: 提供 `RulesEditor` (规则编辑器) 和 `FieldRulesEditor` (字段规则编辑器) 等高级功能组件。

## 安装

```bash
npm install lc.vue lc-ep element-plus
# 或者
pnpm add lc.vue lc-ep element-plus
```

> **注意**: 此包依赖于 `element-plus` 和 `lc.vue` 核心库。

## 使用方法

在你的项目中引入并注册组件：

```vue
<template>
  <div class="app">
    <!-- 设计模式 -->
    <LcDesigner
      v-if="mode === 'designer'"
      v-model="schema"
      :components="components"
    />

    <!-- 预览/渲染模式 -->
    <LcRenderer
      v-else
      :schema="schema"
      :components="components"
      v-model="formData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { LcDesigner, LcRenderer, layoutComponents } from 'lc.vue'
import componentList from 'lc-ep'

// 组合内置布局组件和 Element Plus 组件列表
const components = [
  {
    group: '布局',
    components: layoutComponents 
  },
  ...componentList
]

const mode = ref<'designer' | 'preview'>('designer')
const schema = ref({ widgets: [] })
const formData = ref({})
</script>
```


## 包含组件分类

该插件包将组件分为以下几大类：

- **通用**: 按钮 (Button)、工具提示 (Tooltip) 等。
- **表单**: 输入框 (Input)、选择器 (Select)、开关 (Switch)、日期选择 (DatePicker) 等几乎所有 Element Plus 表单项。
- **反馈**: 警告 (Alert) 等。
- **导航**: 步骤条 (Steps) 等。

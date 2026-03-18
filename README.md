# Low Code

基于 Vue 3 的可配置低代码表单设计器与渲染器。

## 特性

- 🚀 **Vue 3 支持**: 采用 Vue 3 组合式 API 开发。
- 🎨 **设计器与渲染器分离**: 提供 `LcDesigner` 用于可视化设计，`LcRenderer` 用于动态渲染。
- 📦 **组件化架构**: 支持自定义组件库扩展，已支持 Element Plus (通过 `@low-code/element-plus`)。
- 📝 **灵活的 Schema**: 使用 JSON 定义表单结构，易于存储和传输。

## 安装

```bash
npm install low-code
# 或者使用 yarn / pnpm
pnpm add low-code
```

> **注意**: 该库通常需要配合 `vue` (>=3.0.0) 以及 UI 组件库（如 `@low-code/element-plus`）使用。

## 快速上手

### 1. 基础用法

参考 [App.vue](App.vue) 的实现，你可以同时在一个应用中使用设计器和渲染器。

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
import { LcDesigner, LcRenderer, layoutComponents } from 'low-code'
import componentList from '@low-code/element-plus'

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

## 核心组件

### LcDesigner
可视化设计器组件，用于生成表单 Schema。
- `v-model`: 绑定表单 Schema 对象。
- `components`: 注入的可选组件列表。

### LcRenderer
表单渲染器组件，根据 Schema 渲染表单并驱动数据。
- `schema`: 表单定义 JSON。
- `components`: 渲染所需的组件库。
- `v-model`: 绑定表单业务数据。
- `v-model:global`: 绑定全局共享数据（可选）。

## 项目结构

- `packages/element-plus`: 基于 Element Plus 封装的表单组件。
- `src/designer`: 设计器核心实现。
- `src/renderer`: 渲染器核心实现。
- `src/layouts`: 内置布局组件（Card, Grid, Tabs 等）。

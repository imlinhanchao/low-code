[English](README.md) / 简体中文

# Low Code Vue

基于 Vue 3 的可配置低代码表单设计器与渲染器。

[![Documentation](https://img.shields.io/badge/Documentation-Online-green.svg)](https://lc.hancel.org/zh)
[![npm version](https://img.shields.io/npm/v/lc.vue.svg)](https://www.npmjs.com/package/lc.vue)
[![License](https://img.shields.io/npm/l/lc.vue.svg)](https://www.npmjs.com/package/lc.vue)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/imlinhanchao/low-code)

## 特性

- 🚀 **Vue 3 支持**: 采用 Vue 3 组合式 API 开发。
- 🎨 **设计器与渲染器分离**: 提供 `LcDesigner` 用于可视化设计，`LcRenderer` 用于动态渲染。
- 📦 **组件化架构**: 支持自定义组件库扩展，已支持 Element Plus (通过 `lc-ep`)。
- 📝 **灵活的 Schema**: 使用 JSON 定义表单结构，易于存储和传输。

## 安装

```bash
npm install lc.vue
# 或者使用 yarn / pnpm
pnpm add lc.vue
```

> **注意**: 该库通常需要配合 `vue` (>=3.0.0) 以及 UI 组件库（如 `lc-ep`）使用。

## 快速上手

安装核心库 `lc.vue` 和组件库 `lc-ep` 后，你可以在 Vue 3 项目中引入设计器和渲染器组件：

```bash
npm install lc.vue lc-ep element-plus
```

在你的 Vue 3 项目中引入并使用设计器和渲染器：

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

## 核心组件

### LcDesigner

可视化设计器组件，用于生成表单 Schema。

- `v-model`: 绑定表单 Schema 对象。
- `components`: 注入的可选组件列表。

> [!NOTE]
> 设计器中所有组件，都可以使用内置变量 `$model` 来访问当前组件的数据模型，方便进行数据绑定和事件处理。
> 还可以使用 `$global` 访问全局共享数据（如果启用）。
> 若组件在插槽内，则可以使用 `$slot` 访问插槽属性。
> `$getRefs(id)` 方法可获取指定 ID 的组件实例，方便跨组件通信。

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

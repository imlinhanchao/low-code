# 快速上手

## 安装

首先安装核心库和组件扩展包：

```bash
npm install lc.vue
```

若使用 Element Plus 组件库，还需安装：

```bash
npm install lc-ep
```

## 基础用法

在 Vue 3 项目中，你可以按如下方式使用设计器：

```vue
<script setup>
import { ref } from 'vue'
import { LcDesigner, layoutComponents } from 'lc.vue'
import componentList from 'lc-ep'
import 'element-plus/dist/index.css'

const components = [
  { group: '布局', components: layoutComponents },
  ...componentList
]

const schema = ref({ widgets: [] })
</script>

<template>
  <LcDesigner v-model="schema" :components="components" />
</template>
```

使用 `schema` 渲染表单：

```vue
<script setup>
import { ref } from 'vue'
import { LcRenderer, layoutComponents } from 'lc.vue'
import componentList from 'lc-ep'
import 'element-plus/dist/index.css'

const components = [
  { group: '布局', components: layoutComponents },
  ...componentList
]
const schema = ref({ widgets: [] })
const formData = ref({})
</script>

<template>
  <LcRenderer :schema="schema" :components="components" v-model="formData" />
</template>
```

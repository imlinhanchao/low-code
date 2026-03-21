# 快速上手

## 安装 {#Installation}

首先安装核心库和组件扩展包：

```bash
npm install lc-vue3
```

若使用 Element Plus 组件库，还需安装：

```bash
npm install lc-ep
```

## 基础用法 {#BasicUsage}

在 Vue 3 项目中，你可以按如下方式使用设计器：

```vue
<script setup>
import { ref } from 'vue'
import { LcDesigner, layoutComponents } from 'lc-vue3'
import componentList from 'lc-ep'
import 'element-plus/dist/index.css'

const components = [
  { group: '布局', components: layoutComponents },
  ...componentList
]

const schema = ref({ widgets: [] })
</script>

<template>
  <LcDesigner 
    ref="designerRef"
    v-model="schema" 
    :components="components" 
  />
</template>
```

## 表单渲染 {#FormRendering}

使用 `schema` 渲染表单：

```vue
<script setup>
import { ref } from 'vue'
import { LcRenderer, layoutComponents } from 'lc-vue3'
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

## 暗色模式 {#DarkMode}

`LcDesigner` 和 `LcRenderer` 支持通过容器 class 切换暗色模式。

- 在外层容器添加 `lc-dark` 类名即可启用暗色主题。
- 移除 `lc-dark` 类名即恢复亮色主题。

```vue
<template>
  <div :class="{ 'lc-dark': isDark }">
    <LcDesigner
      v-model="schema"
      :components="components"
    />
  </div>

  <div :class="{ 'lc-dark': isDark }">
    <LcRenderer
      :schema="schema"
      :components="components"
      v-model="formData"
    />
  </div>
</template>
```

如果你的页面是全局暗色，也可以直接把 `lc-dark` 挂在更高层（例如页面根节点）统一生效。

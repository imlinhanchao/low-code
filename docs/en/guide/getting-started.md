# Getting Started

## Installation

First, install the core library and the component extension package:

```bash
npm install lc.vue
```

If using the Element Plus component library, you also need to install:

```bash
npm install lc-ep
```

## Basic Usage

In a Vue 3 project, you can use the designer as follows:

```vue
<script setup>
import { ref } from 'vue'
import { LcDesigner, layoutComponents } from 'lc.vue'
import componentList from 'lc-ep'
import 'element-plus/dist/index.css'

const components = [
  { group: 'Layout', components: layoutComponents },
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

## Form Rendering

Use `schema` to render the form:

```vue
<script setup>
import { ref } from 'vue'
import { LcRenderer, layoutComponents } from 'lc.vue'
import componentList from 'lc-ep'
import 'element-plus/dist/index.css'

const components = [
  { group: 'Layout', components: layoutComponents },
  ...componentList
]
const schema = ref({ widgets: [] })
const formData = ref({})
</script>

<template>
  <LcRenderer :schema="schema" :components="components" v-model="formData" />
</template>
```

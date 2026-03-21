English / [简体中文](https://github.com/imlinhanchao/low-code/blob/master/packages/element-plus/README_ZH.md) 

# Low Code Element Plus

A `lc-vue3` plugin package encapsulated based on [Element Plus](https://element-plus.org/), providing rich UI component support for the designer and renderer. [Development Documentation](https://lc.hancel.org/en/guide/component-definition.html)

[![npm version](https://img.shields.io/npm/v/lc-ep.svg)](https://www.npmjs.com/package/lc-ep)
[![License](https://img.shields.io/npm/l/lc-ep.svg)](https://www.npmjs.com/package/lc-ep)

## Features

- 🏗️ **Out-of-the-box**: Includes common Element Plus components such as `ElButton`, `ElInput`, `ElSelect`, `ElDatePicker`, etc.
- 🔧 **Highly Configurable**: Each component has preset property mappings (props), events, and slots, perfectly adapted for the `lc-vue3` designer.
- 🛠️ **Built-in Editors**: Provides advanced functional components such as `RulesEditor` and `FieldRulesEditor`.

## Installation

```bash
npm install lc-vue3 lc-ep element-plus
# or
pnpm add lc-vue3 lc-ep element-plus
```

> **Note**: This package depends on `element-plus` and the `lc-vue3` core library.

## Usage

Import and register the components in your project:

```vue
<template>
  <div class="app">
    <!-- Designer Mode -->
    <LcDesigner
      v-if="mode === 'designer'"
      v-model="schema"
      :components="components"
    />

    <!-- Preview/Renderer Mode -->
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
import { LcDesigner, LcRenderer, layoutComponents } from 'lc-vue3'
import componentList from 'lc-ep'
import 'lc-vue3/style.css'
import 'lc-ep/style.css'

// Combine built-in layout components and Element Plus component list
const components = [
  {
    group: 'Layout',
    components: layoutComponents 
  },
  ...componentList
]

const mode = ref<'designer' | 'preview'>('designer')
const schema = ref({ widgets: [] })
const formData = ref({})
</script>
```

## Component Classifications

The plugin package categorizes components into several major types:

- **General**: Button, Tooltip, etc.
- **Form**: Input, Select, Switch, DatePicker, and almost all other Element Plus form items.
- **Feedback**: Alert, etc.
- **Navigation**: Steps, etc.

English / [简体中文](https://github.com/imlinhanchao/low-code/blob/master/README_ZH.md) 

# Low Code Vue

A configurable low-code form designer and renderer based on Vue 3. [Online Documentation](https://lc.hancel.org/)

[![npm version](https://img.shields.io/npm/v/lc.vue.svg)](https://www.npmjs.com/package/lc.vue)
[![License](https://img.shields.io/npm/l/lc.vue.svg)](https://www.npmjs.com/package/lc.vue)

## Features

- 🚀 **Vue 3 Support**: Developed using Vue 3 Composition API.
- 🎨 **Designer & Renderer Decoupling**: Provides `LcDesigner` for visual design and `LcRenderer` for dynamic rendering.
- 📦 **Component-based Architecture**: Supports custom component library extensions, with existing support for Element Plus (via `lc-ep`).
- 📝 **Flexible Schema**: Uses JSON to define form structures, making it easy to store and transmit.

## Installation

```bash
npm install lc.vue
# Or using yarn / pnpm
pnpm add lc.vue
```

> **Note**: This library typically needs to be used with `vue` (>=3.0.0) and a UI component library (such as `lc-ep`).

## Quick Start

After installing the core library `lc.vue` and the component library `lc-ep`, you can import the designer and renderer components in your Vue 3 project:

```bash
npm install lc.vue lc-ep element-plus
```

Import and use the designer and renderer in your Vue 3 project:

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
import { LcDesigner, LcRenderer, layoutComponents } from 'lc.vue'
import componentList from 'lc-ep'

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

## Core Components

### LcDesigner

A visual designer component used to generate form Schemas.

- `v-model`: Binds the form Schema object.
- `components`: List of injectable optional components.

> [!NOTE]
> All components in the designer can use the built-in variable `$model` to access the current component's data model, facilitating data binding and event handling.
> You can also use `$global` to access globally shared data (if enabled).
> If a component is inside a slot, you can use `$slot` to access slot properties.
> The `$getRefs(id)` method can be used to get the component instance of a specified ID, facilitating cross-component communication.

### LcRenderer

A form renderer component that renders forms and drives data based on a Schema.

- `schema`: Form definition JSON.
- `components`: Component library required for rendering.
- `v-model`: Binds form business data.
- `v-model:global`: Binds globally shared data (optional).

## Project Structure

- `packages/element-plus`: Form components encapsulated based on Element Plus.
- `src/designer`: Core implementation of the designer.
- `src/renderer`: Core implementation of the renderer.
- `src/layouts`: Built-in layout components (Card, Grid, Tabs, etc.).

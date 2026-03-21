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

## Basic Usage {#BasicUsage}

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

## Form Rendering {#FormRendering}

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

## Dark Mode {#DarkMode}

`LcDesigner` and `LcRenderer` support dark mode via a container class.

- Add the `lc-dark` class on a wrapper element to enable dark theme.
- Remove the `lc-dark` class to switch back to light theme.

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

If your page already uses a global dark layout, you can also put `lc-dark` on a higher-level root container.

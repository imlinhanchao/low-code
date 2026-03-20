<script setup lang="ts">
import { computed, provide, onMounted, onUnmounted, watch, ref } from 'vue'
import type { ComponentConfig, ComponentGroup, FormSchema } from '../types'
import { layoutComponents } from '../layouts/index'
import LcWidgetNode from './WidgetNode'

/**
 * Registry that maps widget id → the component's Vue ref (element or component instance).
 * WidgetNode registers/unregisters each component here via callback refs.
 */
const widgetRefs = new Map<string, unknown>()

const props = defineProps<{
  schema: FormSchema
  components: ComponentGroup[]
  modelValue?: Record<string, unknown>
  /** Global shared data object, accessible as `$global` in prop/event expressions */
  global?: Record<string, unknown>
  /** Whether all widgets should be in model-only (view) mode */
  modelonly?: boolean
  /** Whether all widgets should be disabled */
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [data: Record<string, unknown>]
  'update:global': [data: Record<string, unknown>]
  'update:schema': [schema: FormSchema]
}>()

const formData = computed(
  () => (props.modelValue ?? {}) as Record<string, unknown>,
)

const globalData = computed(
  () => (props.global ?? {}) as Record<string, unknown>,
)

const internalSchema = ref<FormSchema>(props.schema)

watch(() => props.schema, (val) => {
  internalSchema.value = val
}, { deep: true })

/** Flatten ComponentGroup[] into a single ComponentConfig[] */
const flatComponents = computed<ComponentConfig[]>(() =>
  props.components.flatMap((g) => g.components),
)

/** All known configs: built-in layouts + user components + slot-specific components */
const allConfigs = computed<ComponentConfig[]>(() => {
  const base = [...layoutComponents, ...flatComponents.value]
  const known = new Set(base.map((c) => c.name))
  const extra: ComponentConfig[] = []
  for (const cfg of base) {
    for (const slot of cfg.slots ?? []) {
      for (const sc of slot.components ?? []) {
        if (!known.has(sc.name)) {
          known.add(sc.name)
          extra.push(sc)
        }
      }
    }
  }
  return [...base, ...extra]
})

function getConfig(name: string): ComponentConfig | undefined {
  return allConfigs.value.find((c) => c.name === name)
}

function getFormData() {
  return formData.value
}

// ── Global config: CSS injection ─────────────────────────────────────────────

const styleId = 'lc-global-css-' + Math.random().toString(36).slice(2, 8)
let styleEl: HTMLStyleElement | null = null

function injectCss(css: string | undefined) {
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = styleId
    document.head.appendChild(styleEl)
  }
  styleEl.textContent = css ?? ''
}

watch(() => internalSchema.value.global?.css, (css) => {
  injectCss(css)
}, { immediate: true })

onUnmounted(() => {
  styleEl?.remove()
  styleEl = null
})

// ── Global config: function execution helper ──────────────────────────────────

/** Known parameter names for built-in lifecycle functions */
const LIFECYCLE_PARAMS: Record<string, string[]> = {
  onMounted: [],
  onModelChange: ['fieldName', 'value', 'formData'],
}

/** Retrieve a component ref instance by widget id (used via $getRefs in user code) */
function getRefs(id: string): unknown {
  return widgetRefs.get(id)
}

function setProps(widgetId: string, propsToSet: Record<string, unknown>) {
  const findAndSet = (widgets: any[]) => {
    for (const w of widgets) {
      if (w.id === widgetId) {
        w.props = { ...w.props, ...propsToSet }
        return true
      }
      if (w.slots) {
        for (const children of Object.values(w.slots)) {
          if (findAndSet(children as any[])) return true
        }
      }
    }
    return false
  }

  // Directly update the reactive internalSchema
  if (findAndSet(internalSchema.value.widgets)) {
    emit('update:schema', { ...internalSchema.value })
  }
}

function getProps(widgetId: string): Record<string, unknown> | undefined {
  const findWidgets = (widgets: any[]): Record<string, unknown> | undefined => {
    for (const w of widgets) {
      if (w.id === widgetId) {
        return { ...w.props }
      }
      if (w.slots) {
        for (const children of Object.values(w.slots)) {
          const res = findWidgets(children as any[])
          if (res) return res
        }
      }
    }
    return undefined
  }
  return findWidgets(internalSchema.value.widgets)
}

function execGlobalFn(name: string, ...args: unknown[]) {
  const body = internalSchema.value.global?.functions?.[name]
  if (!body?.trim()) return
  try {
    // Build a helper scope: inject other named functions as variables
    const allFunctions = internalSchema.value.global?.functions ?? {}
    const helperNames: string[] = []
    const helperValues: unknown[] = []
    for (const [fnName, fnBody] of Object.entries(allFunctions)) {
      if (fnName !== name && fnBody?.trim()) {
        try {
          // Create each helper as a callable function (no predefined params)
          // eslint-disable-next-line no-new-func
          helperNames.push(fnName)
          helperValues.push(new Function(fnBody))
        } catch {
          // ignore helpers with syntax errors
        }
      }
    }
    // Inject helpers as named params followed by $model, $global, $getRefs, $getProps, $setProps and lifecycle params.
    // $model gives global functions reactive access to the current form data.
    // $global gives global functions access to the shared global object.
    // $getRefs allows global functions to access component instances by widget id.
    // $getProps allows global functions to read widget props.
    // $setProps allows global functions to update widget props dynamically.
    const paramNames = LIFECYCLE_PARAMS[name] ?? []
    // eslint-disable-next-line no-new-func
    const fn = new Function(...helperNames, '$model', '$global', '$getRefs', '$getProps', '$setProps', ...paramNames, body)
    fn(...helperValues, formData.value, globalData.value, getRefs, getProps, setProps, ...args)
  } catch (e) {
    console.error(`[lc-renderer] ${name} error:`, e)
  }
}

// ── Global config: lifecycle hooks ───────────────────────────────────────────

onMounted(() => {
  execGlobalFn('onMounted')
})

// ── Model update (calls onModelChange if defined) ─────────────────────────────

function updateModel(fieldName: string, value: unknown) {
  const current = { ...formData.value }
  current[fieldName] = value
  emit('update:modelValue', current)
  execGlobalFn('onModelChange', fieldName, value, { ...current })
}

function updateGlobal(key: string, value: unknown) {
  const current = { ...globalData.value }
  current[key] = value
  emit('update:global', current)
}

function getGlobalData() {
  return globalData.value
}

// Provide context for recursive LcWidgetNode rendering
provide('lc:getConfig', getConfig)
provide('lc:getFormData', getFormData)
provide('lc:updateModel', updateModel)
provide('lc:widgetRefs', widgetRefs)
provide('lc:getRefs', getRefs)
provide('lc:getProps', getProps)
provide('lc:setProps', setProps)
provide('lc:getGlobalData', getGlobalData)
provide('lc:updateGlobal', updateGlobal)
provide('lc:globalModelOnly', computed(() => props.modelonly))
provide('lc:globalDisabled', computed(() => props.disabled))
</script>

<template>
  <div class="lc-renderer">
    <LcWidgetNode
      v-for="widget in internalSchema.widgets"
      :key="widget.id"
      :widget="widget"
    />
  </div>
</template>


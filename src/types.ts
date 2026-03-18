import type { Component, DefineComponent } from 'vue'

/** Definition of a named slot that a component exposes */
export interface SlotConfig {

  name: string
  /** Human-readable label shown in the designer */
  label?: string
  /** Sub-component configs allowed in this slot (empty = any) */
  components?: ComponentConfig[]
  /**
   * When true, slot children are "virtual" components (e.g. ElOption inside ElSelect)
   * that don't render visible content at their slot-mount position.  In the designer
   * they are shown as clickable chips in the panel rather than embedded inside the
   * parent component's visual area.
   */
  virtual?: boolean
  /**
   * When true, this slot will NOT render a static placeholder in the canvas when it
   * has no children.  Use this for modifier/decorator slots (e.g. label, error) where
   * providing an empty slot would override the component's own rendering logic.
   */
  noPlaceholder?: boolean
}

/** Shape of an event parameter */
export interface EventParam {
  name: string
  type: unknown
}

/**
 * Metadata for a single component prop.
 * Used in ComponentConfig.props to describe the prop's type, label, default, etc.
 */
export interface PropConfig {
  /** JavaScript type constructor: String, Boolean, Number, Function, Object, Array */
  type: BooleanConstructor | StringConstructor | NumberConstructor | FunctionConstructor | ObjectConstructor | ArrayConstructor
  /** Human-readable label shown in the designer */
  label?: string
  /** Default value; falls back to undefined when not set */
  default?: unknown
  /** Allowed string values – renders a <select> in the designer */
  options?: string[]
  /** For Function-type props: named parameters */
  params?: EventParam[]
  /** If true, renders a multiline textarea in the designer instead of a single-line input */
  multiline?: boolean
  /**
   * The component must accept a `modelValue` prop (the current JSON value) and
   * emit `update:modelValue` with the new value.  It is rendered inside the
   * standard prop-editor dialog.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dialog?: DefineComponent<any, any, any> | Component
  /**
   * For Array type: describes the schema of each array item.
   * When present the designer shows an inline collapsible list with add/delete buttons.
   * When absent the array is edited as raw JSON.
   */
  item?: PropConfig
  /**
   * For Object type: named sub-properties shown as an inline collapsible editor.
   * When present the designer renders each sub-prop with its own type-aware UI.
   * When absent (and no `dialog`) the object is edited as raw JSON.
   */
  props?: Record<string, PropConfig>
  /**
   * Optional tooltip hint text shown as an info icon (ⓘ) next to the property
   * label in the designer.  Hovering the icon reveals the tooltip content.
   */
  tooltip?: string
}

/** Returns true when a ComponentConfig.props value is a PropConfig descriptor */
export function isPropConfig(v: unknown): v is PropConfig {
  return v !== null && typeof v === 'object' && 'type' in (v as object)
}

/** Config entry for a single registerable component (or built-in layout) */
export interface ComponentConfig {
  /** Display name shown in the palette */
  name: string
  /**
   * Iconify icon name (e.g. 'mdi:button-cursor').
   * When provided, the palette renders the icon beside the component name.
   */
  icon?: string
  /**
   * 'layout'  – built-in container (always shown in the 布局 section of the palette).
   * 'widget'  – user-configured component (default when omitted).
   */
  category?: 'layout' | 'widget'
  /** The actual Vue component constructor */
  component: Component
  /** Default static prop values */
  props?: Record<string, unknown>
  /** Default v-model bindings */
  models?: Record<string, unknown>
  /** Declared events */
  events?: Record<string, EventParam[]>
  /**
   * Static list of slots.
   * For layouts whose slot set depends on props (e.g. a grid with N columns),
   * use `computeSlots` instead (or in addition).
   */
  slots?: SlotConfig[]
  /**
   * Called with the widget's current props to derive the effective slot list.
   * Takes precedence over the static `slots` array when provided.
   */
  computeSlots?: (props: Record<string, unknown>) => SlotConfig[]
  /**
   * Display name used when this component appears as a slot child in the designer's
   * slot panel.  Can be:
   *  - a plain string (shown as-is), or
   *  - a function that receives the component's current prop values and returns a string.
   * Falls back to `name` when not provided.
   */
  slotName?: string | ((props: Record<string, unknown>) => string)
}

/**
 * Resolves the display name for a widget when it appears as a slot child.
 * Uses `ComponentConfig.slotName` (string or function) if provided.
 * Falls back to `config.name` when `slotName` is absent or returns a falsy value.
 */
export function resolveSlotName(config: ComponentConfig, props: Record<string, unknown>): string {
  if (config.slotName === undefined) return config.name
  if (typeof config.slotName === 'function') {
    try {
      const result = config.slotName(props)
      return (result != null && result !== '') ? String(result) : config.name
    } catch { return config.name }
  }
  return config.slotName || config.name
}

/**
 * A named group of components shown as a collapsible palette section.
 * Groups are displayed in array order, which makes the group order explicit.
 * Use an empty string for `group` to create an ungrouped (default) section.
 */
export interface ComponentGroup {
  /** Section heading shown in the palette (empty string → "自定义组件") */
  group: string
  /** Components belonging to this group */
  components: ComponentConfig[]
}

/** One widget instance placed on the canvas */
export interface WidgetSchema {
  /** Unique instance id */
  id: string
  /** Matches ComponentConfig.name */
  name: string
  /** Mirrors ComponentConfig.category; stored so the canvas can render without looking up the config */
  category: 'layout' | 'widget'
  /**
   * Per-model field names used as flat keys in the form data output.
   * Maps each model key to the field name exposed in the form data.
   * E.g. `{ modelValue: 'username' }` → form data becomes `{ username: 'hello' }`
   * instead of `{ someId: { modelValue: 'hello' } }`.
   * Only present for widgets that have v-model bindings.
   */
  fields?: Record<string, string>
  /**
   * Per-model binding sources.
   * Determines where each model's value is read from and written to.
   * Supports dot-notation to address a nested object as the data container:
   *   '$model'          → formData[fieldName]          (default, read/write)
   *   '$model.section'  → formData.section[fieldName]  (read/write)
   *   '$global'         → globalData[fieldName]        (read/write)
   *   '$global.section' → globalData.section[fieldName](read/write)
   *   '$scope'          → scope[fieldName]             (read-only)
   *   '$scope.row'      → scope.row[fieldName]         (read-only)
   */
  sources?: Record<string, string>
  /** Current prop values */
  props: Record<string, unknown>
  /** Current v-model values */
  models: Record<string, unknown>
  /**
   * Simple text for the default slot of leaf widgets (e.g. button label).
   * Overridden by `slots.default` children when present.
   */
  slotContent?: string
  /** User-authored event handler function bodies: eventName → function body string */
  events?: Record<string, string>
  /** Named slot children: slotName → ordered child widget list */
  slots: Record<string, WidgetSchema[]>
}

/**
 * Global configuration for the entire form.
 * Contains CSS styles and function definitions (lifecycle hooks + custom helpers).
 */
export interface GlobalConfig {
  /** Global CSS styles injected into the page when the form renders */
  css?: string
  /**
   * Named function bodies.
   * Built-in lifecycle keys: 'onMounted', 'onModelChange'.
   * Any other key is treated as a named helper function available via the global scope.
   */
  functions?: Record<string, string>
}

/** The full form schema produced by the designer */
export interface FormSchema {
  widgets: WidgetSchema[]
  /** Global CSS and function definitions for the form */
  global?: GlobalConfig
}

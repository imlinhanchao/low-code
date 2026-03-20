import type { Component, DefineComponent } from 'vue'
import { useI18n } from './designer/i18n'

/** Returns true when a ComponentConfig.props value is a PropConfig descriptor */
export function isPropConfig(v: unknown): v is ComponentProp {
  return v !== null && typeof v === 'object' && 'type' in (v as object)
}

/**
 * Resolves the display name for a widget when it appears as a slot child.
 * Uses `ComponentConfig.slotName` (string or function) if provided.
 * Falls back to `config.name` when `slotName` is absent or returns a falsy value.
 */
export function resolveSlotName(config: ComponentConfig, props: Record<string, unknown>): string {
  const { tt } = useI18n()
  const getName = () => tt(config.label)

  if (config.slotName === undefined) return getName()
  if (typeof config.slotName === 'function') {
    try {
      const result = config.slotName(props)
      return (result != null && result !== '') ? String(result) : getName()
    } catch { return getName() }
  }
  return config.slotName || getName()
}

/** 
 * One widget instance placed on the canvas 
 * 一个放置在画布上的组件实例
 */
export interface WidgetSchema {
  /** 
   * Unique instance id  
   * 组件实例的唯一 ID
   */
  id: string
  /** 
   * Matches ComponentConfig.name  
   * 对应的组件配置名称
   */
  name: string
  /** 
   * Mirrors ComponentConfig.category; stored so the canvas can render without looking up the config  
   * 对应的组件类别，存储以便画布在渲染时无需查找配置
   */
  category: 'layout' | 'widget'
  /**
   * Per-model field names used as flat keys in the form data output.
   * Maps each model key to the field name exposed in the form data.
   * E.g. `{ modelValue: 'username' }` → form data becomes `{ username: 'hello' }`
   * instead of `{ someId: { modelValue: 'hello' } }`.
   * Only present for widgets that have v-model bindings.
   * 每个模型使用的字段名称，作为表单数据输出中的扁平键。
   * 将每个模型键映射到在表单数据中公开的字段名称。
   * 例如 `{ modelValue: 'username' }` → 表单数据变为 `{ username: 'hello' }`
   * 而不是 `{ someId: { modelValue: 'hello' } }`。
   * 仅存在于具有 v-model 绑定的组件中。
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
   *   '$scope.section'  → scope.section[fieldName]     (read/write via direct mutation)
   * 模型的绑定来源。
   * 确定每个模型的值从哪里读取和写入。
   * 支持点表示法来指定一个嵌套对象作为数据容器：
   *   '$model'          → formData[fieldName]          (默认，读/写)
   *   '$model.section'  → formData.section[fieldName]  (读/写)
   *   '$global'         → globalData[fieldName]        (读/写)
   *   '$global.section' → globalData.section[fieldName](读/写)
   *   '$scope'          → scope[fieldName]             (只读)
   *   '$scope.section'  → scope.section[fieldName]     (通过直接修改读/写)
   */
  sources?: Record<string, string>
  /** 
   * Current prop values
   * 当前属性值
   */
  props: Record<string, unknown>
  /** 
   * Current v-model values
   * 当前 v-model 值
   */
  models: Record<string, unknown>
  /**
   * Simple text for the default slot of leaf widgets (e.g. button label).
   * Overridden by `slots.default` children when present.
   * 叶子组件默认插槽的简单文本（例如按钮标签）。当存在 `slots.default` 子项时被覆盖。
   * 设计器中输入的默认插槽的简单文本（例如按钮标签）。当存在 `slots.default` 子项时被覆盖。
   */
  slotContent?: string
  /** 
   * User-authored event handler function bodies: eventName → function body string
   * 用户编写的事件处理函数体：事件名称 → 函数体字符串
   */
  events?: Record<string, string>
  /** 
   * Named slot children: slotName → ordered child widget list
   * 命名插槽子组件：slotName → 有序子组件列表
   */
  slots: Record<string, WidgetSchema[]>
}

/**
 * Global configuration for the entire form.
 * Contains CSS styles and function definitions (lifecycle hooks + custom helpers).
 * 整个表单的全局配置。
 * 包含 CSS 样式和函数定义（生命周期钩子 + 自定义助手函数）。
 */
export interface GlobalConfig {
  /** 
   * Global CSS styles injected into the page when the form renders  
   * 设计器中输入的全局 CSS 样式，在表单渲染时注入到页面中
   */
  css?: string
  /**
   * Named function bodies.
   * Built-in lifecycle keys: 'onMounted', 'onModelChange'.
   * Any other key is treated as a named helper function available via the global scope.
   * 函数名称与函数体字符串的映射。
   * 内置生命周期键：'onMounted'、'onModelChange'。
   * 任何其他键都被视为一个命名的辅助函数，可以通过全局作用域使用。
   */
  functions?: Record<string, string>
}

/** 
 * The full form schema produced by the designer 
 * 设计器生成的完整表单 schema
 **/
export interface FormSchema {
  /**
   * Root-level widgets that are direct children of the canvas.
   * 画布的直接子组件的根级组件列表
   */
  widgets: WidgetSchema[]
  /** 
   * Global CSS and function definitions for the form
   * 表单的全局 CSS 和函数定义
   */
  global?: GlobalConfig
}

/**
 * Configuration for a component slot, which may contain nested child components.
 * 组件插槽的配置项，可能包含嵌套的子组件。
 */
export interface SlotConfig {
  /**
   * Name of the slot as used in the component's template (e.g. 'default', 'header', 'footer').  
   * 插槽名称，作为组件模板中使用的名称（例如 'default'、'header'、'footer'）。
   */
  name: string
  /**
   * Optional display label for this slot, shown in the designer's slot panel.   
   * Falls back to `name` when not provided.  
   * 支持国际化：传入对象时，设计器会将其视为国际化配置，例如：{ 'zh-CN': '标题', 'en-US': 'Title' }
   * 该插槽在设计器的插槽面板中显示的可选标签。  
   * 未提供时回退到 `name`。
   */
  label?: string | Record<string, string>
  /**
   * Nested components allowed within this slot.  If omitted, the slot accepts any components.  
   * 该插槽内允许的嵌套组件。如果省略，则该插槽接受任何组件。  
   */
  components?: ComponentConfig[]
  /**
   * When true, the designer does not render a placeholder for this slot when it's empty.  
   * This is useful for slots that are purely functional (e.g. a table column slot) and don't
   * need a visual placeholder in the designer.  
   * 当为 true 时，当该插槽为空时，设计器不会为其渲染占位符。  
   * 这对于纯功能性的插槽（例如表格列插槽）非常有用，在设计器中不需要视觉占位符。  
   */
  virtual?: boolean
  /**
   * When true, the designer does not render a placeholder for this slot when it's empty.  
   * This is useful for modifier/decorator slots (e.g. label, error) where providing an empty slot
   * would override the component's own rendering logic.  
   * 当为 true 时，当该插槽为空时，设计器不会为其渲染占位符。  
   * 这对于修饰符/装饰器插槽（例如标签、错误）非常有用，在这种情况下提供一个空插槽会覆盖组件自己的渲染逻辑。  
   */
  noPlaceholder?: boolean
}

/**
 * Event parameter definition used for describing the parameters of events emitted by components.
 * 组件发出的事件参数定义。
 */
export interface EventParam {
  /**
   * Name of the event parameter (e.g. 'value' for an input event).  
   * 事件参数的名称（例如输入事件的 'value'）。  
   */
  name: string
  /**
   * JavaScript type of the event parameter (e.g. String, Number, Object).  
   * 事件参数的 JavaScript 类型（例如 String、Number、Object）。  
   */
  type: unknown
}

/**
 * Component property configuration used for describing the props of components, including their types, default values, and how they should be edited in the designer.
 * 组件属性配置，用于描述组件的 props，包括它们的类型、默认值以及在设计器中如何编辑它们。
 * 设计器使用这些信息来渲染属性编辑器，并为组件提供适当的默认值和编辑界面。
 */
export interface ComponentProp {
  /**
   * JavaScript type constructor for this prop (e.g. String, Boolean, Number, Function, Object, Array).
   * This is used by the designer to determine how to render the prop editor.
   * 该属性的 JavaScript 类型构造函数（例如 String、Boolean、Number、Function、Object、Array）。
   * 设计器使用它来确定如何渲染属性编辑器。
   */
  type: any;
  /**
   * Optional display label for this prop, shown in the designer's prop editor.
   * Falls back to the prop name when not provided.
   * 支持国际化：传入对象时，设计器会将其视为国际化配置，例如：{ 'zh-CN': '标题', 'en-US': 'Title' }
   * 该属性在设计器的属性编辑器中显示的可选标签。
   * 未提供时回退到属性名称。
   */
  label?: string | Record<string, string>;
  /**
   * For Array type: defines the type of items in the array.
   * When provided, the designer shows an inline collapsible list with add/delete buttons.
   * When omitted, the array is edited as raw JSON.
   * 对于 type 为 Array 的属性：定义数组项的类型。
   * 当提供时，设计器显示一个内联可折叠的列表，并带有添加/删除按钮。
   * 当未提供时，数组以原始 JSON 形式编辑。
   */
  item?: ComponentProp;
  /**
   * For Object type: defines the sub-properties of the object.
   * When provided, the designer renders an inline collapsible editor with type-aware UI for each sub-property.
   * When omitted (and no `dialog`), the object is edited as raw JSON.
   * 对于 type 为 Object 的属性：定义对象的子属性。
   * 当提供时，设计器渲染一个内联可折叠的编辑器，每个子属性都有自己的类型感知 UI。
   * 当未提供（且没有 `dialog`）时，对象以原始 JSON 形式编辑。
   */
  props?: Record<string, ComponentProp>;
  /**
   * Default value for this prop; falls back to undefined when not set.
   * 属性的默认值；未设置时回退到 undefined。
   */
  default?: any;
  /**
   * For String-type props: allowed string values.  
   * When provided, the designer renders a <select> dropdown instead of a free-text input.  
   * 字符串类型属性的允许字符串值。当提供时，设计器会渲染一个 <select> 下拉菜单，而不是自由文本输入。
   */
  options?: any[];  // For enum types, defines the possible values
  /**
   * For Function-type props: named parameters of the function.  
   * When provided, the designer shows a structured UI for editing the function's parameters.  
   * 函数类型属性的命名参数。当提供时，设计器会显示一个结构化的 UI 来编辑函数的参数。
   */
  params?: EventParam[];
  /**
   * Dialog component used for editing this prop in the designer.  
   * 设计器中用于编辑此属性的对话框组件。
   */
  dialog?: DefineComponent<any, any, any> | Component;
  /** 
   * Optional tooltip hint text shown as an info icon (ⓘ) next to the property
   * label in the designer.  Hovering the icon reveals the tooltip content.
   * 设计器中在属性标签旁显示为信息图标（ⓘ）的可选工具提示文本。
   * 悬停图标会显示工具提示内容。
   */
  tooltip?: string;
  /** 
   * If true, renders a multiline textarea in the designer instead of a single-line input 
   * 在设计器中渲染多行文本区域而不是单行输入框
   */
  multiline?: boolean
}

/**
 * Configuration for a component in the designer's palette, including how it should be rendered on the canvas and how its props and events are defined.
 * 设计器组件库中组件的配置，包括它在画布上的渲染方式以及其 props 和事件的定义。
 */
export interface ComponentConfig {
  /**
   * Internal unique identifier. Used for lookup and persistence.
   * 内部唯一标识符。用于查找和持久化。
   */
  name: string
  /**
   * Display text shown in the palette and properties panel.
   * 支持国际化：传入对象时，设计器会将其视为国际化配置，例如：{ 'zh-CN': '标题', 'en-US': 'Title' }
   * 在组件库面板和属性面板中显示的名称。
   */
  label: string | Record<string, string>
  /**
   * Iconify icon name (e.g. 'mdi:button-cursor').  
   * When provided, the palette renders the icon beside the component name.  
   * Iconify 图标名称（例如 'mdi:button-cursor'）。  
   * 提供时，组件库面板会在组件名称旁边渲染图标。
   */
  icon?: string
  /**
   * 'layout'  – built-in container (always shown in the 布局 section of the palette).
   * 'widget'  – user-configured component (default when omitted).  
   * 'layout'  – 内置容器（始终显示在组件库的布局部分）。  
   * 'widget'  – 用户配置的组件（省略时默认为 widget）。
   */
  category?: 'layout' | 'widget'
  /**
   * The actual Vue component constructor.  This is what the designer renders when this component is used in the schema.  
   * 实际的 Vue 组件构造函数。当在 schema 中使用此组件时，设计器会渲染它。
   */
  component: Component
  /**
   * (Optional) Function to format the display value when the widget is in readonly mode.
   * Receives the widget's current props and the full form data object.
   * (可选) 当组件处于只读模式时用于格式化显示内容的函数。
   * 接收组件当前的 props 和完整的表单数据对象。
   */
  format?: (props: Record<string, any>, formData: Record<string, any>) => string
  /**
   * Default static prop values for this component.
   * These are merged with any props set in the schema and can be used to provide default values for props that are required by the component but not set in the schema.
   * 该组件的默认静态属性值。
   * 这些值与 schema 中设置的任何属性合并，并且可以用于为组件所需但未在 schema 中设置的属性提供默认值。
   */
  props?: Record<string, ComponentProp>
  /**
   * Default v-model bindings for this component.  
   * These are merged with any v-model bindings set in the schema and can be used to provide default bindings for components that require v-model but are not set in the schema.  
   * 该组件的默认 v-model 绑定。
   * 这些绑定与 schema 中设置的任何 v-model 绑定合并，并且可以用于为需要 v-model 但未在 schema 中设置的组件提供默认绑定。
   */
  models?: Record<string, unknown>
  /**
   * Events emitted by this component, with their parameters.  
   * This is used by the designer to show a structured UI for configuring event handlers.  
   * 该组件发出的事件及其参数。
   * 设计器使用它来显示一个结构化的 UI，用于配置事件处理程序。
   */
  events?: Record<string, EventParam[]>
  /**
   * Static list of slots for this component.
   * For layouts whose slot set depends on props (e.g. a grid with N columns), use `computeSlots` instead (or in addition).
   * 该组件的静态插槽列表。
   * 对于插槽集依赖于属性的布局（例如具有 N 列的网格），请改用 `computeSlots`（或同时使用）。
   */
  slots?: SlotConfig[]
  /**
   * Called with the widget's current props to derive the effective slot list.
   * Takes precedence over the static `slots` array when provided.  
   * 使用组件当前的属性调用以推导出有效的插槽列表。
   * 提供时优先于静态 `slots` 数组。
   */
  computeSlots?: (props: Record<string, unknown>) => SlotConfig[]
  /**
   * Display name used when this component appears as a slot child in the designer's slot panel.  Can be:
   *  - a plain string (shown as-is), or
   *  - a function that receives the component's current prop values and returns a string.
   * Falls back to `name` when not provided.  
   * 当此组件作为设计器的插槽面板中的插槽子项出现时使用的显示名称。可以是：
   *  - 一个普通字符串（原样显示），或者
   *  - 一个函数，接收组件当前的属性值并返回一个字符串。
   * 未提供时回退到 `name`。
   */
  slotName?: string | ((props: unknown) => string)
}

/**
 * Component group used to organize components in the designer's palette.
 * 设计器组件库中用于组织组件的组件组。
 */
export interface ComponentGroup {
  /**
   * Display name shown in the palette section header.
   * 支持国际化：传入对象时，设计器会将其视为国际化配置，例如：{ 'zh-CN': '标题', 'en-US': 'Title' }
   */
  group: string | Record<string, string>
  /**
   * Components belonging to this group, shown as items in the collapsible section.
   */
  components: ComponentConfig[]
}

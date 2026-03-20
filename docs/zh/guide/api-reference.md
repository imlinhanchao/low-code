# 核心类型定义

本文档详细介绍了低代码平台中用于定义组件和属性的核心 TypeScript 接口。

## ComponentConfig

组件的核心配置接口，定义了组件在设计器中的行为和元数据。

| 属性 | 类型 | 说明 |
| :--- | :--- | :--- |
| `name` | `string` | 内部唯一标识符。用于查找和持久化 |
| `label` | `string \| Record<string, string>` | 在面板中显示的名称，支持国际化配置 |
| `icon` | `string` | (可选) Iconify 图标名称 |
| `category` | `'layout' \| 'widget'` | (可选) 组件类别，默认为 `widget` |
| `component` | `Component` | 实际渲染的 Vue 组件构造函数 |
| `props` | `Record<string, ComponentProp>` | (可选) 组件的属性定义 |
| `models` | `Record<string, unknown>` | (可选) 组件的默认 v-model 绑定 |
| `events` | `Record<string, EventParam[]>` | (可选) 组件发出的事件定义 |
| `slots` | `SlotConfig[]` | (可选) 组件的静态插槽列表 |
| `computeSlots` | `(props: Record) => SlotConfig[]` | (可选) 动态计算插槽的函数 |
| `slotName` | `string \| ((props) => string)` | (可选) 作为子项时的显示名称 |
| `format` | `(props, data) => string` | (可选) 只读模式下的内容格式化函数 |

---

## GlobalConfig

表单的全局配置，定义了表单级别的样式、脚本和功能。

| 属性 | 类型 | 说明 |
| :--- | :--- | :--- |
| `css` | `string` | (可选) 全局 CSS 样式字符串 |
| `functions` | `Record<string, string>` | (可选) 命名的全局函数或生命周期钩子字符串 |

---

## ComponentProp

用于描述组件 Props 的元数据，设计器据此生成属性编辑器。

| 属性 | 类型 | 说明 |
| :--- | :--- | :--- |
| `type` | `any` | JS 类型构造函数 (String, Number, Boolean, Object, Array, Function) |
| `label` | `string \| Record<string, string>` | (可选) 编辑器中显示的标签，支持国际化配置 |
| `default` | `any` | (可选) 属性默认值 |
| `options` | `any[]` | (可选) 仅用于 String 类型，渲染为下拉选择框 |
| `item` | `ComponentProp` | (可选) 仅用于 Array 类型，定义数组项配置 |
| `props` | `Record<string, ComponentProp>` | (可选) 仅用于 Object 类型，定义嵌套子属性 |
| `params` | `EventParam[]` | (可选) 仅用于 Function 类型，定义函数参数 |
| `dialog` | `Component` | (可选) 自定义弹窗编辑器组件 |
| `tooltip` | `string` | (可选) 属性旁边的提示文本 |
| `multiline` | `boolean` | (可选) 渲染为多行文本框 |

---

## SlotConfig

组件插槽的配置。`label` 支持国际化配置。

| 属性 | 类型 | 说明 |
| :--- | :--- | :--- |
| `name` | `string` | 插槽名称 (如 `default`, `header`) |
| `label` | `string \| Record<string, string>` | (可选) 设计器中显示的标签 |
| `components` | `ComponentConfig[]` | (可选) 限制该插槽内允许放入的组件 |
| `virtual` | `boolean` | (可选) 为 true 时，空插槽不渲染占位符 |
| `noPlaceholder`| `boolean` | (可选) 为 true 时，不渲染占位符 (常用于修饰类插槽) |

---

## EventParam

事件参数或函数参数的定义。

| 属性 | 类型 | 说明 |
| :--- | :--- | :--- |
| `name` | `string` | 参数名称 |
| `type` | `unknown` | 参数的 JavaScript 类型 |


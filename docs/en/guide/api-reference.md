# Core Type Definitions

This document details the core TypeScript interfaces used to define components and properties in the low-code platform.

## ComponentConfig

The core configuration interface for components, defining behavior and metadata in the designer.

| Property | Type | Description |
| :--- | :--- | :--- |
| `name` | `string` | Internal unique identifier. Used for lookup and persistence. |
| `label` | `string \| Record<string, string>` | Name displayed in the panel, supports i18n configuration. |
| `icon` | `string` | (Optional) Iconify icon name. |
| `category` | `'layout' \| 'widget'` | (Optional) Component category, default is `widget`. |
| `component` | `Component` | The actual Vue component constructor for rendering. |
| `props` | `Record<string, ComponentProp>` | (Optional) Property definitions for the component. |
| `models` | `Record<string, unknown>` | (Optional) Default v-model bindings for the component. |
| `events` | `Record<string, EventParam[]>` | (Optional) Event definitions emitted by the component. |
| `slots` | `SlotConfig[]` | (Optional) Static list of slots for the component. |
| `computeSlots` | `(props: Record) => SlotConfig[]` | (Optional) Function for dynamically calculating slots. |
| `slotName` | `string \| ((props) => string)` | (Optional) Display name when used as a child item. |
| `format` | `(props, data) => string` | (Optional) Content formatting function for read-only mode. |

---

## GlobalConfig

Global configuration for the form, defining form-level styles, scripts, and features.

| Property | Type | Description |
| :--- | :--- | :--- |
| `css` | `string` | (Optional) Global CSS style string. |
| `functions` | `Record<string, string>` | (Optional) Named global functions or lifecycle hook strings. |

---

## ComponentProp

Metadata used to describe component Props, from which the designer generates property editors.

| Property | Type | Description |
| :--- | :--- | :--- |
| `type` | `any` | JS type constructor (String, Number, Boolean, Object, Array, Function). |
| `label` | `string \| Record<string, string>` | (Optional) Label displayed in the editor, supports i18n. |
| `default` | `any` | (Optional) Default value for the property. |
| `options` | `any[]` | (Optional) Used only for String type, renders as a dropdown selector. |
| `item` | `ComponentProp` | (Optional) Used only for Array type, defines array item configuration. |
| `props` | `Record<string, ComponentProp>` | (Optional) Used only for Object type, defines nested sub-properties. |
| `params` | `EventParam[]` | (Optional) Used only for Function type, defines function parameters. |
| `dialog` | `Component` | (Optional) Custom dialog editor component. |
| `tooltip` | `string` | (Optional) Tooltip text next to the property. |
| `multiline` | `boolean` | (Optional) Renders as a multi-line text area. |

---

## SlotConfig

Configuration for component slots. `label` supports internationalization.

| Property | Type | Description |
| :--- | :--- | :--- |
| `name` | `string` | Slot name (e.g., `default`, `header`). |
| `label` | `string \| Record<string, string>` | (Optional) Label displayed in the designer. |
| `components` | `ComponentConfig[]` | (Optional) Restricts components allowed within this slot. |
| `virtual` | `boolean` | (Optional) If true, empty slots do not render placeholders. |
| `noPlaceholder`| `boolean` | (Optional) If true, does not render placeholders (common for decorative slots). |

---

## EventParam

Definition of event parameters or function parameters.

| Property | Type | Description |
| :--- | :--- | :--- |
| `name` | `string` | Parameter name. |
| `type` | `unknown` | JavaScript type of the parameter. |


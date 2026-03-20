# Component Definition Standards

In the low-code platform, every component needs to be defined via a standard object so that the designer can recognize its properties, events, and slots.

## Definition Structure

```typescript
export interface ComponentConfig {
  /**
   * Internal unique identifier. Used for lookup and persistence.
   */
  name: string;
  /**
   * The name displayed in the component library panel and the property panel.
   * Supports internationalization: when an object is passed, the designer treats it as an i18n configuration, e.g.: { 'zh-CN': '标题', 'en-US': 'Title' }
   */
  label: string | Record<string, string>;
  /**
   * Component icon (supports Iconify)
   */
  icon: string;
  /**
   * Component category (e.g., layout components, functional components, etc.), default is 'widget'
   */
  category?: 'layout' | 'widget'
  /**
   * The actual Vue component to render
   */
  component: any;
  /**
   * Component property definitions
   */
  props: Record<string, PropDefinition>;
  /**
   * Component event definitions
   */
  events?: Record<string, EventDefinition>;
  /**
   * Component slot definitions
   */
  slots?: SlotDefinition[]; 
  /**
   * Custom slot calculation function
   */
  computeSlots?: (props: Record<string, any>) => SlotDefinition[];
  /**
   * Display name when used as a child item, supports string or function
   */
  slotName?: string | ((props: Record<string, any>) => string); // Display name when used as a child item
}
```

## Property Definitions (Props)

Property definitions determine the type of editor displayed in the designer sidebar. Both `label` and `options` support internationalization object configuration:

```typescript
props: {
  size: { 
    type: String, 
    label: { 'zh-CN': '尺寸', 'en-US': 'Size' }, 
    options: ['default', 'small', 'large'] 
  },
  disabled: { 
    type: Boolean, 
    label: { 'zh-CN': '禁用', 'en-US': 'Disabled' } 
  },
  // Object type: usually used for configuring complex sub-properties
  style: {
    type: Object,
    label: 'Custom Style',
    props: {
      color: { type: String, label: 'Color' },
      fontSize: { type: String, label: 'Font Size' }
    }
  },
  // Array type: usually used for dropdown options, list data, etc.; can define normal types or Object types for complex structures
  options: {
    type: Array,
    label: { 'zh-CN': '选项列表', 'en-US': 'Options List' },
    item: {
      type: Object,
      props: {
        label: { type: String, label: { 'zh-CN': '选项标签', 'en-US': 'Option Label' } },
        value: { type: String, label: { 'zh-CN': '选项值', 'en-US': 'Option Value' } }
      }
    }
  }
}
```

## Slot Definitions (Slots)

Slots are used to define parts within a component where content can be nested:

```typescript
slots: [
  { 
    name: 'default', 
    label: 'Default Slot',
  },
  { 
    name: 'header', 
    label: 'Header' 
  }
]
```

## Dynamic Slot Calculation (computeSlots)

For components whose slot count or names depend on properties (Props) (e.g., grid layout columns, tab page labels, table columns/rows), the `computeSlots` function can be used to dynamically generate a list of slots based on current `props`.

```typescript
export const GridComponent = {
  name: 'Grid Layout',
  category: 'layout',
  component: GridLayout,
  props: { 
    columns: { type: Number, label: 'Columns', default: 2 } 
  },
  // Dynamically calculate slots
  computeSlots: (props) => {
    const count = Math.max(1, Number(props.columns) || 2)
    return Array.from({ length: count }, (_, i) => ({
      name: `col-${i}`,
      label: `Column ${i + 1}`,
    }))
  }
}
```

When `computeSlots` exists, it overrides any static `slots` definition. The designer will update the slot placeholders on the canvas in real-time based on the return value of this function.

## Events

Defines the actions a component can trigger, used for low-code interactions:

```typescript
events: {
  click: [{ name: 'event', type: Event }]
}
```

## Custom Property Setting Components

When the standard property structure is complex and cannot be met by the default editor, you can customize the property setting component using the `dialog` property.

```typescript
import FieldRulesEditor from './FieldRulesEditor.vue'

export const MyComponent = {
  name: 'Custom Component',
  component: MyComponentView,
  props: { 
    rules: { 
      type: Object,  
      label: 'Field Validation Rules',
      dialog: FieldRulesEditor 
    }
  }
}
```

A custom property setting component will receive the following Props:

- `modelValue`: The current property value.

You can implement property updates via the `onUpdate:modelValue` event in the panel.

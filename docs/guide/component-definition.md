# 组件定义规范

在低代码平台中，每个组件都需要通过一个标准对象进行定义，以便设计器能够识别其属性、事件和插槽。

## 定义结构

```typescript
export interface ComponentConfig {
  /**
   * 组件名称
   */
  name: string;
  /**
   * 组件图标 (支持 Iconify)
   */
  icon: string;
  /**
   * 组件类别 (如布局组件、功能组件等)，默认为 'widget'
   */
  category?: 'layout' | 'widget'
  /**
   * 实际渲染的 Vue 组件
   */
  component: any;
  /**
   * 组件属性定义
   */
  props: Record<string, PropDefinition>;
  /**
   * 组件事件定义
   */
  events?: Record<string, EventDefinition>;
  /**
   * 组件插槽定义
   */
  slots?: SlotDefinition[]; 
  /**
   * 自定义插槽计算函数
   */
  computeSlots?: (props: Record<string, any>) => SlotDefinition[];
  /**
   * 作为子项时的显示名称，支持字符串或函数
   */
  slotName?: string | ((props: Record<string, any>) => string); // 作为子项时的显示名称
}
```

## 属性定义 (Props)

属性定义决定了在设计器侧边栏显示的编辑器类型：

```typescript
props: {
  size: { 
    type: String, 
    label: '尺寸', 
    options: ['default', 'small', 'large'] 
  },
  disabled: { 
    type: Boolean, 
    label: '禁用' 
  },
  // 对象类型：通常用于配置复杂的子属性
  style: {
    type: Object,
    label: '自定义样式',
    props: {
      color: { type: String, label: '颜色' },
      fontSize: { type: String, label: '字体大小' }
    }
  },
  // 数组类型：通常用于下拉选项、列表数据等，可以定义常规类型，也可以是 Object 类型以支持复杂结构
  options: {
    type: Array,
    label: '选项列表',
    item: {
      type: Object,
      props: {
        label: { type: String, label: '选项标签' },
        value: { type: String, label: '选项值' }
      }
    }
  }
}
```

## 插槽定义 (Slots)

插槽用于定义组件内部可嵌套内容的部分：

```typescript
slots: [
  { 
    name: 'default', 
    label: '默认插槽',
  },
  { 
    name: 'header', 
    label: '页眉' 
  }
]
```

## 动态插槽计算 (computeSlots)

对于插槽数量或名称依赖于属性（Props）的组件（如：栅格布局的列、标签页的标签、表格的行列），可以使用 `computeSlots` 函数根据当前的 `props` 动态生成插槽列表。

```typescript
export const GridComponent = {
  name: '栅格布局',
  category: 'layout',
  component: GridLayout,
  props: { 
    columns: { type: Number, label: '列数', default: 2 } 
  },
  // 动态计算插槽
  computeSlots: (props) => {
    const count = Math.max(1, Number(props.columns) || 2)
    return Array.from({ length: count }, (_, i) => ({
      name: `col-${i}`,
      label: `第 ${i + 1} 列`,
    }))
  }
}
```

当 `computeSlots` 存在时，它将覆盖静态的 `slots` 定义。设计器会根据该函数的返回值实时更新画布上的插槽占位符。

## 事件 (Events)

定义组件可以触发的动作，用于低代码交互：

```typescript
events: {
  click: [{ name: 'event', type: Event }]
}
```

## 自定义属性设置组件

当标准属性结构复杂，无法通过默认编辑器满足需求时，可以通过 `dialog` 属性自定义属性设置组件。

```typescript
import FieldRulesEditor from './FieldRulesEditor.vue'

export const MyComponent = {
  name: '自定义组件',
  component: MyComponentView,
  props: { 
    rules: { 
      type: Object,  
      label: '字段验证规则',
      dialog: FieldRulesEditor 
    }
  }
}
```

自定义属性设置组件将接收以下 Props：

- `modelValue`: 当前属性值。

你可以在面板中通过 `onUpdate:modelValue` 事件来实现属性的更新。

# 脚本与表达式

在设计器中，你可以在组件的 **事件处理函数**、**函数类型属性** 以及 **全局生命周期钩子** 中编写 JavaScript 代码。为了方便操作表单，系统注入了多个内置变量和函数。

同时，设计器支持对 **几乎所有组件属性**（包括布尔值、文本、数字、下拉选项等）进行动态控制。

## 表达式 {#Expressions}

在属性面板中，点击属性右侧或下方的 **函数图标** (ƒ) 即可切换为表达式模式。

### 支持范围 {#supported-scope}

- **布尔值**: 如“隐藏”、“禁用”、“必填”等。
- **基础类型**: 如“标签名”、“占位符”、“默认值”、“最大/最小值”等。
- **集合类型**: 如下拉框的“选项列表”、列定义等（需返回符合格式的对象或数组）。

### 语法 {#Syntax}

表达式应当是一个有效的 JavaScript 片段，最终会返回该属性期望的值。支持使用内置变量，例如：
- `$model.age > 18` (返回布尔)
- `` `欢迎您，${$model.username}` `` (返回字符串)
- `$model.isAdmin ? ['编辑', '删除'] : ['查看']` (返回数组)
- `Number($model.score) >= 60 && $model.passed`

### 配置要求 {#config-requirements}

默认情况下，表达式功能是按需开启的。
- **开启方式**: 在 `<LcDesigner>` 组件上通过 `expressions` 属性进行控制。
  ```vue
  <LcDesigner :expressions="true" ... />
  ```

## 内置变量 {#built-in-variables}

| 变量名 | 说明 |
| :--- | :--- |
| `$model` | 当前表单的数据对象（响应式）。可以直接读取或修改其中的字段（如 `$model.username = 'admin'`）。 |
| `$global` | 全局共享数据对象（响应式）。用于跨组件或跨页面的状态共享。 |
| `$scope` | (仅限插槽内) 当前插槽暴露的数据对象。例如在表格列中，`$scope` 通常包含当前行数据。 |

## 内置函数 {#built-in-functions}

### $getRefs(componentId) {#get-refs}

获取指定组件的 Vue 实例或 DOM 元素。常用于调用组件暴露的原生方法（如 Element Plus 的组件方法）。

- **参数**: `componentId` (string) - 设计器中配置的组件 ID。
- **返回**: 组件实例、DOM 元素或 `undefined`。

### $getProps(componentId) {#get-props}

获取指定组件的当前属性对象（Props）。

- **参数**: `componentId` (string) - 设计器中配置的组件 ID。
- **返回**: 组件的属性对象 (Record<string, any>) 或 `undefined`。

### $setProps(componentId, props) {#set-props}

动态设置指定组件的属性值。这会直接修改 Schema 并在渲染器中实时生效。

- **参数**:
  - `componentId` (string) - 要操作的组件 ID。
  - `props` (Object) - 要更新的属性对象。支持更新公共属性（如 `hidden`, `label`）和组件特有属性。
- **示例**: 
  ```javascript
  // 隐藏 ID 为 'input_123' 的组件
  $setProps('input_123', { hidden: true });

  // 修改按钮的文本和禁用状态
  $setProps('submit_btn', { slotContent: '提交中...', disabled: true });
  ```

---

## 使用场景 {#use-cases}

### 事件处理

在组件的事件面板中编写代码：
```javascript
// 当按钮点击时，清空输入框并隐藏自己
$model.password = '';
$setProps('login_btn', { hidden: true });
```

### 全局生命周期

在设计器的 "全局配置 -> 脚本" 中定义：
- **onMounted**: 表单加载完成时触发。
- **onModelChange**: 当表单数据发生变化时触发。

### 函数属性

某些组件属性（如校验函数 `validator`）可以设置为函数字符串：
```javascript
// $model 等变量会在函数执行时自动注入
if ($model.age < 18) return '未成年人禁止注册';
return true;
```

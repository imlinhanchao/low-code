# 布局组件

布局组件是低代码表单的骨架，用于组织和排列其他业务组件。所有的布局组件都定义在 `src/layouts` 中，并作为 `layoutComponents` 导出。

## 栅格布局 (Grid)

基于 CSS Grid 的响应式布局。

- **图标**: `mdi:view-column-outline`
- **属性**:
  - `columns` (`Object`): 响应式列数配置，包含 `sm`, `md`, `lg`。默认为 `{ sm: 1, md: 2, lg: 3 }`。
  - `count` (`Number`): 插槽数量，默认为 6。
  - `gap` (`Number`): 网格间距（单位：px），默认为 8。
- **插槽**: 动态生成 `col-0`, `col-1` ... 等插槽。

---

## 卡片 (Card)

将内容包裹在带标题的容器中。

- **图标**: `mdi:card-outline`
- **属性**:
  - `header` (`String`): 卡片标题。
- **插槽**:
  - `header`: 标题栏内容。
  - `default`: 卡片主体内容。

---

## 标签页 (Tabs)

通过选项卡切换显示不同的内容区域。

- **图标**: `mdi:tab`
- **属性**:
  - `tabLabels` (`String`): 以逗号分隔的标签名称列表（如 `标签1,标签2`）。
- **插槽**: 动态生成 `tab-0`, `tab-1` ... 等插槽。

---

## 表格布局 (Table)

精确的行列对齐布局。

- **图标**: `mdi:table`
- **属性**:
  - `rows` (`Number`): 行数。
  - `cols` (`Number`): 列数。
- **插槽**: 动态生成 `cell-r-c` 格式的插槽（如 `cell-0-0` 代表第一行第一列）。

---

## 明细表 (Detail Table)

用于处理一对多关系的列表或表格编辑。

- **图标**: `mdi:table-edit`
- **属性**:
  - `mode` (`String`): 显示模式，可选 `list` (列表) 或 `table` (表格)。
  - `headers` (`Array`): 当模式为 `table` 时，定义的列标题列表。
  - `showIndex` (`Boolean`): 是否显示序号。
- **插槽**:
  - 当为 `table` 模式时，根据 `headers` 动态生成 `col-i` 插槽。
  - 当为 `list` 模式时，使用 `default` 插槽。

> [!NOTE]
> 插槽内表单组件的数据模型的源需设置为 `$slot.row`，以访问当前行数据。
---

## 文本与 HTML

用于在表单中插入静态内容。

### 内联文本 (Inline Text)
- **用途**: 简单的内联 HTML 文本展示。
- **属性**: `html` (支持多行/HTML)。

### 块级盒子 (Block Box)
- **用途**: 作为块级容器或大段 HTML 注入。
- **属性**: `html` (支持多行/HTML)。

# 库导出 API 参考

## 组件

### LcDesigner (设计器)

主要的表单设计器组件。

#### Props

| 属性 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `v-model` | `FormSchema` | `{ widgets: [] }` | 设计生成的表单 Schema 数据 |
| `components` | `ComponentGroup[]` | `[]` | 注册到设计器的组件列表 |
| `locale` | `string` | (浏览器语言) | 初始化语言，如 `zh-CN`, `en-US` |

#### 内置通用属性 (Common Props)

所有组件在设计器中都内置了以下通用属性（位于属性面板顶部）：

| 属性名 | 类型 | 说明 |
| :--- | :--- | :--- |
| `ID` | `string` | 组件实例的唯一标识符（即字段名） |
| `CSS类名` | `string` | 绑定到组件根元素的 `class` |
| `隐藏` | `boolean` | 是否在渲染时隐藏（不占位） |
| `只读` | `boolean` | 为 true 时，非布局且具备 models 的组件将渲染为 `<span>` 纯文本，会取 modelValue 或第一个 model 的值 |

#### 方法 (Expose)

| 方法名 | 参数 | 说明 |
| :--- | :--- | :--- |
| `setLocale` | `(lang: string) => void` | 切换当前设计器语言 |
| `addLocale` | `(lang: string, messages: any) => void` | 添加自定义语言包 |
| `getLocale` | `() => string` | 获取当前生效的语言 |

---

### LcRenderer (渲染器)

用于将设计出的 Schema 渲染为实际表单。

#### Props

| 属性 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `schema` | `FormSchema` | (必传) | 设计器生成的 Schema 数据 |
| `components` | `ComponentGroup[]` | `[]` | 渲染所需的组件列表（需与设计器一致） |
| `v-model` | `Record<string, any>` | `{}` | 表单绑定的实际数据对象 |
| `global` | `Record<string, any>` | `{}` | 全局共享数据，可在脚本中通过 `$global` 访问 |

---

## 方法

### addIconifyAPIProvider

向设计器注册 Iconify 图标提供者，支持在组件定义中使用 Iconify 图标。

| 参数 | 类型 | 说明 |
| :--- | :--- | :--- |
| `provider` | `(name: string) => Promise<string>` | 图标提供者函数，接收图标名称，返回 Promise 解析为 SVG 字符串 |
| `customConfig` | `Partial<IconifyAPIConfig>` | (可选) 自定义配置项，支持 `prefix`（图标名称前缀）等 |

具体参考 [Iconify API Provider 文档](https://iconify.design/docs/icon-components/svg-framework/add-api-provider.html)。
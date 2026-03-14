import { ElInput, ElButton, ElSelect, ElOption, ElTooltip } from 'element-plus'
import type { ComponentConfig } from './src/types'

const components: ComponentConfig[] = [
  {
    name: '文本框',
    component: ElInput,
    props: {
      placeholder: { type: String, label: '占位文本' },
      showWordLimit: { type: Boolean, label: '显示字数限制', default: false },
    },
    models: {
      modelValue: '',
    },
    events: {
      change: [{ name: 'value', type: String }],
    },
    // ElInput exposes functional named slots; default slot is not a text content area
    slots: [
      { name: 'prefix',  label: '前缀 (prefix)' },
      { name: 'suffix',  label: '后缀 (suffix)' },
      { name: 'prepend', label: '前置 (prepend)' },
      { name: 'append',  label: '后置 (append)' },
    ],
  },
  {
    name: '按钮',
    component: ElButton,
    props: {
      type: { type: String, label: '按钮类型', options: ['primary', 'success', 'warning', 'danger', 'info', 'text'] },
      size: { type: String, label: '按钮尺寸', options: ['default', 'small', 'large'] },
    },
    events: {
      click: [],
    },
    slots: [
      { name: 'default', label: '按钮文字' },
    ],
  },
  {
    name: '下拉选择',
    component: ElSelect,
    props: {
      placeholder: { type: String, label: '占位文本' },
      filterMethod: { type: Function, label: '过滤方法', params: [{ name: 'query', type: String }] },
    },
    models: {
      modelValue: '',
    },
    events: {
      change: [{ name: 'value', type: String }],
    },
    slots: [
      {
        name: 'default',
        label: '选项列表',
        virtual: true,
        components: [
          {
            name: '选项',
            component: ElOption,
            props: {
              label: { type: String, label: '选项标签' },
              value: { type: String, label: '选项值' },
            },
            slots: [],
          },
        ],
      },
    ],
  },
  {
    name: '工具提示',
    component: ElTooltip,
    props: {
      content: { type: String, label: '提示内容' },
      placement: { type: String, label: '提示位置', options: ['top', 'bottom', 'left', 'right'] },
    },
    slots: [
      { name: 'default', label: '触发元素' },
      { name: 'content', label: '提示内容 (content)' },
    ],
  },
]

export default components
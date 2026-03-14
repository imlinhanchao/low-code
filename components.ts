import { ElInput, ElButton, ElSelect, ElOption, ElTooltip } from 'element-plus'
import type { ComponentConfig } from './src/types'

const components: ComponentConfig[] = [
  {
    name: '文本框',
    component: ElInput,
    props: {
      placeholder: '请输入内容',
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
      type: 'primary',
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
      placeholder: '请选择',
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
        components: [
          {
            name: '选项',
            component: ElOption,
            props: {
              label: '选项',
              value: '',
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
      content: '提示内容',
      placement: 'top',
    },
    slots: [
      { name: 'default', label: '触发元素' },
      { name: 'content', label: '提示内容 (content)' },
    ],
  },
]

export default components
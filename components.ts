import { ElInput, ElButton, ElSelect, ElOption, ElTooltip } from 'element-plus'
export default [
  {
    name: '文本框',
    component: ElInput,
    props: {
      placeholder: '',
    },
    models: {
      modelValue: '',
    },
    events: {
      change: [{
        name: 'value',
        type: String,
      }],
    },
    slots: [
      { name: 'default' },
      { name: 'prefix' },
      { name: 'suffix' },
      { name: 'prepend' },
      { name: 'append' },
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
      { name: 'default' },
    ],
  },
  {
    name: '下拉选择',
    component: ElSelect,
    props: {
      placeholder: '',
    },
    models: {
      modelValue: '',
    },
    events: {
      change: [{
        name: 'value',
        type: String,
      }],
    },
    slots: [
      { 
        name: 'default', 
        components: [
          {
            name: '选项',
            component: ElOption,
            props: {
              label: '',
              value: '',
            },
            events: {
              click: [],
            },
            slots: [
              { name: 'default' },
            ],
          }
        ] 
      },
    ],
  },
  {
    name: '工具提示',
    component: ElTooltip,
    props: {
      content: '',
    },
    slots: [
      { name: 'default' },
      { name: 'content' },
    ],
  },
]
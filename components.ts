import { ElInput, ElButton, ElSelect, ElOption, ElTooltip } from 'element-plus'
import type { ComponentConfig } from './src/types'

const components: ComponentConfig[] = [
  // ── ElInput ──────────────────────────────────────────────────────────────────
  {
    name: '文本框',
    group: '表单',
    component: ElInput,
    props: {
      type:          { type: String,  label: '输入框类型',   options: ['text', 'textarea', 'password', 'number', 'email', 'tel', 'url', 'search'] },
      placeholder:   { type: String,  label: '占位文本' },
      size:          { type: String,  label: '尺寸',         options: ['default', 'small', 'large'] },
      maxlength:     { type: Number,  label: '最大字符数' },
      rows:          { type: Number,  label: '行数 (textarea)' },
      disabled:      { type: Boolean, label: '禁用',         default: false },
      readonly:      { type: Boolean, label: '只读',         default: false },
      clearable:     { type: Boolean, label: '可清空',       default: false },
      showPassword:  { type: Boolean, label: '显示密码图标', default: false },
      showWordLimit: { type: Boolean, label: '显示字数限制', default: false },
      autofocus:     { type: Boolean, label: '自动聚焦',     default: false },
    },
    models: {
      modelValue: '',
    },
    events: {
      input:  [{ name: 'value', type: String }],
      change: [{ name: 'value', type: String }],
      focus:  [{ name: 'event', type: Event }],
      blur:   [{ name: 'event', type: Event }],
      clear:  [],
    },
    slots: [
      { name: 'prefix',  label: '前缀 (prefix)' },
      { name: 'suffix',  label: '后缀 (suffix)' },
      { name: 'prepend', label: '前置 (prepend)' },
      { name: 'append',  label: '后置 (append)' },
    ],
  },

  // ── ElButton ─────────────────────────────────────────────────────────────────
  {
    name: '按钮',
    group: '通用',
    component: ElButton,
    props: {
      type:       { type: String,  label: '按钮类型', options: ['', 'default', 'primary', 'success', 'warning', 'danger', 'info', 'text'] },
      size:       { type: String,  label: '按钮尺寸', options: ['default', 'small', 'large'] },
      nativeType: { type: String,  label: '原生 type', options: ['button', 'submit', 'reset'] },
      disabled:   { type: Boolean, label: '禁用',     default: false },
      loading:    { type: Boolean, label: '加载中',   default: false },
      plain:      { type: Boolean, label: '朴素按钮', default: false },
      round:      { type: Boolean, label: '圆角按钮', default: false },
      circle:     { type: Boolean, label: '圆形按钮', default: false },
      link:       { type: Boolean, label: '链接按钮', default: false },
      text:       { type: Boolean, label: '文字按钮', default: false },
      autofocus:  { type: Boolean, label: '自动聚焦', default: false },
    },
    events: {
      click: [{ name: 'event', type: Event }],
    },
    slots: [
      { name: 'default', label: '按钮文字' },
      { name: 'loading', label: '自定义加载图标' },
      { name: 'icon',    label: '自定义图标' },
    ],
  },

  // ── ElSelect ─────────────────────────────────────────────────────────────────
  {
    name: '下拉选择',
    group: '表单',
    component: ElSelect,
    props: {
      placeholder:     { type: String,   label: '占位文本' },
      size:            { type: String,   label: '尺寸',         options: ['default', 'small', 'large'] },
      disabled:        { type: Boolean,  label: '禁用',         default: false },
      clearable:       { type: Boolean,  label: '可清空',       default: false },
      filterable:      { type: Boolean,  label: '可搜索',       default: false },
      multiple:        { type: Boolean,  label: '多选',         default: false },
      allowCreate:     { type: Boolean,  label: '允许新建条目', default: false },
      collapseTags:    { type: Boolean,  label: '折叠标签',     default: false },
      remote:          { type: Boolean,  label: '远程搜索',     default: false },
      loading:         { type: Boolean,  label: '加载中',       default: false },
      loadingText:     { type: String,   label: '加载中文字' },
      noMatchText:     { type: String,   label: '无匹配时文字' },
      noDataText:      { type: String,   label: '无数据时文字' },
      multipleLimit:   { type: Number,   label: '多选上限 (0=不限)' },
      filterMethod:    { type: Function, label: '自定义过滤方法',   params: [{ name: 'query', type: String }] },
      remoteMethod:    { type: Function, label: '远程搜索方法',     params: [{ name: 'query', type: String }] },
    },
    models: {
      modelValue: '',
    },
    events: {
      change:       [{ name: 'value', type: String }],
      visibleChange: [{ name: 'visible', type: Boolean }],
      removeTag:    [{ name: 'value', type: String }],
      focus:        [{ name: 'event', type: Event }],
      blur:         [{ name: 'event', type: Event }],
      clear:        [],
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
              label:    { type: String,  label: '选项标签' },
              value:    { type: String,  label: '选项值' },
              disabled: { type: Boolean, label: '禁用', default: false },
            },
            slots: [],
          },
        ],
      },
      { name: 'prefix', label: '前缀内容 (prefix)' },
      { name: 'header', label: '下拉头部 (header)' },
      { name: 'footer', label: '下拉底部 (footer)' },
      { name: 'empty',  label: '无数据内容 (empty)' },
    ],
  },

  // ── ElTooltip ────────────────────────────────────────────────────────────────
  {
    name: '工具提示',
    group: '通用',
    component: ElTooltip,
    props: {
      content:    { type: String,  label: '提示内容' },
      placement:  { type: String,  label: '提示位置', options: [
        'top', 'top-start', 'top-end',
        'bottom', 'bottom-start', 'bottom-end',
        'left', 'left-start', 'left-end',
        'right', 'right-start', 'right-end',
      ]},
      effect:     { type: String,  label: '主题',       options: ['dark', 'light'] },
      trigger:    { type: String,  label: '触发方式',   options: ['hover', 'click', 'focus', 'contextmenu'] },
      disabled:   { type: Boolean, label: '禁用',       default: false },
      showArrow:  { type: Boolean, label: '显示箭头',   default: true },
      enterable:  { type: Boolean, label: '鼠标可进入', default: true },
      showAfter:  { type: Number,  label: '显示延迟 (ms)' },
      hideAfter:  { type: Number,  label: '隐藏延迟 (ms)' },
    },
    events: {
      show:          [],
      hide:          [],
      'before-show': [],
      'before-hide': [],
    },
    slots: [
      { name: 'default', label: '触发元素' },
      { name: 'content', label: '自定义提示内容 (content)' },
    ],
  },
]

export default components

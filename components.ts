import {
  ElInput,
  ElButton,
  ElSelect,
  ElOption,
  ElTooltip,
  ElAutocomplete,
  ElCascader,
  ElCheckbox,
  ElCheckboxGroup,
  ElColorPicker,
  ElColorPickerPanel,
  ElDatePicker,
  ElForm,
  ElFormItem,
  ElInputNumber,
  ElInputTag,
  ElMention,
  ElRadio,
  ElRadioGroup,
  ElRate,
  ElSlider,
  ElSwitch,
  ElTimePicker,
  ElTimeSelect,
  ElTransfer,
  ElTreeSelect,
  ElUpload,
} from 'element-plus'
import type { ComponentGroup } from './src/types'
import RulesEditor from './src/components/RulesEditor.vue'
import FieldRulesEditor from './src/components/FieldRulesEditor.vue'

const components: ComponentGroup[] = [
  // ── 表单 ─────────────────────────────────────────────────────────────────────
  {
    group: '表单',
    components: [
      // ── ElInput ────────────────────────────────────────────────────────────────
      {
        name: '文本框',
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

      // ── ElAutocomplete ─────────────────────────────────────────────────────────
      {
        name: '自动补全',
        component: ElAutocomplete,
        props: {
          placeholder:        { type: String,   label: '占位文本' },
          size:               { type: String,   label: '尺寸',           options: ['default', 'small', 'large'] },
          disabled:           { type: Boolean,  label: '禁用',           default: false },
          clearable:          { type: Boolean,  label: '可清空',         default: false },
          debounce:           { type: Number,   label: '防抖延迟 (ms)',  default: 300 },
          triggerOnFocus:     { type: Boolean,  label: '聚焦时触发',     default: true },
          fetchSuggestions:   { type: Function, label: '获取建议方法',   params: [{ name: 'queryString', type: String }, { name: 'callback', type: Function }] },
          valueKey:           { type: String,   label: '显示字段名',     default: 'value' },
          hideLoading:        { type: Boolean,  label: '隐藏加载动画',   default: false },
          fitInputWidth:      { type: Boolean,  label: '宽度与输入框一致', default: false },
        },
        models: {
          modelValue: '',
        },
        events: {
          select: [{ name: 'item', type: Object }],
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

      // ── ElInputNumber ──────────────────────────────────────────────────────────
      {
        name: '数字输入框',
        component: ElInputNumber,
        props: {
          min:           { type: Number,  label: '最小值' },
          max:           { type: Number,  label: '最大值' },
          step:          { type: Number,  label: '步长',         default: 1 },
          precision:     { type: Number,  label: '小数精度' },
          size:          { type: String,  label: '尺寸',         options: ['default', 'small', 'large'] },
          disabled:      { type: Boolean, label: '禁用',         default: false },
          controls:      { type: Boolean, label: '显示控制按钮', default: true },
          controlsPosition: { type: String, label: '按钮位置',   options: ['', 'right'] },
          placeholder:   { type: String,  label: '占位文本' },
          readonly:      { type: Boolean, label: '只读',         default: false },
        },
        models: {
          modelValue: 0,
        },
        events: {
          change: [{ name: 'currentValue', type: Number }, { name: 'oldValue', type: Number }],
          focus:  [{ name: 'event', type: Event }],
          blur:   [{ name: 'event', type: Event }],
        },
        slots: [],
      },

      // ── ElInputTag ─────────────────────────────────────────────────────────────
      {
        name: '标签输入框',
        component: ElInputTag,
        props: {
          placeholder:    { type: String,  label: '占位文本' },
          size:           { type: String,  label: '尺寸',         options: ['default', 'small', 'large'] },
          disabled:       { type: Boolean, label: '禁用',         default: false },
          readonly:       { type: Boolean, label: '只读',         default: false },
          clearable:      { type: Boolean, label: '可清空',       default: false },
          max:            { type: Number,  label: '最大标签数' },
          draggable:      { type: Boolean, label: '可拖拽排序',   default: false },
          delimiter:      { type: String,  label: '分隔符' },
        },
        models: {
          modelValue: [],
        },
        events: {
          change:  [{ name: 'value', type: Array }],
          'add-tag':    [{ name: 'value', type: String }],
          'remove-tag': [{ name: 'value', type: String }],
          focus:   [{ name: 'event', type: Event }],
          blur:    [{ name: 'event', type: Event }],
          clear:   [],
        },
        slots: [],
      },

      // ── ElSelect ───────────────────────────────────────────────────────────────
      {
        name: '下拉选择',
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

      // ── ElTreeSelect ───────────────────────────────────────────────────────────
      {
        name: '树形选择',
        component: ElTreeSelect,
        props: {
          placeholder:       { type: String,   label: '占位文本' },
          size:              { type: String,   label: '尺寸',         options: ['default', 'small', 'large'] },
          disabled:          { type: Boolean,  label: '禁用',         default: false },
          clearable:         { type: Boolean,  label: '可清空',       default: false },
          filterable:        { type: Boolean,  label: '可搜索',       default: false },
          multiple:          { type: Boolean,  label: '多选',         default: false },
          collapseTags:      { type: Boolean,  label: '折叠标签',     default: false },
          checkStrictly:     { type: Boolean,  label: '父子不关联',   default: false },
          showCheckbox:      { type: Boolean,  label: '显示复选框',   default: false },
          renderAfterExpand: { type: Boolean,  label: '展开后渲染',   default: true },
          nodeKey:           { type: String,   label: '节点 key 字段', default: 'value' },
          props:             { type: Object,   label: '节点属性配置' },
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
          'node-click': [{ name: 'data', type: Object }, { name: 'node', type: Object }],
        },
        slots: [],
      },

      // ── ElCascader ─────────────────────────────────────────────────────────────
      {
        name: '级联选择器',
        component: ElCascader,
        props: {
          placeholder:    { type: String,  label: '占位文本' },
          size:           { type: String,  label: '尺寸',         options: ['default', 'small', 'large'] },
          disabled:       { type: Boolean, label: '禁用',         default: false },
          clearable:      { type: Boolean, label: '可清空',       default: false },
          filterable:     { type: Boolean, label: '可搜索',       default: false },
          separator:      { type: String,  label: '层级分隔符',   default: ' / ' },
          showAllLevels:  { type: Boolean, label: '显示完整路径', default: true },
          collapseTags:   { type: Boolean, label: '折叠标签',     default: false },
          debounce:       { type: Number,  label: '防抖延迟 (ms)', default: 300 },
          filterMethod:   { type: Function, label: '自定义过滤方法', params: [{ name: 'node', type: Object }, { name: 'keyword', type: String }] },
        },
        models: {
          modelValue: [],
        },
        events: {
          change:       [{ name: 'value', type: Array }],
          'expand-change': [{ name: 'value', type: Array }],
          blur:         [{ name: 'event', type: Event }],
          focus:        [{ name: 'event', type: Event }],
          'visible-change': [{ name: 'visible', type: Boolean }],
          removeTag:    [{ name: 'value', type: Object }],
        },
        slots: [],
      },

      // ── ElCheckbox ─────────────────────────────────────────────────────────────
      {
        name: '复选框',
        component: ElCheckbox,
        props: {
          label:         { type: String,  label: '标签文字' },
          value:         { type: String,  label: '选中时的值' },
          trueValue:     { type: Boolean, label: '选中值',   default: true },
          falseValue:    { type: Boolean, label: '未选中值', default: false },
          size:          { type: String,  label: '尺寸',     options: ['default', 'small', 'large'] },
          disabled:      { type: Boolean, label: '禁用',     default: false },
          border:        { type: Boolean, label: '显示边框', default: false },
          indeterminate: { type: Boolean, label: '不确定状态', default: false },
        },
        models: {
          modelValue: false,
        },
        events: {
          change: [{ name: 'value', type: Boolean }],
        },
        slots: [
          { name: 'default', label: '自定义内容' },
        ],
      },

      // ── ElCheckboxGroup ────────────────────────────────────────────────────────
      {
        name: '复选框组',
        component: ElCheckboxGroup,
        props: {
          size:          { type: String,  label: '尺寸',     options: ['default', 'small', 'large'] },
          disabled:      { type: Boolean, label: '禁用',     default: false },
          min:           { type: Number,  label: '最少选中数' },
          max:           { type: Number,  label: '最多选中数' },
          textColor:     { type: String,  label: '按钮选中文字色' },
          fill:          { type: String,  label: '按钮选中背景色' },
        },
        models: {
          modelValue: [],
        },
        events: {
          change: [{ name: 'value', type: Array }],
        },
        slots: [
          { name: 'default', label: '复选框内容' },
        ],
      },

      // ── ElRadio ────────────────────────────────────────────────────────────────
      {
        name: '单选框',
        component: ElRadio,
        props: {
          label:    { type: String,  label: '标签文字' },
          value:    { type: String,  label: '选项值' },
          size:     { type: String,  label: '尺寸',     options: ['default', 'small', 'large'] },
          disabled: { type: Boolean, label: '禁用',     default: false },
          border:   { type: Boolean, label: '显示边框', default: false },
          name:     { type: String,  label: 'name 属性' },
        },
        models: {
          modelValue: '',
        },
        events: {
          change: [{ name: 'value', type: String }],
        },
        slots: [
          { name: 'default', label: '自定义内容' },
        ],
      },

      // ── ElRadioGroup ───────────────────────────────────────────────────────────
      {
        name: '单选框组',
        component: ElRadioGroup,
        props: {
          size:      { type: String,  label: '尺寸',     options: ['default', 'small', 'large'] },
          disabled:  { type: Boolean, label: '禁用',     default: false },
          textColor: { type: String,  label: '按钮选中文字色' },
          fill:      { type: String,  label: '按钮选中背景色' },
        },
        models: {
          modelValue: '',
        },
        events: {
          change: [{ name: 'value', type: String }],
        },
        slots: [
          { name: 'default', label: '单选框内容' },
        ],
      },

      // ── ElSwitch ───────────────────────────────────────────────────────────────
      {
        name: '开关',
        component: ElSwitch,
        props: {
          activeText:       { type: String,  label: '开启时文字' },
          inactiveText:     { type: String,  label: '关闭时文字' },
          activeValue:      { type: Boolean, label: '开启时的值', default: true },
          inactiveValue:    { type: Boolean, label: '关闭时的值', default: false },
          activeColor:      { type: String,  label: '开启时颜色' },
          inactiveColor:    { type: String,  label: '关闭时颜色' },
          size:             { type: String,  label: '尺寸',       options: ['default', 'small', 'large'] },
          disabled:         { type: Boolean, label: '禁用',       default: false },
          loading:          { type: Boolean, label: '加载中',     default: false },
          inline:           { type: Boolean, label: '内联模式',   default: false },
          width:            { type: Number,  label: '宽度 (px)' },
        },
        models: {
          modelValue: false,
        },
        events: {
          change: [{ name: 'value', type: Boolean }],
        },
        slots: [],
      },

      // ── ElSlider ───────────────────────────────────────────────────────────────
      {
        name: '滑块',
        component: ElSlider,
        props: {
          min:            { type: Number,  label: '最小值',     default: 0 },
          max:            { type: Number,  label: '最大值',     default: 100 },
          step:           { type: Number,  label: '步长',       default: 1 },
          disabled:       { type: Boolean, label: '禁用',       default: false },
          showInput:      { type: Boolean, label: '显示输入框', default: false },
          showStops:      { type: Boolean, label: '显示刻度',   default: false },
          showTooltip:    { type: Boolean, label: '显示提示',   default: true },
          range:          { type: Boolean, label: '范围选择',   default: false },
          vertical:       { type: Boolean, label: '垂直模式',   default: false },
          height:         { type: String,  label: '高度 (垂直模式)' },
          size:           { type: String,  label: '尺寸',       options: ['default', 'small', 'large'] },
          placement:      { type: String,  label: '提示位置',   options: ['top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end', 'left', 'right'] },
          formatTooltip:  { type: Function, label: '格式化提示值', params: [{ name: 'value', type: Number }] },
        },
        models: {
          modelValue: 0,
        },
        events: {
          change: [{ name: 'value', type: Number }],
          input:  [{ name: 'value', type: Number }],
        },
        slots: [],
      },

      // ── ElRate ─────────────────────────────────────────────────────────────────
      {
        name: '评分',
        component: ElRate,
        props: {
          max:            { type: Number,  label: '最大分值',     default: 5 },
          disabled:       { type: Boolean, label: '只读',         default: false },
          allowHalf:      { type: Boolean, label: '允许半星',     default: false },
          lowThreshold:   { type: Number,  label: '低分阈值',     default: 2 },
          highThreshold:  { type: Number,  label: '高分阈值',     default: 4 },
          showText:       { type: Boolean, label: '显示辅助文字', default: false },
          showScore:      { type: Boolean, label: '显示当前分值', default: false },
          textColor:      { type: String,  label: '辅助文字颜色' },
          scoreTemplate:  { type: String,  label: '分值显示模板', default: '{value}' },
          size:           { type: String,  label: '尺寸',         options: ['default', 'small', 'large'] },
          clearable:      { type: Boolean, label: '可清空',       default: false },
        },
        models: {
          modelValue: 0,
        },
        events: {
          change: [{ name: 'value', type: Number }],
        },
        slots: [],
      },

      // ── ElColorPicker ──────────────────────────────────────────────────────────
      {
        name: '颜色选择器',
        component: ElColorPicker,
        props: {
          disabled:       { type: Boolean, label: '禁用',           default: false },
          size:           { type: String,  label: '尺寸',           options: ['default', 'small', 'large'] },
          showAlpha:      { type: Boolean, label: '支持透明度',     default: false },
          colorFormat:    { type: String,  label: '颜色格式',       options: ['hsl', 'hsv', 'hex', 'rgb', 'hex8'] },
          predefine:      { type: Array,  label: '预设颜色列表' },
          validateEvent:  { type: Boolean, label: '触发表单校验',   default: true },
        },
        models: {
          modelValue: '',
        },
        events: {
          change:        [{ name: 'value', type: String }],
          activeChange:  [{ name: 'value', type: String }],
          focus:         [{ name: 'event', type: Event }],
          blur:          [{ name: 'event', type: Event }],
        },
        slots: [],
      },

      // ── ElColorPickerPanel ─────────────────────────────────────────────────────
      {
        name: '颜色面板',
        component: ElColorPickerPanel,
        props: {
          disabled:    { type: Boolean, label: '禁用',       default: false },
          showAlpha:   { type: Boolean, label: '支持透明度', default: false },
          colorFormat: { type: String,  label: '颜色格式',   options: ['hsl', 'hsv', 'hex', 'rgb', 'hex8'] },
          predefine:   { type: Array,  label: '预设颜色列表' },
        },
        models: {
          modelValue: '',
        },
        events: {
          change:       [{ name: 'value', type: String }],
          activeChange: [{ name: 'value', type: String }],
        },
        slots: [],
      },

      // ── ElDatePicker ───────────────────────────────────────────────────────────
      {
        name: '日期选择器',
        component: ElDatePicker,
        props: {
          type:         { type: String,  label: '选择器类型',   options: ['year', 'years', 'month', 'months', 'date', 'dates', 'datetime', 'week', 'daterange', 'monthrange', 'datetimerange', 'yearrange'] },
          placeholder:  { type: String,  label: '占位文本' },
          format:       { type: String,  label: '显示格式',     default: 'YYYY-MM-DD' },
          valueFormat:  { type: String,  label: '绑定值格式',   default: 'YYYY-MM-DD' },
          size:         { type: String,  label: '尺寸',         options: ['default', 'small', 'large'] },
          disabled:     { type: Boolean, label: '禁用',         default: false },
          clearable:    { type: Boolean, label: '可清空',       default: true },
          editable:     { type: Boolean, label: '可输入',       default: true },
          readonly:     { type: Boolean, label: '只读',         default: false },
          rangeSeparator: { type: String, label: '范围分隔符',  default: 'To' },
          startPlaceholder: { type: String, label: '开始占位文本' },
          endPlaceholder:   { type: String, label: '结束占位文本' },
          disabledDate: { type: Function, label: '禁用日期函数', params: [{ name: 'time', type: Date }] },
        },
        models: {
          modelValue: '',
        },
        events: {
          change:        [{ name: 'value', type: String }],
          blur:          [{ name: 'event', type: Event }],
          focus:         [{ name: 'event', type: Event }],
          'visible-change': [{ name: 'visible', type: Boolean }],
          'calendar-change': [{ name: 'dates', type: Array }],
        },
        slots: [],
      },

      // ── ElTimePicker ───────────────────────────────────────────────────────────
      {
        name: '时间选择器',
        component: ElTimePicker,
        props: {
          placeholder:   { type: String,  label: '占位文本' },
          format:        { type: String,  label: '显示格式',   default: 'HH:mm:ss' },
          valueFormat:   { type: String,  label: '绑定值格式', default: 'HH:mm:ss' },
          size:          { type: String,  label: '尺寸',       options: ['default', 'small', 'large'] },
          disabled:      { type: Boolean, label: '禁用',       default: false },
          clearable:     { type: Boolean, label: '可清空',     default: true },
          editable:      { type: Boolean, label: '可输入',     default: true },
          readonly:      { type: Boolean, label: '只读',       default: false },
          arrowControl:  { type: Boolean, label: '箭头选择',   default: false },
          isRange:       { type: Boolean, label: '范围选择',   default: false },
          startPlaceholder: { type: String, label: '开始占位文本' },
          endPlaceholder:   { type: String, label: '结束占位文本' },
          disabledHours:    { type: Function, label: '禁用小时函数' },
          disabledMinutes:  { type: Function, label: '禁用分钟函数', params: [{ name: 'hour', type: Number }] },
          disabledSeconds:  { type: Function, label: '禁用秒函数',   params: [{ name: 'hour', type: Number }, { name: 'minute', type: Number }] },
        },
        models: {
          modelValue: '',
        },
        events: {
          change:          [{ name: 'value', type: String }],
          blur:            [{ name: 'event', type: Event }],
          focus:           [{ name: 'event', type: Event }],
          'visible-change': [{ name: 'visible', type: Boolean }],
        },
        slots: [],
      },

      // ── ElTimeSelect ───────────────────────────────────────────────────────────
      {
        name: '时间选择下拉',
        component: ElTimeSelect,
        props: {
          placeholder:  { type: String,  label: '占位文本' },
          start:        { type: String,  label: '开始时间',   default: '09:00' },
          end:          { type: String,  label: '结束时间',   default: '18:00' },
          step:         { type: String,  label: '间隔时间',   default: '00:30' },
          minTime:      { type: String,  label: '最早可选时间' },
          maxTime:      { type: String,  label: '最晚可选时间' },
          format:       { type: String,  label: '显示格式',   default: 'HH:mm' },
          size:         { type: String,  label: '尺寸',       options: ['default', 'small', 'large'] },
          disabled:     { type: Boolean, label: '禁用',       default: false },
          clearable:    { type: Boolean, label: '可清空',     default: true },
          editable:     { type: Boolean, label: '可输入',     default: true },
          effect:       { type: String,  label: '主题',       options: ['light', 'dark'] },
        },
        models: {
          modelValue: '',
        },
        events: {
          change: [{ name: 'value', type: String }],
          blur:   [{ name: 'event', type: Event }],
          focus:  [{ name: 'event', type: Event }],
        },
        slots: [],
      },

      // ── ElMention ─────────────────────────────────────────────────────────────
      {
        name: '提及',
        component: ElMention,
        props: {
          type:         { type: String,  label: '输入框类型',     options: ['text', 'textarea'] },
          placeholder:  { type: String,  label: '占位文本' },
          prefix:       { type: String,  label: '触发前缀',       default: '@' },
          split:        { type: String,  label: '分隔符',         default: ' ' },
          disabled:     { type: Boolean, label: '禁用',           default: false },
          filterOption: { type: Boolean, label: '过滤选项',       default: true },
          placement:    { type: String,  label: '弹出位置',       options: ['bottom', 'top'] },
          whole:        { type: Boolean, label: '整词删除',       default: false },
          checkIsWhole: { type: Function, label: '自定义整词判断', params: [{ name: 'pattern', type: String }, { name: 'prefix', type: String }] },
        },
        models: {
          modelValue: '',
        },
        events: {
          change:  [{ name: 'value', type: String }],
          search:  [{ name: 'pattern', type: String }, { name: 'prefix', type: String }],
          select:  [{ name: 'option', type: Object }, { name: 'prefix', type: String }],
          focus:   [{ name: 'event', type: Event }],
          blur:    [{ name: 'event', type: Event }],
        },
        slots: [],
      },

      // ── ElTransfer ─────────────────────────────────────────────────────────────
      {
        name: '穿梭框',
        component: ElTransfer,
        props: {
          filterable:      { type: Boolean, label: '可搜索',         default: false },
          filterPlaceholder: { type: String, label: '搜索占位文本' },
          targetOrder:     { type: String,  label: '右侧列表排序',   options: ['original', 'push', 'unshift'] },
          titles:          { type: Array,   label: '左右标题' },
          buttonTexts:     { type: Array,   label: '按钮文字' },
          format:          { type: Object,  label: '顶部勾选状态文字' },
          filterMethod:    { type: Function, label: '自定义搜索方法', params: [{ name: 'query', type: String }, { name: 'item', type: Object }] },
          renderContent:   { type: Function, label: '自定义渲染函数',  params: [{ name: 'h', type: Function }, { name: 'option', type: Object }] },
        },
        models: {
          modelValue: [],
        },
        events: {
          change:          [{ name: 'value', type: Array }, { name: 'direction', type: String }, { name: 'movedKeys', type: Array }],
          'left-check-change':  [{ name: 'value', type: Array }, { name: 'movedKeys', type: Array }],
          'right-check-change': [{ name: 'value', type: Array }, { name: 'movedKeys', type: Array }],
        },
        slots: [
          { name: 'left-footer',  label: '左侧底部内容 (left-footer)' },
          { name: 'right-footer', label: '右侧底部内容 (right-footer)' },
        ],
      },

      // ── ElUpload ───────────────────────────────────────────────────────────────
      {
        name: '上传',
        component: ElUpload,
        props: {
          action:       { type: String,  label: '上传地址 (action)' },
          method:       { type: String,  label: '请求方法',         options: ['post', 'put', 'patch'], default: 'post' },
          multiple:     { type: Boolean, label: '多文件上传',       default: false },
          accept:       { type: String,  label: '接受的文件类型' },
          listType:     { type: String,  label: '文件列表样式',     options: ['text', 'picture', 'picture-card'], default: 'text' },
          showFileList: { type: Boolean, label: '显示文件列表',     default: true },
          drag:         { type: Boolean, label: '拖拽上传',         default: false },
          disabled:     { type: Boolean, label: '禁用',             default: false },
          limit:        { type: Number,  label: '最大上传数量' },
          autoUpload:   { type: Boolean, label: '自动上传',         default: true },
          withCredentials: { type: Boolean, label: '携带 cookie',  default: false },
          beforeUpload: { type: Function, label: '上传前钩子',       params: [{ name: 'file', type: Object }] },
          beforeRemove: { type: Function, label: '移除前钩子',       params: [{ name: 'file', type: Object }, { name: 'fileList', type: Array }] },
          onExceed:     { type: Function, label: '超出限制时钩子',   params: [{ name: 'files', type: Array }, { name: 'fileList', type: Array }] },
        },
        events: {
          change:  [{ name: 'file', type: Object }, { name: 'fileList', type: Array }],
          success: [{ name: 'response', type: Object }, { name: 'file', type: Object }, { name: 'fileList', type: Array }],
          error:   [{ name: 'err', type: Object }, { name: 'file', type: Object }, { name: 'fileList', type: Array }],
          remove:  [{ name: 'file', type: Object }, { name: 'fileList', type: Array }],
          preview: [{ name: 'file', type: Object }],
          exceed:  [{ name: 'files', type: Array }, { name: 'fileList', type: Array }],
          progress: [{ name: 'event', type: Object }, { name: 'file', type: Object }, { name: 'fileList', type: Array }],
        },
        slots: [
          { name: 'default', label: '触发上传区域' },
          { name: 'trigger', label: '触发按钮 (trigger)' },
          { name: 'tip',     label: '提示说明 (tip)' },
          { name: 'file',    label: '文件项 (file)' },
        ],
      },
    ],
  },

  // ── 通用 ─────────────────────────────────────────────────────────────────────
  {
    group: '通用',
    components: [
      // ── ElButton ───────────────────────────────────────────────────────────────
      {
        name: '按钮',
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

      // ── ElTooltip ──────────────────────────────────────────────────────────────
      {
        name: '工具提示',
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
    ],
  },

  // ── 表单容器 ──────────────────────────────────────────────────────────────────
  {
    group: '表单容器',
    components: [

      // ── ElForm ─────────────────────────────────────────────────────────────────
      {
        name: '表单',
        component: ElForm,
        category: 'layout',
        props: {
          model:          { type: String,  label: '表单数据 (model)', default: '$model' },
          rules:          { type: Object,  label: '验证规则',          dialog: RulesEditor },
          labelPosition:  { type: String,  label: '标签位置',     options: ['left', 'right', 'top'], default: 'right' },
          labelWidth:     { type: String,  label: '标签宽度',     default: '100px' },
          labelSuffix:    { type: String,  label: '标签后缀' },
          size:           { type: String,  label: '尺寸',         options: ['default', 'small', 'large'] },
          disabled:       { type: Boolean, label: '禁用所有控件', default: false },
          inline:         { type: Boolean, label: '行内模式',     default: false },
          showMessage:    { type: Boolean, label: '显示验证信息', default: true },
          inlineMessage:  { type: Boolean, label: '行内显示验证信息', default: false },
          scrollToError:  { type: Boolean, label: '验证失败时滚动', default: false },
          requireAsteriskPosition: { type: String, label: '必填星号位置', options: ['left', 'right'] },
        },
        slots: [
          { name: 'default', label: '表单内容' },
        ],
      },

      // ── ElFormItem ─────────────────────────────────────────────────────────────
      {
        name: '表单项',
        component: ElFormItem,
        category: 'layout',
        props: {
          label:         { type: String,  label: '标签文本' },
          labelWidth:    { type: String,  label: '标签宽度' },
          prop:          { type: String,  label: '字段名 (prop)' },
          required:      { type: Boolean, label: '是否必填',  },
          showMessage:   { type: Boolean, label: '显示验证信息', default: true },
          inlineMessage: { type: Boolean, label: '行内显示验证信息', default: false },
          size:          { type: String,  label: '尺寸',         options: ['default', 'small', 'large'] },
          rules:         { type: Object,  label: '字段验证规则',      dialog: FieldRulesEditor },
        },
        slots: [
          { name: 'default', label: '控件内容' },
          { name: 'label',   label: '自定义标签 (label)',       noPlaceholder: true },
          { name: 'error',   label: '自定义验证错误 (error)',    noPlaceholder: true },
        ],
      },

    ],
  },
]

export default components


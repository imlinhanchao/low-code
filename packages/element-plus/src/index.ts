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
  ElDatePicker,
  ElForm,
  ElFormItem,
  ElInputNumber,
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
  ElAlert,
  ElSteps,
  ElStep,
} from 'element-plus'
import type { ComponentGroup } from 'lc-vue3'
import RulesEditor from './components/RulesEditor.vue'
import FieldRulesEditor from './components/FieldRulesEditor.vue'
import "./style.css"

const components: ComponentGroup[] = [
  // ── 通用 ─────────────────────────────────────────────────────────────────────
  {
    group: { 'zh-CN': '通用', 'en-US': 'Common' },
    components: [
      // ── ElButton ───────────────────────────────────────────────────────────────
      {
        name: 'ElButton',
        label: { 'zh-CN': '按钮', 'en-US': 'Button' },
        icon: 'mdi:button-cursor',
        component: ElButton,
        props: {
          type: { type: String, label: { 'zh-CN': '按钮类型', 'en-US': 'Button Type' }, options: ['', 'default', 'primary', 'success', 'warning', 'danger', 'info', 'text'] },
          size: { type: String, label: { 'zh-CN': '按钮尺寸', 'en-US': 'Button Size' }, options: ['default', 'small', 'large'] },
          nativeType: { type: String, label: { 'zh-CN': '原生 type', 'en-US': 'Native Type' }, options: ['button', 'submit', 'reset'] },
          disabled: { type: Boolean, label: { 'zh-CN': '禁用', 'en-US': 'Disabled' }, default: false },
          loading: { type: Boolean, label: { 'zh-CN': '加载中', 'en-US': 'Loading' }, default: false },
          plain: { type: Boolean, label: { 'zh-CN': '朴素按钮', 'en-US': 'Plain' }, default: false },
          round: { type: Boolean, label: { 'zh-CN': '圆角按钮', 'en-US': 'Round' }, default: false },
          circle: { type: Boolean, label: { 'zh-CN': '圆形按钮', 'en-US': 'Circle' }, default: false },
          link: { type: Boolean, label: { 'zh-CN': '链接按钮', 'en-US': 'Link' }, default: false },
          text: { type: Boolean, label: { 'zh-CN': '文字按钮', 'en-US': 'Text Button' }, default: false },
          autofocus: { type: Boolean, label: { 'zh-CN': '自动聚焦', 'en-US': 'Autofocus' }, default: false },
        },
        events: {
          click: [{ name: 'event', type: Event }],
        },
        slots: [
          { name: 'default', label: { 'zh-CN': '按钮文字', 'en-US': 'Button Text' } },
          { name: 'loading', label: { 'zh-CN': '自定义加载图标', 'en-US': 'Loading Icon' } },
          { name: 'icon', label: { 'zh-CN': '自定义图标', 'en-US': 'Icon' } },
        ],
      },

      // ── ElTooltip ──────────────────────────────────────────────────────────────
      {
        name: 'ElTooltip',
        label: { 'zh-CN': '工具提示', 'en-US': 'Tooltip' },
        icon: 'mdi:tooltip-outline',
        component: ElTooltip,
        props: {
          content: { type: String, label: { 'zh-CN': '提示内容', 'en-US': 'Content' } },
          placement: {
            type: String, label: { 'zh-CN': '提示位置', 'en-US': 'Placement' }, options: [
              'top', 'top-start', 'top-end',
              'bottom', 'bottom-start', 'bottom-end',
              'left', 'left-start', 'left-end',
              'right', 'right-start', 'right-end',
            ]
          },
          effect: { type: String, label: { 'zh-CN': '主题', 'en-US': 'Effect' }, options: ['dark', 'light'] },
          trigger: { type: String, label: { 'zh-CN': '触发方式', 'en-US': 'Trigger' }, options: ['hover', 'click', 'focus', 'contextmenu'] },
          disabled: { type: Boolean, label: { 'zh-CN': '禁用', 'en-US': 'Disabled' }, default: false },
          showArrow: { type: Boolean, label: { 'zh-CN': '显示箭头', 'en-US': 'Show Arrow' }, default: true },
          enterable: { type: Boolean, label: { 'zh-CN': '鼠标可进入', 'en-US': 'Enterable' }, default: true },
          showAfter: { type: Number, label: { 'zh-CN': '显示延迟 (ms)', 'en-US': 'Show After (ms)' } },
          hideAfter: { type: Number, label: { 'zh-CN': '隐藏延迟 (ms)', 'en-US': 'Hide After (ms)' } },
        },
        events: {
          show: [],
          hide: [],
          'before-show': [],
          'before-hide': [],
        },
        slots: [
          { name: 'default', label: { 'zh-CN': '触发元素', 'en-US': 'Trigger Element' } },
          { name: 'content', label: { 'zh-CN': '自定义提示内容 (content)', 'en-US': 'Custom Content' } },
        ],
      },

      // ── ElAlert ────────────────────────────────────────────────────────────────
      {
        name: 'ElAlert',
        label: { 'zh-CN': '提示', 'en-US': 'Alert' },
        icon: 'mdi:alert-circle-outline',
        component: ElAlert,
        props: {
          title: { type: String, label: { 'zh-CN': '标题', 'en-US': 'Title' } },
          type: { type: String, label: { 'zh-CN': '类型', 'en-US': 'Type' }, options: ['success', 'warning', 'info', 'error'], default: 'info' },
          description: { type: String, label: { 'zh-CN': '描述文字', 'en-US': 'Description' } },
          closable: { type: Boolean, label: { 'zh-CN': '可关闭', 'en-US': 'Closable' }, default: true },
          center: { type: Boolean, label: { 'zh-CN': '文字居中', 'en-US': 'Center' }, default: false },
          closeText: { type: String, label: { 'zh-CN': '关闭按钮文字', 'en-US': 'Close Text' } },
          showIcon: { type: Boolean, label: { 'zh-CN': '显示图标', 'en-US': 'Show Icon' }, default: false },
          effect: { type: String, label: { 'zh-CN': '主题', 'en-US': 'Effect' }, options: ['light', 'dark'], default: 'light' },
        },
        events: {
          close: [],
        },
        slots: [
          { name: 'default', label: { 'zh-CN': '描述内容', 'en-US': 'Description' } },
          { name: 'title', label: { 'zh-CN': '自定义标题 (title)', 'en-US': 'Custom Title' }, noPlaceholder: true },
        ],
      },
    ],
  },

  // ── 展示 ──────────────────────────────────────────────────────────────────────
  {
    group: { 'zh-CN': '展示', 'en-US': 'Display' },
    components: [

      // ── ElSteps ────────────────────────────────────────────────────────────────
      {
        name: 'ElSteps',
        label: { 'zh-CN': '步骤条', 'en-US': 'Steps' },
        icon: 'mdi:dots-horizontal-circle-outline',
        component: ElSteps,
        props: {
          active: { type: Number, label: { 'zh-CN': '当前激活步骤', 'en-US': 'Active Step' }, default: 0 },
          direction: { type: String, label: { 'zh-CN': '方向', 'en-US': 'Direction' }, options: ['horizontal', 'vertical'], default: 'horizontal' },
          space: { type: Number, label: { 'zh-CN': '步骤间距 (px)', 'en-US': 'Space (px)' } },
          alignCenter: { type: Boolean, label: { 'zh-CN': '居中对齐', 'en-US': 'Align Center' }, default: false },
          simple: { type: Boolean, label: { 'zh-CN': '简洁风格', 'en-US': 'Simple' }, default: false },
          finishStatus: { type: String, label: { 'zh-CN': '完成步骤状态', 'en-US': 'Finish Status' }, options: ['wait', 'process', 'finish', 'error', 'success'], default: 'finish' },
          processStatus: { type: String, label: { 'zh-CN': '进行中步骤状态', 'en-US': 'Process Status' }, options: ['wait', 'process', 'finish', 'error', 'success'], default: 'process' },
        },
        slots: [
          {
            name: 'default',
            label: { 'zh-CN': '步骤列表', 'en-US': 'Steps List' },
            virtual: true,
            components: [
              {
                name: 'ElStep',
                label: { 'zh-CN': '步骤', 'en-US': 'Step' },
                component: ElStep,
                props: {
                  title: { type: String, label: { 'zh-CN': '标题', 'en-US': 'Title' } },
                  description: { type: String, label: { 'zh-CN': '描述文字', 'en-US': 'Description' } },
                  icon: { type: String, label: { 'zh-CN': '图标 (类名)', 'en-US': 'Icon (Class)' } },
                  status: { type: String, label: { 'zh-CN': '当前状态', 'en-US': 'Status' }, options: ['wait', 'process', 'finish', 'error', 'success'] },
                },
                slotName: (step: any) => (step.title as string) || '步骤',
                slots: [],
              },
            ],
          },
        ],
      },

    ],
  },

  // ── 表单容器 ──────────────────────────────────────────────────────────────────
  {
    group: { 'zh-CN': '表单容器', 'en-US': 'Form Container' },
    components: [

      // ── ElForm ─────────────────────────────────────────────────────────────────
      {
        name: 'ElForm',
        label: { 'zh-CN': '表单', 'en-US': 'Form' },
        icon: 'mdi:form-select',
        component: ElForm,
        category: 'layout',
        props: {
          model: { type: String, label: { 'zh-CN': '表单数据 (model)', 'en-US': 'Form Data (model)' }, default: '$model' },
          rules: { type: Object, label: { 'zh-CN': '验证规则', 'en-US': 'Validation Rules' }, dialog: RulesEditor },
          labelPosition: { type: String, label: { 'zh-CN': '标签位置', 'en-US': 'Label Position' }, options: ['left', 'right', 'top'], default: 'right' },
          labelWidth: { type: String, label: { 'zh-CN': '标签宽度', 'en-US': 'Label Width' }, default: '100px' },
          labelSuffix: { type: String, label: { 'zh-CN': '标签后缀', 'en-US': 'Label Suffix' } },
          size: { type: String, label: { 'zh-CN': '尺寸', 'en-US': 'Size' }, options: ['default', 'small', 'large'] },
          disabled: { type: Boolean, label: { 'zh-CN': '禁用所有控件', 'en-US': 'Disable All Controls' }, default: false },
          inline: { type: Boolean, label: { 'zh-CN': '行内模式', 'en-US': 'Inline Mode' }, default: false },
          showMessage: { type: Boolean, label: { 'zh-CN': '显示验证信息', 'en-US': 'Show Validation Message' }, default: true },
          inlineMessage: { type: Boolean, label: { 'zh-CN': '行内显示验证信息', 'en-US': 'Inline Validation Message' }, default: false },
          scrollToError: { type: Boolean, label: { 'zh-CN': '验证失败时滚动', 'en-US': 'Scroll to Error' }, default: false },
          requireAsteriskPosition: { type: String, label: { 'zh-CN': '必填星号位置', 'en-US': 'Required Asterisk Position' }, options: ['left', 'right'] },
        },
        slots: [
          { name: 'default', label: { 'zh-CN': '表单内容', 'en-US': 'Form Content' } },
        ],
      },

      // ── ElFormItem ─────────────────────────────────────────────────────────────
      {
        name: 'ElFormItem',
        label: { 'zh-CN': '表单项', 'en-US': 'Form Item' },
        icon: 'mdi:form-textbox-password',
        component: ElFormItem,
        category: 'layout',
        props: {
          label: { type: String, label: { 'zh-CN': '标签文本', 'en-US': 'Label Text' } },
          labelWidth: { type: String, label: { 'zh-CN': '标签宽度', 'en-US': 'Label Width' } },
          prop: { type: String, label: { 'zh-CN': '字段名 (prop)', 'en-US': 'Field Name (prop)' } },
          required: { type: Boolean, label: { 'zh-CN': '是否必填', 'en-US': 'Required' }, },
          showMessage: { type: Boolean, label: { 'zh-CN': '显示验证信息', 'en-US': 'Show Validation Message' }, default: true },
          inlineMessage: { type: Boolean, label: { 'zh-CN': '行内显示验证信息', 'en-US': 'Inline Validation Message' }, default: false },
          size: { type: String, label: { 'zh-CN': '尺寸', 'en-US': 'Size' }, options: ['default', 'small', 'large'] },
          rules: { type: Object, label: { 'zh-CN': '字段验证规则', 'en-US': 'Field Validation Rules' }, dialog: FieldRulesEditor },
        },
        slots: [
          { name: 'default', label: { 'zh-CN': '控件内容', 'en-US': 'Widget Content' } },
          { name: 'label', label: { 'zh-CN': '自定义标签 (label)', 'en-US': 'Custom Label' }, noPlaceholder: true },
          { name: 'error', label: { 'zh-CN': '自定义验证错误 (error)', 'en-US': 'Custom Error' }, noPlaceholder: true },
        ],
      },

    ],
  },

  // ── 表单 ─────────────────────────────────────────────────────────────────────
  {
    group: { 'zh-CN': '表单', 'en-US': 'Form' },
    components: [
      // ── ElInput ────────────────────────────────────────────────────────────────
      {
        name: 'ElInput',
        label: { 'zh-CN': '文本框', 'en-US': 'Input' },
        icon: 'mdi:form-textbox',
        component: ElInput,
        props: {
          type: { type: String, label: { 'zh-CN': '输入框类型', 'en-US': 'Input Type' }, options: ['text', 'textarea', 'password', 'number', 'email', 'tel', 'url', 'search'] },
          placeholder: { type: String, label: { 'zh-CN': '占位文本', 'en-US': 'Placeholder' } },
          size: { type: String, label: { 'zh-CN': '尺寸', 'en-US': 'Size' }, options: ['default', 'small', 'large'] },
          maxlength: { type: Number, label: { 'zh-CN': '最大字符数', 'en-US': 'Max Length' } },
          minlength: { type: Number, label: { 'zh-CN': '最小字符数', 'en-US': 'Min Length' } },
          rows: { type: Number, label: { 'zh-CN': '行数', 'en-US': 'Rows' } },
          disabled: { type: Boolean, label: { 'zh-CN': '禁用', 'en-US': 'Disabled' }, default: false },
          readonly: { type: Boolean, label: { 'zh-CN': '只读', 'en-US': 'Readonly' }, default: false },
          clearable: { type: Boolean, label: { 'zh-CN': '可清空', 'en-US': 'Clearable' }, default: false },
          showPassword: { type: Boolean, label: { 'zh-CN': '显示密码图标', 'en-US': 'Show Password Icon' }, default: false },
          showWordLimit: { type: Boolean, label: { 'zh-CN': '显示字数限制', 'en-US': 'Show Word Limit' }, default: false },
          autofocus: { type: Boolean, label: { 'zh-CN': '自动聚焦', 'en-US': 'Autofocus' }, default: false },
          formatter: { type: Function, label: { 'zh-CN': '输入格式化方法', 'en-US': 'Formatter' }, params: [{ name: 'value', type: String }] },
          parser: { type: Function, label: { 'zh-CN': '输入解析方法', 'en-US': 'Parser' }, params: [{ name: 'value', type: String }] },
          autocomplete: { type: String, label: { 'zh-CN': '原生自动完成', 'en-US': 'Autocomplete' }, options: ['off', 'on', 'name', 'email', 'username', 'new-password', 'current-password'] },
          name: { type: String, label: { 'zh-CN': 'name 属性', 'en-US': 'Name' } },
          max: { type: String, label: { 'zh-CN': '最大值', 'en-US': 'Max' } },
          min: { type: String, label: { 'zh-CN': '最小值', 'en-US': 'Min' } },
          step: { type: String, label: { 'zh-CN': '步长', 'en-US': 'Step' } },
          resize: { type: String, label: { 'zh-CN': '调整大小', 'en-US': 'Resize' }, options: ['none', 'both', 'horizontal', 'vertical'] },
          inputStyle: { type: Object, label: { 'zh-CN': '输入框样式', 'en-US': 'Input Style' } },
          validateEvent: { type: Boolean, label: { 'zh-CN': '触发表单校验', 'en-US': 'Validate Event' }, default: true },
        },
        models: {
          modelValue: '',
        },
        events: {
          input: [{ name: 'value', type: String }],
          change: [{ name: 'value', type: String }],
          focus: [{ name: 'event', type: Event }],
          blur: [{ name: 'event', type: Event }],
          clear: [],
        },
        slots: [
          { name: 'prefix', label: { 'zh-CN': '前缀 (prefix)', 'en-US': 'Prefix' } },
          { name: 'suffix', label: { 'zh-CN': '后缀 (suffix)', 'en-US': 'Suffix' } },
          { name: 'prepend', label: { 'zh-CN': '前置 (prepend)', 'en-US': 'Prepend' } },
          { name: 'append', label: { 'zh-CN': '后置 (append)', 'en-US': 'Append' } },
        ],
      },

      // ── ElAutocomplete ─────────────────────────────────────────────────────────
      {
        name: 'ElAutocomplete',
        label: { 'zh-CN': '自动补全', 'en-US': 'Autocomplete' },
        icon: 'mdi:text-search',
        component: ElAutocomplete,
        props: {
          placeholder: { type: String, label: { 'zh-CN': '占位文本', 'en-US': 'Placeholder' } },
          size: { type: String, label: { 'zh-CN': '尺寸', 'en-US': 'Size' }, options: ['default', 'small', 'large'] },
          disabled: { type: Boolean, label: { 'zh-CN': '禁用', 'en-US': 'Disabled' }, default: false },
          clearable: { type: Boolean, label: { 'zh-CN': '可清空', 'en-US': 'Clearable' }, default: false },
          debounce: { type: Number, label: { 'zh-CN': '防抖延迟 (ms)', 'en-US': 'Debounce' }, default: 300 },
          placement: { type: String, label: { 'zh-CN': '建议列表位置', 'en-US': 'Placement' }, options: ['top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end'] },
          triggerOnFocus: { type: Boolean, label: { 'zh-CN': '聚焦时触发', 'en-US': 'Trigger on Focus' }, default: true },
          fetchSuggestions: { type: Function, label: { 'zh-CN': '获取建议方法', 'en-US': 'Fetch Suggestions' }, params: [{ name: 'queryString', type: String }, { name: 'callback', type: Function }] },
          valueKey: { type: String, label: { 'zh-CN': '显示字段名', 'en-US': 'Value Key' }, default: 'value' },
          hideLoading: { type: Boolean, label: { 'zh-CN': '隐藏加载动画', 'en-US': 'Hide Loading' }, default: false },
          fitInputWidth: { type: Boolean, label: { 'zh-CN': '宽度与输入框一致', 'en-US': 'Fit Input Width' }, default: false },
          selectWhenUnmatched: { type: Boolean, label: { 'zh-CN': '输入不匹配时选中', 'en-US': 'Select When Unmatched' }, default: false },
          popperClass: { type: String, label: { 'zh-CN': '建议列表类名', 'en-US': 'Popper Class' } },
          teleported: { type: Boolean, label: { 'zh-CN': '建议列表是否使用 teleport', 'en-US': 'Teleported' }, default: true },
          appendTo: { type: String, label: { 'zh-CN': '建议列表挂载元素', 'en-US': 'Append To' } },
          highlightFirstItem: { type: Boolean, label: { 'zh-CN': '高亮第一个建议', 'en-US': 'Highlight First Item' }, default: false },
          loopNavigation: { type: Boolean, label: { 'zh-CN': '建议列表宽度与输入框一致', 'en-US': 'Loop Navigation' }, default: true },
        },
        models: {
          modelValue: '',
        },
        events: {
          select: [{ name: 'item', type: Object }],
          change: [{ name: 'value', type: String }],
          focus: [{ name: 'event', type: Event }],
          blur: [{ name: 'event', type: Event }],
          clear: [],
        },
        slots: [
          { name: 'prefix', label: { 'zh-CN': '前缀 (prefix)', 'en-US': 'Prefix' } },
          { name: 'suffix', label: { 'zh-CN': '后缀 (suffix)', 'en-US': 'Suffix' } },
          { name: 'prepend', label: { 'zh-CN': '前置 (prepend)', 'en-US': 'Prepend' } },
          { name: 'append', label: { 'zh-CN': '后置 (append)', 'en-US': 'Append' } },
        ],
      },

      // ── ElInputNumber ──────────────────────────────────────────────────────────
      {
        name: 'ElInputNumber',
        label: { 'zh-CN': '数字输入框', 'en-US': 'Input Number' },
        icon: 'mdi:numeric',
        component: ElInputNumber,
        props: {
          min: { type: Number, label: { 'zh-CN': '最小值', 'en-US': 'Min' } },
          max: { type: Number, label: { 'zh-CN': '最大值', 'en-US': 'Max' } },
          step: { type: Number, label: { 'zh-CN': '步长', 'en-US': 'Step' }, default: 1 },
          stepStrictly: { type: Boolean, label: { 'zh-CN': '严格步长', 'en-US': 'Step Strictly' }, default: false },
          precision: { type: Number, label: { 'zh-CN': '小数精度', 'en-US': 'Precision' } },
          size: { type: String, label: { 'zh-CN': '尺寸', 'en-US': 'Size' }, options: ['default', 'small', 'large'] },
          readonly: { type: Boolean, label: { 'zh-CN': '只读', 'en-US': 'Readonly' }, default: false },
          disabled: { type: Boolean, label: { 'zh-CN': '禁用', 'en-US': 'Disabled' }, default: false },
          controls: { type: Boolean, label: { 'zh-CN': '显示控制按钮', 'en-US': 'Controls' }, default: true },
          controlsPosition: { type: String, label: { 'zh-CN': '按钮位置', 'en-US': 'Controls Position' }, options: ['', 'right'] },
          placeholder: { type: String, label: { 'zh-CN': '占位文本', 'en-US': 'Placeholder' } },
          valueOnClear: { type: Number, label: { 'zh-CN': '清空时的值', 'en-US': 'Value on Clear' } },
          validateEvent: { type: Boolean, label: { 'zh-CN': '触发表单校验', 'en-US': 'Validate Event' }, default: true },
          align: { type: String, label: { 'zh-CN': '输入框内容对齐', 'en-US': 'Align' }, options: ['left', 'center', 'right'] },
          disabledScientific: { type: Boolean, label: { 'zh-CN': '禁用科学计数法', 'en-US': 'Disable Scientific' }, default: false },
        },
        models: {
          modelValue: 0,
        },
        events: {
          change: [{ name: 'currentValue', type: Number }, { name: 'oldValue', type: Number }],
          focus: [{ name: 'event', type: Event }],
          blur: [{ name: 'event', type: Event }],
        },
        slots: [],
      },

      // ── ElCascader ─────────────────────────────────────────────────────────────
      {
        name: 'ElCascader',
        label: { 'zh-CN': '级联选择器', 'en-US': 'Cascader' },
        icon: 'mdi:layers-outline',
        component: ElCascader,
        props: {
          placeholder: { type: String, label: { 'zh-CN': '占位文本', 'en-US': 'Placeholder' } },
          size: { type: String, label: { 'zh-CN': '尺寸', 'en-US': 'Size' }, options: ['default', 'small', 'large'] },
          disabled: { type: Boolean, label: { 'zh-CN': '禁用', 'en-US': 'Disabled' }, default: false },
          clearable: { type: Boolean, label: { 'zh-CN': '可清空', 'en-US': 'Clearable' }, default: false },
          filterable: { type: Boolean, label: { 'zh-CN': '可搜索', 'en-US': 'Filterable' }, default: false },
          separator: { type: String, label: { 'zh-CN': '层级分隔符', 'en-US': 'Separator' }, default: '/' },
          showAllLevels: { type: Boolean, label: { 'zh-CN': '显示完整路径', 'en-US': 'Show All Levels' }, default: true },
          collapseTags: { type: Boolean, label: { 'zh-CN': '折叠标签', 'en-US': 'Collapse Tags' }, default: false },
          collapseTagsTooltip: { type: Boolean, label: { 'zh-CN': '折叠标签显示 tooltip', 'en-US': 'Collapse Tags Tooltip' }, },
          maxCollapseTags: { type: Number, label: { 'zh-CN': '最大显示标签数', 'en-US': 'Max Collapse Tags' } },
          maxCollapseTagsTooltipHeight: { type: Number, label: { 'zh-CN': '折叠标签工具提示最大高度 (px)', 'en-US': 'Max Collapse Tags Tooltip Height' } },
          debounce: { type: Number, label: { 'zh-CN': '防抖延迟 (ms)', 'en-US': 'Debounce' }, default: 300 },
          filterMethod: { type: Function, label: { 'zh-CN': '自定义过滤方法', 'en-US': 'Filter Method' }, params: [{ name: 'node', type: Object }, { name: 'keyword', type: String }] },
          options: { type: Array, label: { 'zh-CN': '选项数据', 'en-US': 'Options' } },
          props: { type: Object, label: { 'zh-CN': '配置选项', 'en-US': 'Props' } },
          beforeFilter: { type: Function, label: { 'zh-CN': '过滤前的钩子方法', 'en-US': 'Before Filter' }, params: [{ name: 'value', type: String }] },
          popperClass: { type: String, label: { 'zh-CN': '下拉列表类名', 'en-US': 'Popper Class' } },
          teleported: { type: Boolean, label: { 'zh-CN': '是否将弹出框插入到 body 元素', 'en-US': 'Teleported' }, default: true },
          tagType: { type: String, label: { 'zh-CN': '标签类型', 'en-US': 'Tag Type' }, options: ['default', 'primary', 'success', 'warning', 'danger'] },
          tagEffect: { type: String, label: { 'zh-CN': '标签效果', 'en-US': 'Tag Effect' }, options: ['dark', 'light', 'plain', 'border'] },
          effect: { type: String, label: { 'zh-CN': '输入框效果', 'en-US': 'Effect' }, options: ['dark', 'light', 'plain', 'border'] },
          validateEvent: { type: Boolean, label: { 'zh-CN': '触发表单校验', 'en-US': 'Validate Event' }, default: true },
        },
        models: {
          modelValue: [],
        },
        events: {
          change: [{ name: 'value', type: Array }],
          'expand-change': [{ name: 'value', type: Array }],
          blur: [{ name: 'event', type: Event }],
          focus: [{ name: 'event', type: Event }],
          'visible-change': [{ name: 'visible', type: Boolean }],
          removeTag: [{ name: 'value', type: Object }],
        },
        slots: [],
      },

      // ── ElSelect ───────────────────────────────────────────────────────────────
      {
        name: 'ElSelect',
        label: { 'zh-CN': '下拉选择', 'en-US': 'Select' },
        icon: 'mdi:form-dropdown',
        component: ElSelect,
        props: {
          placeholder: { type: String, label: { 'zh-CN': '占位文本', 'en-US': 'Placeholder' } },
          size: { type: String, label: { 'zh-CN': '尺寸', 'en-US': 'Size' }, options: ['default', 'small', 'large'] },
          disabled: { type: Boolean, label: { 'zh-CN': '禁用', 'en-US': 'Disabled' }, default: false },
          clearable: { type: Boolean, label: { 'zh-CN': '可清空', 'en-US': 'Clearable' }, default: false },
          filterable: { type: Boolean, label: { 'zh-CN': '可搜索', 'en-US': 'Filterable' }, default: false },
          multiple: { type: Boolean, label: { 'zh-CN': '多选', 'en-US': 'Multiple' }, default: false },
          allowCreate: { type: Boolean, label: { 'zh-CN': '允许新建条目', 'en-US': 'Allow Create' }, default: false },
          collapseTags: { type: Boolean, label: { 'zh-CN': '折叠标签', 'en-US': 'Collapse Tags' }, default: false },
          collapseTagsTooltip: { type: Boolean, label: { 'zh-CN': '折叠标签显示 tooltip', 'en-US': 'Collapse Tags Tooltip' }, default: false },
          tagTooltip: { type: Object, label: { 'zh-CN': '折叠标签工具提示配置', 'en-US': 'Tag Tooltip Config' } },
          loading: { type: Boolean, label: { 'zh-CN': '加载中', 'en-US': 'Loading' }, default: false },
          loadingText: { type: String, label: { 'zh-CN': '加载中文字', 'en-US': 'Loading Text' } },
          noMatchText: { type: String, label: { 'zh-CN': '无匹配时文字', 'en-US': 'No Match Text' } },
          noDataText: { type: String, label: { 'zh-CN': '无数据时文字', 'en-US': 'No Data Text' } },
          multipleLimit: { type: Number, label: { 'zh-CN': '多选上限', 'en-US': 'Multiple Limit' } },
          effect: { type: String, label: { 'zh-CN': 'tooltip 主题', 'en-US': 'Tooltip Theme' }, options: ['dark', 'light'] },
          options: {
            type: Array, label: { 'zh-CN': '选项列表', 'en-US': 'Options' }, item: {
              type: Object,
              label: '选项',
              props: { value: { type: String, label: { 'zh-CN': '选项值', 'en-US': 'Value' } }, label: { type: String, label: { 'zh-CN': '选项标签', 'en-US': 'Label' } } }
            }
          },
          props: { type: Object, label: { 'zh-CN': '选项属性配置', 'en-US': 'Props Config' } },
          valueKey: { type: String, label: { 'zh-CN': '显示字段名', 'en-US': 'Value Key' }, default: 'value' },
          filterMethod: { type: Function, label: { 'zh-CN': '自定义过滤方法', 'en-US': 'Filter Method' }, params: [{ name: 'query', type: String }] },
          remote: { type: Boolean, label: { 'zh-CN': '远程搜索', 'en-US': 'Remote' }, default: false },
          remoteMethod: { type: Function, label: { 'zh-CN': '远程搜索方法', 'en-US': 'Remote Method' }, params: [{ name: 'query', type: String }] },
          remoteShowSuffix: { type: Boolean, label: { 'zh-CN': '远程搜索时显示后缀图标', 'en-US': 'Remote Show Suffix' }, default: false },
          popperClass: { type: String, label: { 'zh-CN': '下拉列表类名', 'en-US': 'Popper Class' } },
          reserveKeyword: { type: Boolean, label: { 'zh-CN': '保留搜索关键词', 'en-US': 'Reserve Keyword' }, default: false },
          defaultFirstOption: { type: Boolean, label: { 'zh-CN': '默认高亮第一项', 'en-US': 'Default First Option' }, default: false },
          teleported: { type: Boolean, label: { 'zh-CN': '是否将弹出框插入到 body 元素', 'en-US': 'Teleported' }, default: true },
          appendTo: { type: String, label: { 'zh-CN': '下拉列表挂载元素', 'en-US': 'Append To' } },
          automaticDropdown: { type: Boolean, label: { 'zh-CN': '自动弹出选项菜单', 'en-US': 'Automatic Dropdown' } },
          fitInputWidth: { type: Boolean, label: { 'zh-CN': '下拉列表宽度与输入框一致', 'en-US': 'Fit Input Width' }, default: false },
          tagType: { type: String, label: { 'zh-CN': '标签类型', 'en-US': 'Tag Type' }, options: ['default', 'primary', 'success', 'warning', 'danger'] },
          tagEffect: { type: String, label: { 'zh-CN': '标签效果', 'en-US': 'Tag Effect' }, options: ['dark', 'light'] },
          validateEvent: { type: Boolean, label: { 'zh-CN': '触发表单校验', 'en-US': 'Validate Event' }, default: true },
        },
        models: {
          modelValue: '',
        },
        events: {
          change: [{ name: 'value', type: String }],
          visibleChange: [{ name: 'visible', type: Boolean }],
          removeTag: [{ name: 'value', type: String }],
          focus: [{ name: 'event', type: Event }],
          blur: [{ name: 'event', type: Event }],
          clear: [],
        },
        slots: [
          {
            name: 'default',
            label: { 'zh-CN': '选项列表', 'en-US': 'Options List' },
            virtual: true,
            components: [
              {
                name: 'option',
                label: { 'zh-CN': '选项', 'en-US': 'Option' },
                component: ElOption,
                props: {
                  label: { type: String, label: { 'zh-CN': '选项标签', 'en-US': 'Label' } },
                  value: { type: String, label: { 'zh-CN': '选项值', 'en-US': 'Value' } },
                  disabled: { type: Boolean, label: { 'zh-CN': '禁用', 'en-US': 'Disabled' }, default: false },
                },
                slotName: (option: any) => option.label || option.value || '选项', // 使用选项值作为插槽名称
                slots: [],
              },
            ],
          },
          { name: 'prefix', label: { 'zh-CN': '前缀内容 (prefix)', 'en-US': 'Prefix' } },
          { name: 'header', label: { 'zh-CN': '下拉头部 (header)', 'en-US': 'Header' } },
          { name: 'footer', label: { 'zh-CN': '下拉底部 (footer)', 'en-US': 'Footer' } },
          { name: 'empty', label: { 'zh-CN': '无数据内容 (empty)', 'en-US': 'Empty Content' } },
        ],
      },

      // ── ElCheckbox ─────────────────────────────────────────────────────────────
      {
        name: 'ElCheckbox',
        label: { 'zh-CN': '复选框', 'en-US': 'Checkbox' },
        icon: 'mdi:checkbox-outline',
        component: ElCheckbox,
        props: {
          label: { type: String, label: { 'zh-CN': '标签文字', 'en-US': 'Label' } },
          value: { type: String, label: { 'zh-CN': '选中时的值', 'en-US': 'Value' } },
          trueValue: { type: Boolean, label: { 'zh-CN': '选中值', 'en-US': 'True Value' }, default: true },
          falseValue: { type: Boolean, label: { 'zh-CN': '未选中值', 'en-US': 'False Value' }, default: false },
          size: { type: String, label: { 'zh-CN': '尺寸', 'en-US': 'Size' }, options: ['default', 'small', 'large'] },
          disabled: { type: Boolean, label: { 'zh-CN': '禁用', 'en-US': 'Disabled' }, default: false },
          border: { type: Boolean, label: { 'zh-CN': '显示边框', 'en-US': 'Border' }, default: false },
          indeterminate: { type: Boolean, label: { 'zh-CN': '不确定状态', 'en-US': 'Indeterminate' }, default: false },
          validateEvent: { type: Boolean, label: { 'zh-CN': '触发表单校验', 'en-US': 'Validate Event' }, default: true },
        },
        models: {
          modelValue: false,
        },
        events: {
          change: [{ name: 'value', type: Boolean }],
        },
        slots: [
          { name: 'default', label: { 'zh-CN': '自定义内容', 'en-US': 'Custom Content' } },
        ],
      },

      // ── ElCheckboxGroup ────────────────────────────────────────────────────────
      {
        name: 'ElCheckboxGroup',
        label: { 'zh-CN': '复选框组', 'en-US': 'Checkbox Group' },
        icon: 'mdi:checkbox-multiple-outline',
        component: ElCheckboxGroup,
        props: {
          size: { type: String, label: { 'zh-CN': '尺寸', 'en-US': 'Size' }, options: ['default', 'small', 'large'] },
          disabled: { type: Boolean, label: { 'zh-CN': '禁用', 'en-US': 'Disabled' }, default: false },
          min: { type: Number, label: { 'zh-CN': '最少选中数', 'en-US': 'Min' } },
          max: { type: Number, label: { 'zh-CN': '最多选中数', 'en-US': 'Max' } },
          textColor: { type: String, label: { 'zh-CN': '按钮选中文字色', 'en-US': 'Text Color' } },
          fill: { type: String, label: { 'zh-CN': '按钮选中背景色', 'en-US': 'Fill' } },
          tag: { type: String, label: { 'zh-CN': '复选框组元素标签', 'en-US': 'Tag' } },
          validateEvent: { type: Boolean, label: { 'zh-CN': '触发表单校验', 'en-US': 'Validate Event' }, default: true },
        },
        models: {
          modelValue: [],
        },
        events: {
          change: [{ name: 'value', type: Array }],
        },
        slots: [
          { name: 'default', label: { 'zh-CN': '复选框内容', 'en-US': 'Checkbox Content' } },
        ],
      },

      // ── ElRadio ────────────────────────────────────────────────────────────────
      {
        name: 'ElRadio',
        label: { 'zh-CN': '单选框', 'en-US': 'Radio' },
        icon: 'mdi:radiobox-marked',
        component: ElRadio,
        props: {
          label: { type: String, label: { 'zh-CN': '标签文字', 'en-US': 'Label' } },
          value: { type: String, label: { 'zh-CN': '选项值', 'en-US': 'Value' } },
          size: { type: String, label: { 'zh-CN': '尺寸', 'en-US': 'Size' }, options: ['default', 'small', 'large'] },
          disabled: { type: Boolean, label: { 'zh-CN': '禁用', 'en-US': 'Disabled' }, default: false },
          border: { type: Boolean, label: { 'zh-CN': '显示边框', 'en-US': 'Border' }, default: false },
          name: { type: String, label: { 'zh-CN': 'name 属性', 'en-US': 'Name' } },
        },
        models: {
          modelValue: '',
        },
        events: {
          change: [{ name: 'value', type: String }],
        },
        slots: [
          { name: 'default', label: { 'zh-CN': '自定义内容', 'en-US': 'Custom Content' } },
        ],
      },

      // ── ElRadioGroup ───────────────────────────────────────────────────────────
      {
        name: 'ElRadioGroup',
        label: { 'zh-CN': '单选框组', 'en-US': 'Radio Group' },
        icon: 'mdi:radiobox-blank',
        component: ElRadioGroup,
        props: {
          size: { type: String, label: { 'zh-CN': '尺寸', 'en-US': 'Size' }, options: ['default', 'small', 'large'] },
          disabled: { type: Boolean, label: { 'zh-CN': '禁用', 'en-US': 'Disabled' }, default: false },
          textColor: { type: String, label: { 'zh-CN': '按钮选中文字色', 'en-US': 'Text Color' } },
          fill: { type: String, label: { 'zh-CN': '按钮选中背景色', 'en-US': 'Fill' } },
          type: { type: String, label: { 'zh-CN': '单选框类型', 'en-US': 'Type' }, options: ['radio', 'button'] },
        },
        models: {
          modelValue: '',
        },
        events: {
          change: [{ name: 'value', type: String }],
        },
        slots: [
          { name: 'default', label: { 'zh-CN': '单选框内容', 'en-US': 'Radio Content' } },
        ],
      },

      // ── ElSwitch ───────────────────────────────────────────────────────────────
      {
        name: 'ElSwitch',
        label: { 'zh-CN': '开关', 'en-US': 'Switch' },
        icon: 'mdi:toggle-switch-outline',
        component: ElSwitch,
        props: {
          activeText: { type: String, label: { 'zh-CN': '开启时文字', 'en-US': 'Active Text' } },
          inactiveText: { type: String, label: { 'zh-CN': '关闭时文字', 'en-US': 'Inactive Text' } },
          activeValue: { type: Boolean, label: { 'zh-CN': '开启时的值', 'en-US': 'Active Value' }, default: true },
          inactiveValue: { type: Boolean, label: { 'zh-CN': '关闭时的值', 'en-US': 'Inactive Value' }, default: false },
          size: { type: String, label: { 'zh-CN': '尺寸', 'en-US': 'Size' }, options: ['default', 'small', 'large'] },
          disabled: { type: Boolean, label: { 'zh-CN': '禁用', 'en-US': 'Disabled' }, default: false },
          loading: { type: Boolean, label: { 'zh-CN': '加载中', 'en-US': 'Loading' }, default: false },
          inline: { type: Boolean, label: { 'zh-CN': '内联模式', 'en-US': 'Inline' }, default: false },
          width: { type: Number, label: { 'zh-CN': '宽度 (px)', 'en-US': 'Width' } },
          inlinePrompt: { type: Boolean, label: { 'zh-CN': '内联提示', 'en-US': 'Inline Prompt' }, default: false },
          validateEvent: { type: Boolean, label: { 'zh-CN': '触发表单校验', 'en-US': 'Validate Event' }, default: true },
          beforeChange: { type: Function, label: { 'zh-CN': '切换前的钩子方法', 'en-US': 'Before Change' }, params: [{ name: 'value', type: Boolean }] },

        },
        models: {
          modelValue: false,
        },
        events: {
          change: [{ name: 'value', type: Boolean }],
        },
        slots: [
          { name: 'active', label: { 'zh-CN': '开启状态内容', 'en-US': 'Active Content' } },
          { name: 'inactive', label: { 'zh-CN': '关闭状态内容', 'en-US': 'Inactive Content' } },
        ],
      },

      // ── ElSlider ───────────────────────────────────────────────────────────────
      {
        name: 'ElSlider',
        label: { 'zh-CN': '滑块', 'en-US': 'Slider' },
        icon: 'mdi:tune-vertical',
        component: ElSlider,
        props: {
          min: { type: Number, label: { 'zh-CN': '最小值', 'en-US': 'Min' }, default: 0 },
          max: { type: Number, label: { 'zh-CN': '最大值', 'en-US': 'Max' }, default: 100 },
          step: { type: Number, label: { 'zh-CN': '步长', 'en-US': 'Step' }, default: 1 },
          disabled: { type: Boolean, label: { 'zh-CN': '禁用', 'en-US': 'Disabled' }, default: false },
          showInput: { type: Boolean, label: { 'zh-CN': '显示输入框', 'en-US': 'Show Input' }, default: false },
          showInputControls: { type: Boolean, label: { 'zh-CN': '显示输入框控制按钮', 'en-US': 'Show Input Controls' }, default: true },
          inputSize: { type: String, label: { 'zh-CN': '输入框尺寸', 'en-US': 'Input Size' }, options: ['default', 'small', 'large'] },
          showStops: { type: Boolean, label: { 'zh-CN': '显示刻度', 'en-US': 'Show Stops' }, default: false },
          showTooltip: { type: Boolean, label: { 'zh-CN': '显示提示', 'en-US': 'Show Tooltip' }, default: true },
          range: { type: Boolean, label: { 'zh-CN': '范围选择', 'en-US': 'Range' }, default: false },
          vertical: { type: Boolean, label: { 'zh-CN': '垂直模式', 'en-US': 'Vertical' }, default: false },
          height: { type: String, label: { 'zh-CN': '高度 (垂直模式)', 'en-US': 'Height' } },
          size: { type: String, label: { 'zh-CN': '尺寸', 'en-US': 'Size' }, options: ['default', 'small', 'large'] },
          placement: { type: String, label: { 'zh-CN': '提示位置', 'en-US': 'Placement' }, options: ['top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end', 'left', 'right'] },
          formatTooltip: { type: Function, label: { 'zh-CN': '格式化提示值', 'en-US': 'Format Tooltip' }, params: [{ name: 'value', type: Number }] },
          validateEvent: { type: Boolean, label: { 'zh-CN': '触发表单校验', 'en-US': 'Validate Event' }, default: true },
        },
        models: {
          modelValue: 0,
        },
        events: {
          change: [{ name: 'value', type: Number }],
          input: [{ name: 'value', type: Number }],
        },
        slots: [],
      },

      // ── ElRate ─────────────────────────────────────────────────────────────────
      {
        name: 'ElRate',
        label: { 'zh-CN': '评分', 'en-US': 'Rate' },
        icon: 'mdi:star-outline',
        component: ElRate,
        props: {
          max: { type: Number, label: { 'zh-CN': '最大分值', 'en-US': 'Max' }, default: 5 },
          disabled: { type: Boolean, label: { 'zh-CN': '只读', 'en-US': 'Readonly' }, default: false },
          allowHalf: { type: Boolean, label: { 'zh-CN': '允许半星', 'en-US': 'Allow Half' }, default: false },
          lowThreshold: { type: Number, label: { 'zh-CN': '低分阈值', 'en-US': 'Low Threshold' }, default: 2 },
          highThreshold: { type: Number, label: { 'zh-CN': '高分阈值', 'en-US': 'High Threshold' }, default: 4 },
          showText: { type: Boolean, label: { 'zh-CN': '显示辅助文字', 'en-US': 'Show Text' }, default: false },
          showScore: { type: Boolean, label: { 'zh-CN': '显示当前分值', 'en-US': 'Show Score' }, default: false },
          textColor: { type: String, label: { 'zh-CN': '辅助文字颜色', 'en-US': 'Text Color' } },
          scoreTemplate: { type: String, label: { 'zh-CN': '分值显示模板', 'en-US': 'Score Template' }, default: '{value}' },
          size: { type: String, label: { 'zh-CN': '尺寸', 'en-US': 'Size' }, options: ['default', 'small', 'large'] },
          clearable: { type: Boolean, label: { 'zh-CN': '可清空', 'en-US': 'Clearable' }, default: false },
          voidColor: { type: String, label: { 'zh-CN': '未选中图标颜色', 'en-US': 'Void Color' } },
          disabledVoidColor: { type: String, label: { 'zh-CN': '禁用时未选中图标颜色', 'en-US': 'Disabled Void Color' } },
          fillColor: { type: String, label: { 'zh-CN': '选中图标颜色', 'en-US': 'Fill Color' } },
          disabledFillColor: { type: String, label: { 'zh-CN': '禁用时选中图标颜色', 'en-US': 'Disabled Fill Color' } },
          validateEvent: { type: Boolean, label: { 'zh-CN': '触发表单校验', 'en-US': 'Validate Event' }, default: true },
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
        name: 'ElColorPicker',
        label: { 'zh-CN': '颜色选择器', 'en-US': 'Color Picker' },
        icon: 'mdi:palette-outline',
        component: ElColorPicker,
        props: {
          disabled: { type: Boolean, label: { 'zh-CN': '禁用', 'en-US': 'Disabled' }, default: false },
          size: { type: String, label: { 'zh-CN': '尺寸', 'en-US': 'Size' }, options: ['default', 'small', 'large'] },
          showAlpha: { type: Boolean, label: { 'zh-CN': '支持透明度', 'en-US': 'Show Alpha' }, default: false },
          colorFormat: { type: String, label: { 'zh-CN': '颜色格式', 'en-US': 'Color Format' }, options: ['hsl', 'hsv', 'hex', 'rgb', 'hex8'] },
          predefine: { type: Array, label: { 'zh-CN': '预设颜色列表', 'en-US': 'Predefine Colors' }, item: { type: String, label: '颜色' } },
          validateEvent: { type: Boolean, label: { 'zh-CN': '触发表单校验', 'en-US': 'Validate Event' }, default: true },
        },
        models: {
          modelValue: '',
        },
        events: {
          change: [{ name: 'value', type: String }],
          activeChange: [{ name: 'value', type: String }],
          focus: [{ name: 'event', type: Event }],
          blur: [{ name: 'event', type: Event }],
        },
        slots: [],
      },

      // ── ElDatePicker ───────────────────────────────────────────────────────────
      {
        name: 'ElDatePicker',
        label: { 'zh-CN': '日期选择器', 'en-US': 'Date Picker' },
        icon: 'mdi:calendar-outline',
        component: ElDatePicker,
        props: {
          type: { type: String, label: { 'zh-CN': '选择器类型', 'en-US': 'Type' }, options: ['year', 'years', 'month', 'months', 'date', 'dates', 'datetime', 'week', 'daterange', 'monthrange', 'datetimerange', 'yearrange'] },
          placeholder: { type: String, label: { 'zh-CN': '占位文本', 'en-US': 'Placeholder' } },
          format: { type: String, label: { 'zh-CN': '显示格式', 'en-US': 'Format' }, default: 'YYYY-MM-DD' },
          valueFormat: { type: String, label: { 'zh-CN': '绑定值格式', 'en-US': 'Value Format' }, default: 'YYYY-MM-DD' },
          size: { type: String, label: { 'zh-CN': '尺寸', 'en-US': 'Size' }, options: ['default', 'small', 'large'] },
          disabled: { type: Boolean, label: { 'zh-CN': '禁用', 'en-US': 'Disabled' }, default: false },
          clearable: { type: Boolean, label: { 'zh-CN': '可清空', 'en-US': 'Clearable' }, default: true },
          editable: { type: Boolean, label: { 'zh-CN': '可输入', 'en-US': 'Editable' }, default: true },
          readonly: { type: Boolean, label: { 'zh-CN': '只读', 'en-US': 'Readonly' }, default: false },
          rangeSeparator: { type: String, label: { 'zh-CN': '范围分隔符', 'en-US': 'Range Separator' }, default: 'To' },
          startPlaceholder: { type: String, label: { 'zh-CN': '开始占位文本', 'en-US': 'Start Placeholder' } },
          endPlaceholder: { type: String, label: { 'zh-CN': '结束占位文本', 'en-US': 'End Placeholder' } },
          disabledDate: { type: Function, label: { 'zh-CN': '禁用日期函数', 'en-US': 'Disabled Date' }, params: [{ name: 'time', type: Date }] },
          defaultValue: { type: Date, label: { 'zh-CN': '默认显示日期', 'en-US': 'Default Value' } },
          defaultTime: { type: Array, label: { 'zh-CN': '默认显示时间', 'en-US': 'Default Time' }, item: { type: Date } },
          unlinkPanels: { type: Boolean, label: { 'zh-CN': '分离面板', 'en-US': 'Unlink Panels' } },
        },
        models: {
          modelValue: '',
        },
        events: {
          change: [{ name: 'value', type: String }],
          blur: [{ name: 'event', type: Event }],
          focus: [{ name: 'event', type: Event }],
          'visible-change': [{ name: 'visible', type: Boolean }],
          'calendar-change': [{ name: 'dates', type: Array }],
        },
        slots: [],
      },

      // ── ElTimePicker ───────────────────────────────────────────────────────────
      {
        name: 'ElTimePicker',
        label: { 'zh-CN': '时间选择器', 'en-US': 'Time Picker' },
        icon: 'mdi:clock-outline',
        component: ElTimePicker,
        props: {
          placeholder: { type: String, label: { 'zh-CN': '占位文本', 'en-US': 'Placeholder' } },
          format: { type: String, label: { 'zh-CN': '显示格式', 'en-US': 'Format' }, default: 'HH:mm:ss' },
          valueFormat: { type: String, label: { 'zh-CN': '绑定值格式', 'en-US': 'Value Format' }, default: 'HH:mm:ss' },
          size: { type: String, label: { 'zh-CN': '尺寸', 'en-US': 'Size' }, options: ['default', 'small', 'large'] },
          disabled: { type: Boolean, label: { 'zh-CN': '禁用', 'en-US': 'Disabled' }, default: false },
          clearable: { type: Boolean, label: { 'zh-CN': '可清空', 'en-US': 'Clearable' }, default: true },
          editable: { type: Boolean, label: { 'zh-CN': '可输入', 'en-US': 'Editable' }, default: true },
          readonly: { type: Boolean, label: { 'zh-CN': '只读', 'en-US': 'Readonly' }, default: false },
          arrowControl: { type: Boolean, label: { 'zh-CN': '箭头选择', 'en-US': 'Arrow Control' }, default: false },
          isRange: { type: Boolean, label: { 'zh-CN': '范围选择', 'en-US': 'Range' }, default: false },
          rangeSeparator: { type: String, label: { 'zh-CN': '范围分隔符', 'en-US': 'Range Separator' }, default: '-' },
          startPlaceholder: { type: String, label: { 'zh-CN': '开始占位文本', 'en-US': 'Start Placeholder' } },
          endPlaceholder: { type: String, label: { 'zh-CN': '结束占位文本', 'en-US': 'End Placeholder' } },
          defaultValue: { type: Date, label: { 'zh-CN': '默认显示时间', 'en-US': 'Default Value' } },
          defaultTime: { type: Array, label: { 'zh-CN': '默认显示时间', 'en-US': 'Default Time' }, item: { type: Date } },
          disabledHours: { type: Function, label: { 'zh-CN': '禁用小时函数', 'en-US': 'Disabled Hours' }, params: [{ name: 'role', type: String }, { name: 'comparingDate', type: Date }] },
          disabledMinutes: { type: Function, label: { 'zh-CN': '禁用分钟函数', 'en-US': 'Disabled Minutes' }, params: [{ name: 'hour', type: Number }, { name: 'role', type: String }, { name: 'comparingDate', type: Date }] },
          disabledSeconds: { type: Function, label: { 'zh-CN': '禁用秒函数', 'en-US': 'Disabled Seconds' }, params: [{ name: 'hour', type: Number }, { name: 'minute', type: Number }, { name: 'role', type: String }, { name: 'comparingDate', type: Date }] },
        },
        models: {
          modelValue: '',
        },
        events: {
          change: [{ name: 'value', type: String }],
          blur: [{ name: 'event', type: Event }],
          focus: [{ name: 'event', type: Event }],
          'visible-change': [{ name: 'visible', type: Boolean }],
        },
        slots: [],
      },

      // ── ElTimeSelect ───────────────────────────────────────────────────────────
      {
        name: 'ElTimeSelect',
        label: { 'zh-CN': '时间选择下拉', 'en-US': 'Time Select' },
        icon: 'mdi:clock-time-eight-outline',
        component: ElTimeSelect,
        props: {
          placeholder: { type: String, label: { 'zh-CN': '占位文本', 'en-US': 'Placeholder' } },
          start: { type: String, label: { 'zh-CN': '开始时间', 'en-US': 'Start Time' }, default: '09:00' },
          end: { type: String, label: { 'zh-CN': '结束时间', 'en-US': 'End Time' }, default: '18:00' },
          step: { type: String, label: { 'zh-CN': '间隔时间', 'en-US': 'Step' }, default: '00:30' },
          minTime: { type: String, label: { 'zh-CN': '最早可选时间', 'en-US': 'Min Time' } },
          maxTime: { type: String, label: { 'zh-CN': '最晚可选时间', 'en-US': 'Max Time' } },
          format: { type: String, label: { 'zh-CN': '显示格式', 'en-US': 'Format' }, default: 'HH:mm' },
          size: { type: String, label: { 'zh-CN': '尺寸', 'en-US': 'Size' }, options: ['default', 'small', 'large'] },
          disabled: { type: Boolean, label: { 'zh-CN': '禁用', 'en-US': 'Disabled' }, default: false },
          clearable: { type: Boolean, label: { 'zh-CN': '可清空', 'en-US': 'Clearable' }, default: true },
          editable: { type: Boolean, label: { 'zh-CN': '可输入', 'en-US': 'Editable' }, default: true },
          effect: { type: String, label: { 'zh-CN': '主题', 'en-US': 'Effect' }, options: ['light', 'dark'] },
        },
        models: {
          modelValue: '',
        },
        events: {
          change: [{ name: 'value', type: String }],
          blur: [{ name: 'event', type: Event }],
          focus: [{ name: 'event', type: Event }],
        },
        slots: [],
      },

      // ── ElTransfer ─────────────────────────────────────────────────────────────
      {
        name: 'ElTransfer',
        label: { 'zh-CN': '穿梭框', 'en-US': 'Transfer' },
        icon: 'mdi:transfer',
        component: ElTransfer,
        props: {
          data: { type: Array, label: { 'zh-CN': '数据源', 'en-US': 'Data Source' }, item: { type: Object } },
          leftDefaultChecked: { type: Array, label: { 'zh-CN': '左侧默认选中项', 'en-US': 'Left Default Checked' } },
          rightDefaultChecked: { type: Array, label: { 'zh-CN': '右侧默认选中项', 'en-US': 'Right Default Checked' } },
          disabled: { type: Boolean, label: { 'zh-CN': '禁用', 'en-US': 'Disabled' }, default: false },
          filterable: { type: Boolean, label: { 'zh-CN': '可搜索', 'en-US': 'Filterable' }, default: false },
          filterPlaceholder: { type: String, label: { 'zh-CN': '搜索占位文本', 'en-US': 'Filter Placeholder' } },
          targetOrder: { type: String, label: { 'zh-CN': '右侧列表排序', 'en-US': 'Target Order' }, options: ['original', 'push', 'unshift'] },
          titles: { type: Array, label: { 'zh-CN': '左右标题', 'en-US': 'Titles' } },
          buttonTexts: { type: Array, label: { 'zh-CN': '按钮文字', 'en-US': 'Button Texts' } },
          format: { type: Object, label: { 'zh-CN': '顶部勾选状态文字', 'en-US': 'Format' } },
          filterMethod: { type: Function, label: { 'zh-CN': '自定义搜索方法', 'en-US': 'Filter Method' }, params: [{ name: 'query', type: String }, { name: 'item', type: Object }] },
          renderContent: { type: Function, label: { 'zh-CN': '自定义渲染函数', 'en-US': 'Render Content' }, params: [{ name: 'h', type: Function }, { name: 'option', type: Object }] },
        },
        models: {
          modelValue: [],
        },
        events: {
          change: [{ name: 'value', type: Array }, { name: 'direction', type: String }, { name: 'movedKeys', type: Array }],
          'left-check-change': [{ name: 'value', type: Array }, { name: 'movedKeys', type: Array }],
          'right-check-change': [{ name: 'value', type: Array }, { name: 'movedKeys', type: Array }],
        },
        slots: [
          { name: 'default', label: { 'zh-CN': '列表项内容', 'en-US': 'List Item Content' }, virtual: true },
          { name: 'left-footer', label: { 'zh-CN': '左侧底部内容 (left-footer)', 'en-US': 'Left Footer' } },
          { name: 'right-footer', label: { 'zh-CN': '右侧底部内容 (right-footer)', 'en-US': 'Right Footer' } },
        ],
      },

      // ── ElUpload ───────────────────────────────────────────────────────────────
      {
        name: 'ElUpload',
        label: { 'zh-CN': '上传', 'en-US': 'Upload' },
        icon: 'mdi:upload-outline',
        component: ElUpload,
        props: {
          action: { type: String, label: { 'zh-CN': '上传地址 (action)', 'en-US': 'Action' } },
          method: { type: String, label: { 'zh-CN': '请求方法', 'en-US': 'Method' }, options: ['post', 'put', 'patch'], default: 'post' },
          multiple: { type: Boolean, label: { 'zh-CN': '多文件上传', 'en-US': 'Multiple' }, default: false },
          accept: { type: String, label: { 'zh-CN': '接受的文件类型', 'en-US': 'Accept' } },
          listType: { type: String, label: { 'zh-CN': '文件列表样式', 'en-US': 'List Type' }, options: ['text', 'picture', 'picture-card'], default: 'text' },
          showFileList: { type: Boolean, label: { 'zh-CN': '显示文件列表', 'en-US': 'Show File List' }, default: true },
          drag: { type: Boolean, label: { 'zh-CN': '拖拽上传', 'en-US': 'Drag' }, default: false },
          disabled: { type: Boolean, label: { 'zh-CN': '禁用', 'en-US': 'Disabled' }, default: false },
          directory: { type: Boolean, label: { 'zh-CN': '允许上传目录', 'en-US': 'Directory' }, default: false },
          limit: { type: Number, label: { 'zh-CN': '最大上传数量', 'en-US': 'Limit' } },
          autoUpload: { type: Boolean, label: { 'zh-CN': '自动上传', 'en-US': 'Auto Upload' }, default: true },
          withCredentials: { type: Boolean, label: { 'zh-CN': '携带 cookie', 'en-US': 'With Credentials' }, default: false },
          beforeUpload: { type: Function, label: { 'zh-CN': '上传前钩子', 'en-US': 'Before Upload' }, params: [{ name: 'file', type: Object }] },
          beforeRemove: { type: Function, label: { 'zh-CN': '移除前钩子', 'en-US': 'Before Remove' }, params: [{ name: 'file', type: Object }, { name: 'fileList', type: Array }] },
          headers: { type: Object, label: { 'zh-CN': '上传请求头', 'en-US': 'Headers' } },
          data: { type: Object, label: { 'zh-CN': '上传请求额外参数', 'en-US': 'Data' } },
          name: { type: String, label: { 'zh-CN': '上传文件字段名', 'en-US': 'Name' }, default: 'file' },
          crossorigin: { type: String, label: { 'zh-CN': '支持跨域上传', 'en-US': 'Cross Origin' }, options: ['', 'anonymous', 'use-credentials'] },
          onPreview: { type: Function, label: { 'zh-CN': '预览文件钩子', 'en-US': 'On Preview' }, params: [{ name: 'file', type: Object }] },
          onRemove: { type: Function, label: { 'zh-CN': '移除文件钩子', 'en-US': 'On Remove' }, params: [{ name: 'file', type: Object }, { name: 'fileList', type: Array }] },
          onSuccess: { type: Function, label: { 'zh-CN': '上传成功钩子', 'en-US': 'On Success' }, params: [{ name: 'response', type: Object }, { name: 'file', type: Object }, { name: 'fileList', type: Array }] },
          onError: { type: Function, label: { 'zh-CN': '上传失败钩子', 'en-US': 'On Error' }, params: [{ name: 'err', type: Object }, { name: 'file', type: Object }, { name: 'fileList', type: Array }] },
          onChange: { type: Function, label: { 'zh-CN': '文件状态改变钩子', 'en-US': 'On Change' }, params: [{ name: 'file', type: Object }, { name: 'fileList', type: Array }] },
          onExceed: { type: Function, label: { 'zh-CN': '超出上传限制钩子', 'en-US': 'On Exceed' }, params: [{ name: 'files', type: Array }, { name: 'fileList', type: Array }] },
          httpRequest: { type: Function, label: { 'zh-CN': '自定义上传请求函数', 'en-US': 'Http Request' }, params: [{ name: 'options', type: Object }] },
        },
        models: {
          fileList: [],
        },
        events: {
          change: [{ name: 'file', type: Object }, { name: 'fileList', type: Array }],
          success: [{ name: 'response', type: Object }, { name: 'file', type: Object }, { name: 'fileList', type: Array }],
          error: [{ name: 'err', type: Object }, { name: 'file', type: Object }, { name: 'fileList', type: Array }],
          remove: [{ name: 'file', type: Object }, { name: 'fileList', type: Array }],
          preview: [{ name: 'file', type: Object }],
          exceed: [{ name: 'files', type: Array }, { name: 'fileList', type: Array }],
          progress: [{ name: 'event', type: Object }, { name: 'file', type: Object }, { name: 'fileList', type: Array }],
        },
        slots: [
          { name: 'default', label: { 'zh-CN': '触发上传区域', 'en-US': 'Trigger Area' } },
          { name: 'trigger', label: { 'zh-CN': '触发按钮 (trigger)', 'en-US': 'Trigger Button' } },
          { name: 'tip', label: { 'zh-CN': '提示说明 (tip)', 'en-US': 'Tip' } },
          { name: 'file', label: { 'zh-CN': '文件项 (file)', 'en-US': 'File Item' } },
        ],
      },
    ],
  },
]

export default components


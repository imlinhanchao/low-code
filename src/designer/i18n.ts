import { reactive, computed, readonly } from 'vue'

export type Locale = 'en-US' | 'zh-CN' | string

export interface I18nMessages {
  [key: string]: string | I18nMessages
}

export interface I18nConfig {
  locale: Locale
  messages: Record<Locale, I18nMessages>
}

const getBrowserLocale = (): Locale => {
  if (typeof window === 'undefined') return 'zh-CN'
  const lang = window.navigator.language
  if (lang.startsWith('zh')) return 'zh-CN'
  return 'en-US'
}

const state = reactive<I18nConfig>({
  locale: getBrowserLocale(),
  messages: {
    'zh-CN': {
      designer: {
        componentLib: '组件库',
        canvas: '画布',
        propsPanel: '属性',
        globalConfig: '全局',
        widgetId: '组件 ID',
        idRequired: 'ID 不能为空',
        idOccupied: 'ID "{id}" 已被占用',
        selectWidgetHint: '选择一个组件开始配置',
        canvasEmptyHint: '从左侧拖拽组件到此处',
        back: '返回',
        slots: '插槽',
        empty: '空',
        // GlobalConfigPanel
        css: '全局 CSS',
        editCss: '编辑全局 CSS 样式',
        lifecycleHooks: '代码生命周期',
        onMounted: '初始化阶段 (onMounted)',
        onModelChange: '字段变化 (onModelChange)',
        customFunctions: '自定义函数',
        addFunction: '添加函数',
        fnName: '函数名称',
        editFn: '编辑函数',
        apply: '应用',
        cancel: '取消',
        confirm: '确定',
        expression: '表达式',
        editExpression: '编辑表达式',
        // GlobalConfigPanel Extra
        cssStyle: 'CSS 样式',
        globalCss: '全局 CSS',
        lifecycleHooksTitle: '生命周期函数',
        globalFunctions: '全局函数',
        functionName: '函数名称',
        deleteFn: '删除函数',
        exitFullscreen: '退出全屏',
        fullscreenEdit: '全屏编辑',
        placeholderCss: '/* 在此输入全局 CSS */',
        placeholderFn: '// 在此输入函数体',
        // Common
        delete: '删除',
        copy: '复制',
        move: '移动',
        add: '添加',
        placeholder: '请输入',
        noData: '暂无数据',
        search: '搜索',
        close: '关闭',
        save: '保存',
        reset: '重置',
        loading: '加载中',
        // Property Panel
        commonProps: '通用属性',
        widgetProps: '组件属性',
        dataSource: '数据源',
        fieldName: '字段名',
        defaultValue: '默认值',
        placeholderLabel: '占位提示',
        class: 'CSS 类名',
        hidden: '隐藏',
        modelOnly: '仅模型',
        addItems: '添加选项',
        noItems: '暂无选项',
        editJson: '编辑 JSON',
        setting: '设置',
        content: '内容',
        dragSort: '拖拽排序',
        widgetSetting: '组件设置',
        removeSlot: '从插槽中移除',
        // Layouts
        detailTable: '明细表格',
        addDetail: '新增明细',
        deleteDetail: '删除明细',
        cancelDelete: '取消',
        confirmDelete: '确认删除',
        confirmDeleteMsg: '确定要删除选中的 {count} 条记录吗？此操作不可撤销。',
        // Rules
        required: '必填',
        pattern: '正则',
        regexPlaceholder: '正则表达式',
        errorMessage: '错误提示',
        errorMsgPlaceholder: '请输入校验失败提示',
        addRule: '添加规则',
        trigger: '触发方式',
        // Tabs
        componentProps: '组件属性',
        // Expression
        expressionExample: '例如：$model.age > 18 或 !$global.readonly',
        expressionHint: '支持使用 $model, $global, $scope 编写表达式。例如：$model.age > 18 或 !$global.readonly',
        expressionPlaceholder: '输入 JavaScript 表达式...',
        // Events
        events: '事件',
        eventHandlers: '设置处理器',
        isSet: '已设置',
        edit: '编辑',
        set: '设置',
      }
    },
    'en-US': {
      designer: {
        componentLib: 'Component Library',
        canvas: 'Canvas',
        propsPanel: 'Props',
        globalConfig: 'Global Config',
        widgetId: 'Widget ID',
        idRequired: 'ID is required',
        idOccupied: 'ID "{id}" is already occupied',
        selectWidgetHint: 'Select a widget to configure',
        canvasEmptyHint: 'Drag components from the left to here',
        back: 'Back',
        slots: 'Slots',
        empty: 'Empty',
        // GlobalConfigPanel
        css: 'Global CSS',
        editCss: 'Edit Global CSS',
        lifecycleHooks: 'Lifecycle Hooks',
        onMounted: 'Initialization (onMounted)',
        onModelChange: 'Model Changed (onModelChange)',
        customFunctions: 'Custom Functions',
        addFunction: 'Add Function',
        fnName: 'Function Name',
        editFn: 'Edit Function',
        apply: 'Apply',
        cancel: 'Cancel',
        confirm: 'Confirm',
        expression: 'Expression',
        editExpression: 'Edit Expression',
        // GlobalConfigPanel Extra
        cssStyle: 'CSS Styles',
        globalCss: 'Global CSS',
        lifecycleHooksTitle: 'Lifecycle Hooks',
        globalFunctions: 'Global Functions',
        functionName: 'Function Name',
        deleteFn: 'Delete Function',
        exitFullscreen: 'Exit Fullscreen',
        fullscreenEdit: 'Fullscreen Edit',
        placeholderCss: '/* Enter global CSS here */',
        placeholderFn: '// Enter function body here',
        // Common
        delete: 'Delete',
        copy: 'Copy',
        move: 'Move',
        add: 'Add',
        placeholder: 'Please input',
        noData: 'No Data',
        search: 'Search',
        close: 'Close',
        save: 'Save',
        reset: 'Reset',
        loading: 'Loading',
        // Property Panel
        commonProps: 'Common Props',
        widgetProps: 'Widget Props',
        dataSource: 'Data Source',
        fieldName: 'Field Name',
        defaultValue: 'Default Value',
        placeholderLabel: 'Placeholder',
        class: 'CSS Class',
        hidden: 'Hidden',
        modelOnly: 'Model Only',
        addItems: 'Add Items',
        noItems: 'No Items',
        editJson: 'Edit JSON',
        setting: 'Setting',
        content: 'Content',
        dragSort: 'Drag Sort',
        widgetSetting: 'Widget Setting',
        removeSlot: 'Remove from Slot',
        // Layouts
        detailTable: 'Detail Table',
        addDetail: 'Add Detail',
        deleteDetail: 'Delete Detail',
        cancelDelete: 'Cancel',
        confirmDelete: 'Confirm Delete',
        confirmDeleteMsg: 'Are you sure you want to delete {count} selected records? This cannot be undone.',
        // Rules
        required: 'Required',
        pattern: 'Pattern',
        regexPlaceholder: 'Regular Expression',
        errorMessage: 'Error Message',
        errorMsgPlaceholder: 'Enter error message',
        addRule: 'Add Rule',
        trigger: 'Trigger',
        // Tabs
        componentProps: 'Component Props',
        // Expression
        expressionExample: 'e.g. $model.age > 18 or !$global.readonly',
        expressionHint: 'Support $model, $global, $scope in expressions. e.g. $model.age > 18 or !$global.readonly',
        expressionPlaceholder: 'Input JavaScript expression...',
        // Events
        events: 'Events',
        eventHandlers: 'Edit Handler',
        isSet: 'Set',
        edit: 'Edit',
        set: 'Set',
      }
    }
  }
})

export function useI18n() {
  const locale = computed({
    get: () => state.locale,
    set: (lang: Locale) => { state.locale = lang }
  })

  function t(path: string, args?: Record<string, any>): string {
    const parts = path.split('.')
    let current: any = state.messages[state.locale] || state.messages['zh-CN']
    
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part]
      } else {
        return path
      }
    }

    if (typeof current !== 'string') return path

    if (args) {
      return current.replace(/\{(\w+)\}/g, (_, key) => args[key] || `{${key}}`)
    }

    return current
  }

  function tt(lable: string | Record<string, string> | undefined): string {
    if (!lable) return ''
    if (typeof lable === 'string') return lable
    return lable[state.locale] || lable['zh-CN'] || Object.values(lable)[0] || ''
  }

  return {
    locale,
    t,
    tt,
    getLocale: () => state.locale,
    setLocale: (lang: Locale) => { state.locale = lang },
    addLocale: (lang: Locale, i18n: I18nMessages) => {
      state.messages[lang] = {
        ...(state.messages[lang] || {}),
        ...i18n
      }
    },
    messages: readonly(state.messages)
  }
}

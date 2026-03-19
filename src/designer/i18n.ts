import { reactive, computed, readonly } from 'vue'

export type Locale = 'en-US' | 'zh-CN' | string

export interface I18nMessages {
  [key: string]: string | I18nMessages
}

export interface I18nConfig {
  locale: Locale
  messages: Record<Locale, I18nMessages>
}

const state = reactive<I18nConfig>({
  locale: 'zh-CN',
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
        // Common
        delete: '删除',
        copy: '复制',
        move: '移动',
      }
    },
    'en-US': {
      designer: {
        componentLib: 'Component Library',
        canvas: 'Canvas',
        propsPanel: 'Props',
        globalConfig: 'Global',
        widgetId: 'Widget ID',
        idRequired: 'ID is required',
        idOccupied: 'ID "{id}" is already occupied',
        selectWidgetHint: 'Select a widget to configure',
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
        // Common
        delete: 'Delete',
        copy: 'Copy',
        move: 'Move',
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

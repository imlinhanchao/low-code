import type { App } from 'vue'
import LcDesigner from './designer/index.vue'
import LcRenderer from './renderer/index.vue'

export { LcDesigner, LcRenderer }
export type { ComponentConfig, WidgetSchema, FormSchema, SlotConfig } from './types'
export { builtinLayouts } from './layouts/index'

export default {
  install(app: App) {
    app.component('LcDesigner', LcDesigner)
    app.component('LcRenderer', LcRenderer)
  },
}

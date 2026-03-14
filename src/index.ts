import type { App } from 'vue'
import MyButton from './components/MyButton.vue'

export { MyButton }

export default {
  install(app: App) {
    app.component('MyButton', MyButton)
  },
}

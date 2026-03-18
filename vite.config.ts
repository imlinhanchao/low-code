import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      // Resolve low-code to source in dev to avoid needing a dist build
      'low-code': fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      // Resolve @low-code/element-plus to source in dev to avoid needing a dist build
      '@low-code/element-plus': fileURLToPath(new URL('./packages/element-plus/src/index.ts', import.meta.url)),
    },
  },
  server: {
    allowedHosts: true,
  },
})

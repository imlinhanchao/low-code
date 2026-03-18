import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      // Resolve lc.vue to source in dev to avoid needing a dist build
      'lc.vue': fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      // Resolve lc-ep to source in dev to avoid needing a dist build
      'lc-ep': fileURLToPath(new URL('./packages/element-plus/src/index.ts', import.meta.url)),
    },
  },
  server: {
    allowedHosts: true,
  },
  build: {
    outDir: 'dist/demo',
  }
})

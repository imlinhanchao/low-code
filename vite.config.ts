import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  base: './',
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      // Resolve lc-vue3 to source in dev to avoid needing a dist build
      'lc-vue3': fileURLToPath(new URL('./src/index.ts', import.meta.url)),
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

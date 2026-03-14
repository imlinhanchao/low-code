import { defineConfig } from 'tsdown'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm', 'cjs'],
  dts: false,
  clean: true,
  plugins: [
    vue(),
  ],
  deps: {
    neverBundle: ['vue'],
  },
})

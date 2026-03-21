import { defineConfig } from 'tsdown'
import Vue from 'unplugin-vue/rolldown'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm', 'cjs'],
  platform: 'neutral',
  plugins: [Vue({ isProduction: true })],
  dts: { vue: true },  
  clean: true,
  deps: {
    neverBundle: ['vue', 'element-plus', 'lc-vue3'],
  },
})

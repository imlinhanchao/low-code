import { defineConfig } from 'tsdown'
import Vue from 'unplugin-vue/rolldown'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm', 'cjs'],
  platform: 'neutral',
  clean: true,
  plugins: [Vue({ isProduction: true })],
  dts: { vue: true },
  deps: {
    neverBundle: ['vue'],
  },
})

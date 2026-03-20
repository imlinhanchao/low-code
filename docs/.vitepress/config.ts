import { defineConfig } from 'vitepress'
import { pagefindPlugin } from 'vitepress-plugin-pagefind';

function chineseSearchOptimize(input: string) {
  // @ts-ignore
  const segmenter = new Intl.Segmenter('zh-CN', { granularity: 'word' });
  const result: string[] = [];
  for (const it of segmenter.segment(input)) {
    if (it.isWordLike) {
      result.push(it.segment);
    }
  }
  return result.join(' ');
}

export default defineConfig({
  title: "Low Code",
  description: "Configurable low-code form designer and renderer based on Vue 3",
  
  locales: {
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      themeConfig: {
        nav: [
          { text: '组件定义', link: '/zh/guide/component-definition' },
          { text: '示例', link: 'https://lc.hancel.org/demo/' },
        ],
        sidebar: [
          {
            text: '入门指导',
            items: [
              { text: '快速上手', link: '/zh/guide/getting-started' },
              { text: '脚本与表达式', link: '/zh/guide/scripts' },
              { text: '国际化配置', link: '/zh/guide/i18n' },
            ]
          },
          {
            text: '组件开发',
            items: [
              { text: '组件定义规范', link: '/zh/guide/component-definition' },
              { text: '布局组件', link: '/zh/guide/layouts' }
            ]
          },
          {
            text: 'API 参考',
            items: [
              { text: '导出接口与组件', link: '/zh/guide/exports-reference' },
              { text: '核心类型定义', link: '/zh/guide/api-reference' }
            ]
          }
        ]
      }
    },
    en: {
      label: 'English',
      lang: 'en-US',
      themeConfig: {
        nav: [
          { text: 'Component Definition', link: '/en/guide/component-definition' },
          { text: 'Demo', link: 'https://lc.hancel.org/demo/' },
        ],
        sidebar: [
          {
            text: 'Guide',
            items: [
              { text: 'Getting Started', link: '/en/guide/getting-started' },
              { text: 'Scripts & Expressions', link: '/en/guide/scripts' },
              { text: 'I18n Configuration', link: '/en/guide/i18n' },
            ]
          },
          {
            text: 'Component Development',
            items: [
              { text: 'Definition Specs', link: '/en/guide/component-definition' },
              { text: 'Layout Components', link: '/en/guide/layouts' }
            ]
          },
          {
            text: 'API Reference',
            items: [
              { text: 'Exports Reference', link: '/en/guide/exports-reference' },
              { text: 'Core Types', link: '/en/guide/api-reference' }
            ]
          }
        ]
      }
    }
  },

  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/imlinhanchao/low-code' }
    ]
  },

  vite: {
    plugins: [        
      pagefindPlugin({
        customSearchQuery: chineseSearchOptimize,
      }),
    ],
    server: {
      allowedHosts: true,
    },
  },
})

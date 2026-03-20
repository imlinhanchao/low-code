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
  description: "基于 Vue 3 的低代码表单设计器与渲染器",
  themeConfig: {
    nav: [
      { text: '组件定义', link: '/guide/component-definition' },
      { text: '示例', link: 'https://lc.hancel.org/demo/' },
    ],
    sidebar: [
      {
        text: '入门指导',
        items: [
          { text: '快速上手', link: '/guide/getting-started' },
          { text: '脚本与表达式', link: '/guide/scripts' },
          { text: '国际化配置', link: '/guide/i18n' },
        ]
      },
      {
        text: '组件开发',
        items: [
          { text: '组件定义规范', link: '/guide/component-definition' },
          { text: '布局组件', link: '/guide/layouts' }
        ]
      },
      {
        text: 'API 参考',
        items: [
          { text: '导出接口与组件', link: '/guide/exports-reference' },
          { text: '核心类型定义', link: '/guide/api-reference' }
        ]
      }
    ],
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

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
      { text: '基础使用', link: '/guide/getting-started' },
      { text: '组件定义', link: '/guide/component-definition' },
      { text: 'API 参考', link: '/guide/api-reference' }
    ],
    sidebar: [
      {
        text: '入门指导',
        items: [
          { text: '快速上手', link: '/guide/getting-started' },
        ]
      },
      {
        text: '组件开发',
        items: [
          { text: '组件定义规范', link: '/guide/component-definition' },
          { text: '布局组件', link: '/guide/layouts' },
          { text: 'API 参考', link: '/guide/api-reference' }
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

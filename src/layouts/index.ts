import type { ComponentConfig, SlotConfig } from '../types'
import GridLayout from './GridLayout.vue'
import CardLayout from './CardLayout.vue'
import TabsLayout from './TabsLayout.vue'
import TableLayout from './TableLayout.vue'
import StaticText from './StaticText.vue'
import HtmlBlock from './HtmlBlock.vue'

export const builtinLayouts: ComponentConfig[] = [
  {
    name: '栅格布局',
    category: 'layout',
    icon: 'mdi:view-column-outline',
    component: GridLayout,
    props: { columns: 2 },
    computeSlots: (props): SlotConfig[] =>
      Array.from({ length: Math.max(1, Number(props.columns) || 2) }, (_, i) => ({
        name: `col-${i}`,
        label: `第 ${i + 1} 列`,
      })),
  },
  {
    name: '卡片',
    category: 'layout',
    icon: 'mdi:card-outline',
    component: CardLayout,
    props: { header: '卡片标题' },
    slots: [
      { name: 'header', label: '标题栏' },
      { name: 'default', label: '内容区' },
    ],
  },
  {
    name: '标签页',
    category: 'layout',
    icon: 'mdi:tab',
    component: TabsLayout,
    props: { tabLabels: '标签1,标签2' },
    computeSlots: (props): SlotConfig[] => {
      const raw = (props.tabLabels as string) ?? '标签1,标签2'
      const labels = raw.split(',').map((s: string) => s.trim()).filter(Boolean)
      return labels.map((label: string, i: number) => ({ name: `tab-${i}`, label }))
    },
  },
  {
    name: '表格布局',
    category: 'layout',
    icon: 'mdi:table',
    component: TableLayout,
    props: { rows: 2, cols: 2 },
    computeSlots: (props): SlotConfig[] => {
      const rows = Math.max(1, Number(props.rows) || 2)
      const cols = Math.max(1, Number(props.cols) || 2)
      const slots: SlotConfig[] = []
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          slots.push({ name: `cell-${r}-${c}`, label: `${r + 1}行${c + 1}列` })
        }
      }
      return slots
    },
  },
  {
    name: '静态文本',
    category: 'layout',
    icon: 'mdi:format-text',
    component: StaticText,
    props: { content: '静态文本' },
    slots: [],
  },
  {
    name: 'HTML 块',
    category: 'layout',
    icon: 'mdi:language-html5',
    component: HtmlBlock,
    props: { html: '<p>自定义 HTML 内容</p>' },
    slots: [],
  },
]

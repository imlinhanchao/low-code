import type { ComponentConfig, SlotConfig } from '../types'
import GridLayout from './GridLayout.vue'
import CardLayout from './CardLayout.vue'
import TabsLayout from './TabsLayout.vue'
import TableLayout from './TableLayout.vue'
import StaticText from './StaticText.vue'
import HtmlBlock from './HtmlBlock.vue'
import DetailTable from './DetailTable.vue'

const HTML_PROP = { type: String, label: 'HTML 内容', default: '', multiline: true }

export const GridComponent: ComponentConfig = {
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
}

export const CardComponent: ComponentConfig = {
  name: '卡片',
  category: 'layout',
  icon: 'mdi:card-outline',
  component: CardLayout,
  props: { header: '卡片标题' },
  slots: [
    { name: 'header', label: '标题栏' },
    { name: 'default', label: '内容区' },
  ],
};

export const TabComponent: ComponentConfig = {
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
}

export const TableComponent: ComponentConfig = {
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
}

export const InlineComponent: ComponentConfig = {
  name: '内联文本',
  category: 'layout',
  icon: 'mdi:format-text',
  component: StaticText,
  props: { html: { ...HTML_PROP, default: '内联文本', label: 'HTML 内容' } },
  slots: [{ name: 'default', label: '内容' }],
}

export const BlockComponent: ComponentConfig = {
  name: '块级盒子',
  category: 'layout',
  icon: 'mdi:language-html5',
  component: HtmlBlock,
  props: { html: { ...HTML_PROP, default: '<p>自定义 HTML 内容</p>', label: 'HTML 内容' } },
  slots: [{ name: 'default', label: '内容' }],
}

export const DetailTableComponent: ComponentConfig = {
  name: '明细表',
  category: 'layout',
  icon: 'mdi:table-edit',
  component: DetailTable,
  props: {
    showIndex: { type: Boolean, label: '显示序号', default: true },
    mode: { type: String, label: '显示模式', default: 'list', options: ['list', 'table'] },
    headers: { type: Array, label: '表头列表', default: [], item: { type: String, label: '列标题' } },
  },
  models: { modelValue: [] },
  computeSlots: (props): SlotConfig[] => {
    if (props.mode === 'table') {
      const headers = (props.headers as string[]) ?? []
      if (headers.length === 0) return [{ name: 'col-0', label: '列 1' }]
      return headers.map((h: string, i: number) => ({
        name: `col-${i}`,
        label: h || `列 ${i + 1}`,
      }))
    }
    return [{ name: 'default', label: '内容' }]
  },
}

export const layoutComponents: ComponentConfig[] = [
  GridComponent,
  CardComponent,
  TabComponent,
  TableComponent,
  InlineComponent,
  BlockComponent,
  DetailTableComponent,
]

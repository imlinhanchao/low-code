import type { ComponentConfig, SlotConfig } from '../types'
import GridLayout from './GridLayout.vue'
import CardLayout from './CardLayout.vue'
import TabsLayout from './TabsLayout.vue'
import TableLayout from './TableLayout.vue'
import StaticText from './StaticText.vue'
import HtmlBlock from './HtmlBlock.vue'
import DetailTable from './DetailTable.vue'

const HTML_PROP = { type: String, label: { 'zh-CN': 'HTML 内容', 'en-US': 'HTML Content' }, default: '', multiline: true }

export const GridComponent: ComponentConfig = {
  name: 'Grid',
  label: { 'zh-CN': '栅格布局', 'en-US': 'Grid Layout' },
  category: 'layout',
  icon: 'mdi:view-column-outline',
  component: GridLayout,
  props: {
    columns: {
      type: Object, label: { 'zh-CN': '列数', 'en-US': 'Columns' }, props: {
        sm: { type: Number, default: 1 },
        md: { type: Number, default: 2 },
        lg: { type: Number, default: 3 }
      },
      default: { sm: 1, md: 2, lg: 3 }
    },
    count: { type: Number, label: { 'zh-CN': '数量', 'en-US': 'Count' }, default: 6 },
    gap: { type: Number, label: { 'zh-CN': '间距', 'en-US': 'Gap' }, default: 8 },
  },
  computeSlots: (props): SlotConfig[] =>
    Array.from({ length: Math.max(1, Number(props.count) || 6) }, (_, i) => ({
      name: `col-${i}`,
      label: { 'zh-CN': `第 ${i + 1} 块`, 'en-US': `Col ${i + 1}` },
    })),
}

export const CardComponent: ComponentConfig = {
  name: 'Card',
  label: { 'zh-CN': '卡片', 'en-US': 'Card' },
  category: 'layout',
  icon: 'mdi:card-outline',
  component: CardLayout,
  props: { header: { type: String, label: { 'zh-CN': '卡片标题', 'en-US': 'Card Title' }, default: '卡片标题' } },
  slots: [
    { name: 'header', label: { 'zh-CN': '标题栏', 'en-US': 'Header' } },
    { name: 'default', label: { 'zh-CN': '内容区', 'en-US': 'Content' } },
  ],
};

export const TabComponent: ComponentConfig = {
  name: 'Tabs',
  label: { 'zh-CN': '标签页', 'en-US': 'Tabs' },
  category: 'layout',
  icon: 'mdi:tab',
  component: TabsLayout,
  props: { tabLabels: { type: String, label: { 'zh-CN': '标签列表', 'en-US': 'Tab Labels' }, default: '标签1,标签2' } },
  computeSlots: (props): SlotConfig[] => {
    const raw = (props.tabLabels as string) ?? '标签1,标签2'
    const labels = raw.split(',').map((s: string) => s.trim()).filter(Boolean)
    return labels.map((label: string, i: number) => ({ name: `tab-${i}`, label }))
  },
}

export const TableComponent: ComponentConfig = {
  name: 'Table',
  label: { 'zh-CN': '表格布局', 'en-US': 'Table Layout' },
  category: 'layout',
  icon: 'mdi:table',
  component: TableLayout,
  props: { rows: { type: Number, label: { 'zh-CN': '行数', 'en-US': 'Rows' }, default: 2 }, cols: { type: Number, label: { 'zh-CN': '列数', 'en-US': 'Cols' }, default: 2 } },
  computeSlots: (props): SlotConfig[] => {
    const rows = Math.max(1, Number(props.rows) || 2)
    const cols = Math.max(1, Number(props.cols) || 2)
    const slots: SlotConfig[] = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        slots.push({ name: `cell-${r}-${c}`, label: { 'zh-CN': `${r + 1}行${c + 1}列`, 'en-US': `R${r + 1} C${c + 1}` } })
      }
    }
    return slots
  },
}

export const InlineComponent: ComponentConfig = {
  name: 'StaticText',
  label: { 'zh-CN': '内联文本', 'en-US': 'Static Text' },
  category: 'layout',
  icon: 'mdi:format-text',
  component: StaticText,
  props: { html: { ...HTML_PROP, default: '内联文本', label: { 'zh-CN': 'HTML 内容', 'en-US': 'HTML Content' } } },
  slots: [{ name: 'default', label: { 'zh-CN': '内容', 'en-US': 'Content' } }],
}

export const BlockComponent: ComponentConfig = {
  name: 'HtmlBlock',
  label: { 'zh-CN': '块级盒子', 'en-US': 'Html Block' },
  category: 'layout',
  icon: 'mdi:language-html5',
  component: HtmlBlock,
  props: { html: { ...HTML_PROP, default: '<p>自定义 HTML 内容</p>', label: { 'zh-CN': 'HTML 内容', 'en-US': 'HTML Content' } } },
  slots: [{ name: 'default', label: { 'zh-CN': '内容', 'en-US': 'Content' } }],
}

export const DetailTableComponent: ComponentConfig = {
  name: 'DetailTable',
  label: { 'zh-CN': '明细表', 'en-US': 'Detail Table' },
  category: 'layout',
  icon: 'mdi:table-edit',
  component: DetailTable,
  props: {
    showIndex: { type: Boolean, label: { 'zh-CN': '显示序号', 'en-US': 'Show Index' }, default: true },
    mode: { type: String, label: { 'zh-CN': '显示模式', 'en-US': 'Display Mode' }, default: 'list', options: ['list', 'table'] },
    headers: { type: Array, label: { 'zh-CN': '表头列表', 'en-US': 'Headers' }, default: [], item: { type: String, label: { 'zh-CN': '列标题', 'en-US': 'Column Title' } } },
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

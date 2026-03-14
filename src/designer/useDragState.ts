import { ref } from 'vue'
import type { ComponentConfig, WidgetSchema } from '../types'

/** The component config being dragged from the palette */
export const draggingConfig = ref<ComponentConfig | null>(null)

/** An already-placed widget being dragged to a new position or slot */
export const draggingWidget = ref<WidgetSchema | null>(null)

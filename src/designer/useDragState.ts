import { ref } from 'vue'
import type { ComponentConfig } from '../types'

/** The component config being dragged from the palette */
export const draggingConfig = ref<ComponentConfig | null>(null)

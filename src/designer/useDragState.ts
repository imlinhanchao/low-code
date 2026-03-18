import { ref, computed } from 'vue'
import type { ComponentConfig, WidgetSchema } from '../types'

/** The component config being dragged from the palette */
export const draggingConfig = ref<ComponentConfig | null>(null)

/** An already-placed widget being dragged to a new position or slot */
export const draggingWidget = ref<WidgetSchema | null>(null)

/** True whenever any drag (from palette or from canvas) is in progress */
export const isDragging = computed(
  () => draggingConfig.value !== null || draggingWidget.value !== null,
)

/**
 * The parentId of the CanvasSlotZone currently under the pointer during drag.
 * Used to highlight the parent component block when hovering over one of its slots.
 */
export const hoveredSlotParentId = ref<string | null>(null)

import { ref } from 'vue'

/**
 * Widget id currently under the mouse cursor on the canvas.
 * Updated by each CanvasWidgetNode's onMouseover handler and cleared
 * by the canvas container's onMouseleave handler.
 */
export const hoveredId = ref<string | null>(null)

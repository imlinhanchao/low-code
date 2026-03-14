import type { Component } from 'vue'

/** Definition of a slot that a component exposes */
export interface SlotConfig {
  name: string
  /** Optional list of sub-components that can be placed inside this slot */
  components?: ComponentConfig[]
}

/** Shape of an event parameter */
export interface EventParam {
  name: string
  type: unknown
}

/** Config entry for a single registerable component */
export interface ComponentConfig {
  /** Display name shown in the palette */
  name: string
  /** The actual Vue component constructor */
  component: Component
  /** Default static prop values (string / number / boolean) */
  props?: Record<string, unknown>
  /** Default model bindings (v-model keys → initial values) */
  models?: Record<string, unknown>
  /** Declared events and their parameter descriptors */
  events?: Record<string, EventParam[]>
  /** Slots the component exposes */
  slots?: SlotConfig[]
}

/** One widget placed on the canvas */
export interface WidgetSchema {
  /** Unique instance id */
  id: string
  /** Matches ComponentConfig.name */
  name: string
  /** Current prop values (editable by the right panel) */
  props: Record<string, unknown>
  /** Current model values */
  models: Record<string, unknown>
  /** Text content for the default slot (simple text only) */
  slotContent?: string
}

/** The full form schema produced by the designer */
export interface FormSchema {
  widgets: WidgetSchema[]
}

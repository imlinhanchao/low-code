import type { Component } from 'vue'

/** Definition of a named slot that a component exposes */
export interface SlotConfig {
  name: string
  /** Human-readable label shown in the designer */
  label?: string
  /** Sub-component configs allowed in this slot (empty = any) */
  components?: ComponentConfig[]
  /**
   * When true, slot children are "virtual" components (e.g. ElOption inside ElSelect)
   * that don't render visible content at their slot-mount position.  In the designer
   * they are shown as clickable chips in the panel rather than embedded inside the
   * parent component's visual area.
   */
  virtual?: boolean
}

/** Shape of an event parameter */
export interface EventParam {
  name: string
  type: unknown
}

/** Config entry for a single registerable component (or built-in layout) */
export interface ComponentConfig {
  /** Display name shown in the palette */
  name: string
  /**
   * 'layout'  – built-in container (always shown in the 布局 section of the palette).
   * 'widget'  – user-configured component (default when omitted).
   */
  category?: 'layout' | 'widget'
  /** The actual Vue component constructor */
  component: Component
  /** Default static prop values */
  props?: Record<string, unknown>
  /** Default v-model bindings */
  models?: Record<string, unknown>
  /** Declared events */
  events?: Record<string, EventParam[]>
  /**
   * Static list of slots.
   * For layouts whose slot set depends on props (e.g. a grid with N columns),
   * use `computeSlots` instead (or in addition).
   */
  slots?: SlotConfig[]
  /**
   * Called with the widget's current props to derive the effective slot list.
   * Takes precedence over the static `slots` array when provided.
   */
  computeSlots?: (props: Record<string, unknown>) => SlotConfig[]
}

/** One widget instance placed on the canvas */
export interface WidgetSchema {
  /** Unique instance id */
  id: string
  /** Matches ComponentConfig.name */
  name: string
  /** Mirrors ComponentConfig.category; stored so the canvas can render without looking up the config */
  category: 'layout' | 'widget'
  /** Current prop values */
  props: Record<string, unknown>
  /** Current v-model values */
  models: Record<string, unknown>
  /**
   * Simple text for the default slot of leaf widgets (e.g. button label).
   * Overridden by `slots.default` children when present.
   */
  slotContent?: string
  /** User-authored event handler function bodies: eventName → function body string */
  events?: Record<string, string>
  /** Named slot children: slotName → ordered child widget list */
  slots: Record<string, WidgetSchema[]>
}

/** The full form schema produced by the designer */
export interface FormSchema {
  widgets: WidgetSchema[]
}

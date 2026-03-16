/**
 * Minimal ambient type declarations for the `low-code` peer package.
 * These mirror the relevant interfaces from low-code/src/types.ts and are used
 * only for type-checking within @low-code/element-plus at build time.
 */

declare module 'low-code' {
  import type { Component, DefineComponent } from 'vue'

  export interface SlotConfig {
    name: string
    label?: string
    components?: ComponentConfig[]
    virtual?: boolean
    noPlaceholder?: boolean
  }

  export interface EventParam {
    name: string
    type: unknown
  }

  export interface PropConfig {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type: BooleanConstructor | StringConstructor | NumberConstructor | FunctionConstructor | ObjectConstructor | ArrayConstructor
    label?: string
    default?: unknown
    options?: string[]
    params?: EventParam[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dialog?: DefineComponent<any, any, any> | Component
  }

  export interface ComponentProp {
    type: any;
    label?: string;
    item?: ComponentProp; // For array types, defines the type of items
    props?: Record<string, ComponentProp>; // For object types, defines the shape of the object
    default?: any;
    options?: any[];  // For enum types, defines the possible values
    params?: EventParam[]; // For function types, defines the parameters of the function
    dialog?: DefineComponent<any, any, any> | Component;
  }

  export interface ComponentConfig {
    name: string
    icon?: string
    category?: 'layout' | 'widget'
    component: Component
    props?: Record<string, ComponentProp>
    models?: Record<string, unknown>
    events?: Record<string, EventParam[]>
    slots?: SlotConfig[]
    computeSlots?: (props: Record<string, unknown>) => SlotConfig[]
  }

  export interface ComponentGroup {
    group: string
    components: ComponentConfig[]
  }
}

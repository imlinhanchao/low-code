# Scripts & Expressions

In the designer, you can write JavaScript code in component **event handlers**, **function type properties**, and **global lifecycle hooks**. To facilitate form operations, several built-in variables and functions have been injected into the system.

At the same time, the designer supports dynamic control over **almost all component properties** (including booleans, text, numbers, dropdown options, etc.).

## Expressions

In the properties panel, click the **function icon** (ƒ) to the right or bottom of a property to switch to expression mode.

### Supported Scope {#supported-scope}
- **Booleans**: Such as "Hidden", "Disabled", "Required", etc.
- **Base Types**: Such as "Label", "Placeholder", "Default Value", "Max/Min Value", etc.
- **Collection Types**: Such as the "Options List" of a dropdown, column definitions, etc. (must return an object or array matching the format).

### Syntax

An expression should be a valid JavaScript snippet that eventually returns the expected value for that property. Use of built-in variables is supported, for example:
- `$model.age > 18` (returns boolean)
- `` `Welcome, ${$model.username}` `` (returns string)
- `$model.isAdmin ? ['Edit', 'Delete'] : ['View']` (returns array)
- `Number($model.score) >= 60 && $model.passed`

### Configuration Requirements {#config-requirements}

By default, the expression feature is enabled on demand.
- **How to enable**: Control via the `expressions` property on the `<LcDesigner>` component.
  ```vue
  <LcDesigner expressions ... />
  ```

## Built-in Variables {#built-in-variables}

| Variable Name | Description |
| :--- | :--- |
| `$model` | The current form data object (reactive). You can directly read or modify fields within it (e.g., `$model.username = 'admin'`). |
| `$global` | The global shared data object (reactive). Used for state sharing across components or pages. |
| `$scope` | (Slot only) The data object exposed by the current slot. For example, in a table column, `$scope` usually contains the current row data. |

## Built-in Functions {#built-in-functions}

### $getRefs(componentId) {#get-refs}

Gets the Vue instance or DOM element of the specified component. Commonly used to call native methods exposed by the component (such as Element Plus component methods).

- **Arguments**: `componentId` (string) - The component ID configured in the designer.
- **Returns**: Component instance, DOM element, or `undefined`.

### $getProps(componentId) {#get-props}

Gets the current properties object (Props) of the specified component.

- **Arguments**: `componentId` (string) - The component ID configured in the designer.
- **Returns**: The component's properties object (Record<string, any>) or `undefined`.

### $setProps(componentId, props) {#set-props}

Dynamically sets the property values of the specified component. This directly modifies the Schema and takes effect in real-time in the renderer.

- **Arguments**:
  - `componentId` (string) - The ID of the component to operate on.
  - `props` (Object) - The properties object to update. Supports updating common properties (such as `hidden`, `label`) and component-specific properties.
- **Example**: 
  ```javascript
  // Hide the component with ID 'input_123'
  $setProps('input_123', { hidden: true });

  // Modify the button text and disabled state
  $setProps('submit_btn', { slotContent: 'Submitting...', disabled: true });
  ```

---

## Use Cases {#use-cases}

### Event Handling {#event-handling}

Write code in the component's event panel:
```javascript
// When the button is clicked, clear the input field and hide itself
$model.password = '';
$setProps('login_btn', { hidden: true });
```

### Global Lifecycle {#global-lifecycle}

Define in "Global Config -> Scripts" of the designer:
- **onMounted**: Triggered when the form finishes loading.
- **onModelChange**: Triggered when the form data changes.

### Function Props {#function-props}

Certain component properties (such as the validation function `validator`) can be set as function strings:
```javascript
// $model and other variables are automatically injected when the function executes
if ($model.age < 18) return 'Minors are prohibited from registering';
return true;
```

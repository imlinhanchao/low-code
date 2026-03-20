# Layout Components

Layout components serve as the skeleton of low-code forms, used to organize and arrange other business components. All layout components are defined in `src/layouts` and exported as `layoutComponents`.

## Grid

Responsive layout based on CSS Grid.

- **Icon**: `mdi:view-column-outline`
- **Properties**:
  - `columns` (`Object`): Responsive column configuration, including `sm`, `md`, `lg`. Defaults to `{ sm: 1, md: 2, lg: 3 }`.
  - `count` (`Number`): Number of slots, defaults to 6.
  - `gap` (`Number`): Grid gap (unit: px), defaults to 8.
- **Slots**: Dynamically generated slots such as `col-0`, `col-1`, etc.

---

## Card

Wraps content in a container with a title.

- **Icon**: `mdi:card-outline`
- **Properties**:
  - `header` (`String`): Card title.
- **Slots**:
  - `header`: Title bar content.
  - `default`: Main body content of the card.

---

## Tabs

Switches between different content areas via tabs.

- **Icon**: `mdi:tab`
- **Properties**:
  - `tabLabels` (`String`): List of tab names separated by commas (e.g., `Tab 1,Tab 2`).
- **Slots**: Dynamically generated slots such as `tab-0`, `tab-1`, etc.

---

## Table

Precise row and column alignment layout.

- **Icon**: `mdi:table`
- **Properties**:
  - `rows` (`Number`): Number of rows.
  - `cols` (`Number`): Number of columns.
- **Slots**: Dynamically generated slots in `cell-r-c` format (e.g., `cell-0-0` representing the first row and first column).

---

## Detail Table {#detail-table}

Used for handling list or table editing for one-to-many relationships.

- **Icon**: `mdi:table-edit`
- **Properties**:
  - `mode` (`String`): Display mode, options are `list` or `table`.
  - `headers` (`Array`): List of defined column headers when mode is `table`.
  - `showIndex` (`Boolean`): Whether to show index numbers.
- **Slots**:
  - When in `table` mode, `col-i` slots are dynamically generated based on `headers`.
  - When in `list` mode, the `default` slot is used.

> [!NOTE]
> The source of the data model for form components within slots should be set to `\$slot.row` to access current row data.
---

## Text and HTML {#text-html}

Used for inserting static content into the form.

### Inline Text {#inline-text}
- **Usage**: Simple inline HTML text display.
- **Properties**: `html` (supports multi-line/HTML).

### Block Box {#block-box}
- **Usage**: Used as a block-level container or for large sections of HTML injection.
- **Properties**: `html` (supports multi-line/HTML).

# calcite-action

The `calcite-action` component lives in either a `calcite-action-bar` or `calcite-action-pad`. Actions look like an icon with a text description option of the component that will be revealed when the icon/ text is clicked or selected.

<!-- Auto Generated Below -->

## Usage

### Clear-appearance

Renders a `calcite-action` that has a clear background.

```html
<calcite-action appearance="clear" text="Layers" icon="layers"></calcite-action>
```

### With-text-displayed

Renders a `calcite-action` that displays text along side an icon and a tooltip label.

```html
<calcite-action label="Performs my custom action" text="Perform Action!" text-enabled icon="save"></calcite-action>
```

### Without-text-displayed

Renders a `calcite-action` that displays only an icon and a tooltip label.

```html
<calcite-action label="Performs my custom action" text="My Custom Action" icon="plus"></calcite-action>
```

## Properties

| Property            | Attribute      | Description                                                                                                                         | Type                           | Default        |
| ------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | -------------- |
| `active`            | `active`       | Indicates whether the action is highlighted.                                                                                        | `boolean`                      | `false`        |
| `alignment`         | `alignment`    | Optionally specify the horizontal alignment of button elements with text content.                                                   | `"center" \| "end" \| "start"` | `undefined`    |
| `appearance`        | `appearance`   | Specify the appearance style of the action, defaults to solid.                                                                      | `"clear" \| "solid"`           | `"solid"`      |
| `compact`           | `compact`      | Compact mode is used internally by components to reduce side padding, e.g. calcite-block-section.                                   | `boolean`                      | `false`        |
| `disabled`          | `disabled`     | When true, disabled prevents interaction. This state shows items with lower opacity/grayed.                                         | `boolean`                      | `false`        |
| `icon`              | `icon`         | The name of the icon to display. The value of this property must match the icon name from https://esri.github.io/calcite-ui-icons/. | `string`                       | `undefined`    |
| `indicator`         | `indicator`    | Indicates unread changes.                                                                                                           | `boolean`                      | `false`        |
| `intlLoading`       | `intl-loading` | string to override English loading text                                                                                             | `string`                       | `TEXT.loading` |
| `label`             | `label`        | The label of the action. If no label is provided, the label inherits what's provided for the `text` prop.                           | `string`                       | `undefined`    |
| `loading`           | `loading`      | When true, content is waiting to be loaded. This state shows a busy indicator.                                                      | `boolean`                      | `false`        |
| `scale`             | `scale`        | Specifies the size of the action.                                                                                                   | `"l" \| "m" \| "s"`            | `"m"`          |
| `text` _(required)_ | `text`         | Text that accompanies the action icon.                                                                                              | `string`                       | `undefined`    |
| `textEnabled`       | `text-enabled` | Indicates whether the text is displayed.                                                                                            | `boolean`                      | `false`        |

## Events

| Event                | Description                                                                                                             | Type               |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `calciteActionClick` | <span style="color:red">**[DEPRECATED]**</span> use onClick instead.<br/><br/>Emitted when the action has been clicked. | `CustomEvent<any>` |

## Methods

### `setFocus() => Promise<void>`

Sets focus on the component.

#### Returns

Type: `Promise<void>`

## Slots

| Slot | Description                         |
| ---- | ----------------------------------- |
|      | A slot for adding a `calcite-icon`. |

## Dependencies

### Used by

- [calcite-action-bar](../action-bar)
- [calcite-action-group](../action-group)
- [calcite-action-menu](../action-menu)
- [calcite-action-pad](../action-pad)
- [calcite-panel](../panel)
- [calcite-pick-list-item](../pick-list-item)
- [calcite-popover](../popover)
- [calcite-tip](../tip)
- [calcite-tip-manager](../tip-manager)

### Depends on

- [calcite-loader](../loader)
- [calcite-icon](../icon)

### Graph

```mermaid
graph TD;
  calcite-action --> calcite-loader
  calcite-action --> calcite-icon
  calcite-action-bar --> calcite-action
  calcite-action-group --> calcite-action
  calcite-action-menu --> calcite-action
  calcite-action-pad --> calcite-action
  calcite-panel --> calcite-action
  calcite-pick-list-item --> calcite-action
  calcite-popover --> calcite-action
  calcite-tip --> calcite-action
  calcite-tip-manager --> calcite-action
  style calcite-action fill:#f9f,stroke:#333,stroke-width:4px
```

---

_Built with [StencilJS](https://stenciljs.com/)_
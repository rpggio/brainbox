# TreeNote Web Component API Specification

## Overview

`<tree-note>` is a custom web component that provides an outliner-style text editor using TipTap. It operates similar to Logseq, where content is organized in hierarchical nodes rather than free-form text.

## Custom Element

### Tag Name
```html
<tree-note></tree-note>
```

### Attributes

#### `initial-content`
- **Type**: String (JSON)
- **Description**: Initial content to populate the editor
- **Format**: JSON string representing the document structure
- **Example**:
  ```html
  <tree-note initial-content='[{"type":"node","content":[{"type":"text","text":"Hello"}]}]'></tree-note>
  ```

#### `readonly`
- **Type**: Boolean
- **Description**: When present, makes the editor read-only
- **Example**:
  ```html
  <tree-note readonly></tree-note>
  ```

### Properties

#### `content`
- **Type**: Object
- **Description**: Get or set the editor content as a JSON object
- **Example**:
  ```javascript
  const editor = document.querySelector('tree-note');
  console.log(editor.content); // Get content
  editor.content = newContent; // Set content
  ```

#### `markdown`
- **Type**: String
- **Description**: Get or set the editor content as markdown-like text
- **Example**:
  ```javascript
  const editor = document.querySelector('tree-note');
  console.log(editor.markdown); // Get as markdown
  editor.markdown = '- Item 1\n  - Nested item'; // Set from markdown
  ```

#### `readonly`
- **Type**: Boolean
- **Description**: Get or set the read-only state
- **Example**:
  ```javascript
  const editor = document.querySelector('tree-note');
  editor.readonly = true;
  ```

### Methods

#### `focus()`
- **Description**: Focus the editor
- **Returns**: void
- **Example**:
  ```javascript
  document.querySelector('tree-note').focus();
  ```

#### `getJSON()`
- **Description**: Get the current content as a JSON object
- **Returns**: Object
- **Example**:
  ```javascript
  const content = document.querySelector('tree-note').getJSON();
  ```

#### `setJSON(content)`
- **Description**: Set the editor content from a JSON object
- **Parameters**:
  - `content` (Object): The content to set
- **Returns**: void
- **Example**:
  ```javascript
  document.querySelector('tree-note').setJSON({type: 'doc', content: []});
  ```

### Events

#### `change`
- **Description**: Fired when the editor content changes
- **Detail**:
  - `content` (Object): The current content as JSON
  - `markdown` (String): The current content as markdown
- **Example**:
  ```javascript
  editor.addEventListener('change', (e) => {
    console.log('Content changed:', e.detail.content);
  });
  ```

#### `node-created`
- **Description**: Fired when a new node is created (e.g., via Enter key)
- **Detail**:
  - `position` (Number): The position where the node was created
- **Example**:
  ```javascript
  editor.addEventListener('node-created', (e) => {
    console.log('Node created at position:', e.detail.position);
  });
  ```

#### `node-indented`
- **Description**: Fired when a node is indented (via Tab)
- **Detail**:
  - `position` (Number): The position of the indented node
  - `level` (Number): The new indentation level
- **Example**:
  ```javascript
  editor.addEventListener('node-indented', (e) => {
    console.log('Node indented to level:', e.detail.level);
  });
  ```

#### `node-unindented`
- **Description**: Fired when a node is unindented (via Shift+Tab)
- **Detail**:
  - `position` (Number): The position of the unindented node
  - `level` (Number): The new indentation level
- **Example**:
  ```javascript
  editor.addEventListener('node-unindented', (e) => {
    console.log('Node unindented to level:', e.detail.level);
  });
  ```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Create a new node at the same indentation level |
| `Tab` | Indent the current node |
| `Shift+Tab` | Unindent the current node |
| `Backspace` (at start of empty node) | Delete node and merge with previous |

## Node Structure

Each node in the outliner:
- Is marked with a bullet point
- Can contain rich text with basic markup (bold, italic, code, links)
- Shows markup source when cursor is within the node
- Shows rendered markup when cursor is outside the node
- Can be nested to arbitrary depth via indentation

## Styling

The component is **unstyled** by default. All visual styling should be provided by the consuming application via CSS custom properties or global styles targeting the custom element.

### Recommended CSS Custom Properties

```css
tree-note {
  --node-indent: 24px;
  --bullet-size: 6px;
  --bullet-color: currentColor;
  --node-spacing: 4px;
}
```

## Browser Support

- Modern browsers supporting Custom Elements v1
- ES2020+ JavaScript features
- Requires browser support for contenteditable and Selection API

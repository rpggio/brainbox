# TreeNote Web Component

A TipTap-based outliner web component that provides Logseq-style hierarchical note-taking.

## Features

- **Outliner-style editing**: Content organized in hierarchical nodes, not free-form text
- **Keyboard-driven**: Enter creates new nodes, Tab/Shift+Tab for indentation
- **Bullet markers**: Each node is marked with a bullet point
- **Basic markup support**: Bold, italic, code, and links
- **Unstyled**: Easy to customize with your own styles
- **Web standard**: Custom element following web component standards
- **TypeScript**: Fully typed for better development experience

## Installation

```bash
pnpm install
```

## Development

Start the development server with the test page:

```bash
pnpm dev
```

Then open http://localhost:5173 in your browser.

## Building

Build the component for production:

```bash
pnpm build
```

## Testing

Run tests with Vitest Browser Mode:

```bash
pnpm test
```

Run tests with UI:

```bash
pnpm test:ui
```

## Usage

### Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module" src="./dist/tree-note.js"></script>
</head>
<body>
  <tree-note></tree-note>
</body>
</html>
```

### With Initial Content

```html
<tree-note id="editor"></tree-note>

<script type="module">
  const editor = document.getElementById('editor');

  editor.setJSON({
    type: 'doc',
    content: [
      {
        type: 'outlineNode',
        attrs: { level: 0 },
        content: [{ type: 'text', text: 'First item' }]
      },
      {
        type: 'outlineNode',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'Nested item' }]
      }
    ]
  });
</script>
```

### Readonly Mode

```html
<tree-note readonly></tree-note>
```

### Listening to Events

```javascript
const editor = document.querySelector('tree-note');

editor.addEventListener('change', (e) => {
  console.log('Content changed:', e.detail.content);
});

editor.addEventListener('node-created', (e) => {
  console.log('Node created at position:', e.detail.position);
});

editor.addEventListener('node-indented', (e) => {
  console.log('Node indented to level:', e.detail.level);
});

editor.addEventListener('node-unindented', (e) => {
  console.log('Node unindented to level:', e.detail.level);
});
```

## API

See [API.md](./API.md) for the complete API specification.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Create a new node at the same indentation level |
| `Tab` | Indent the current node |
| `Shift+Tab` | Unindent the current node |
| `Backspace` (at start of empty node) | Delete node and merge with previous |

## Styling

The component is unstyled by default. You can add your own styles:

```css
tree-note {
  font-family: sans-serif;
  font-size: 14px;
  border: 1px solid #ccc;
  padding: 20px;
  min-height: 300px;
}
```

## Browser Support

- Modern browsers supporting Custom Elements v1
- ES2020+ JavaScript features
- Requires contenteditable and Selection API support

## License

MIT

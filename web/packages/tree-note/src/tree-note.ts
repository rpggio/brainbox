import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { OutlineNode } from './extensions/OutlineNode';
import { OutlineDocument } from './extensions/OutlineDocument';

export class TreeNoteElement extends HTMLElement {
  private editor: Editor | null = null;
  private editorContainer: HTMLDivElement | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.initEditor();
  }

  disconnectedCallback() {
    this.editor?.destroy();
  }

  private render() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
        }

        .tree-note-editor {
          width: 100%;
          height: 100%;
          outline: none;
        }

        .tree-note-editor [data-outline-node] {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin: 4px 0;
        }

        .tree-note-editor [data-outline-node] .outline-bullet {
          flex-shrink: 0;
          width: 16px;
          text-align: center;
          user-select: none;
          line-height: 1.5;
        }

        .tree-note-editor [data-outline-node] .outline-content {
          flex: 1;
          min-width: 0;
          line-height: 1.5;
        }

        .tree-note-editor [data-outline-node][data-level="0"] {
          padding-left: 0;
        }

        .tree-note-editor [data-outline-node][data-level="1"] {
          padding-left: 24px;
        }

        .tree-note-editor [data-outline-node][data-level="2"] {
          padding-left: 48px;
        }

        .tree-note-editor [data-outline-node][data-level="3"] {
          padding-left: 72px;
        }

        .tree-note-editor [data-outline-node][data-level="4"] {
          padding-left: 96px;
        }

        .tree-note-editor [data-outline-node][data-level="5"] {
          padding-left: 120px;
        }

        .tree-note-editor [data-outline-node][data-level="6"] {
          padding-left: 144px;
        }

        .tree-note-editor [data-outline-node][data-level="7"] {
          padding-left: 168px;
        }

        .tree-note-editor [data-outline-node][data-level="8"] {
          padding-left: 192px;
        }

        .tree-note-editor [data-outline-node][data-level="9"] {
          padding-left: 216px;
        }

        .tree-note-editor [data-outline-node][data-level="10"] {
          padding-left: 240px;
        }

        /* Basic text formatting */
        .tree-note-editor strong {
          font-weight: bold;
        }

        .tree-note-editor em {
          font-style: italic;
        }

        .tree-note-editor code {
          font-family: monospace;
          background: rgba(0, 0, 0, 0.05);
          padding: 2px 4px;
          border-radius: 3px;
        }

        .tree-note-editor a {
          color: blue;
          text-decoration: underline;
        }

        /* Focus styles */
        .tree-note-editor:focus {
          outline: none;
        }

        .tree-note-editor .ProseMirror:focus {
          outline: none;
        }
      </style>
      <div class="tree-note-editor"></div>
    `;

    this.editorContainer = this.shadowRoot.querySelector('.tree-note-editor');
  }

  private initEditor() {
    if (!this.editorContainer) return;

    const initialContent = this.getAttribute('initial-content');
    const isReadonly = this.hasAttribute('readonly');

    let content;
    if (initialContent) {
      try {
        content = JSON.parse(initialContent);
      } catch {
        content = {
          type: 'doc',
          content: [
            {
              type: 'outlineNode',
              attrs: { level: 0 },
              content: []
            }
          ]
        };
      }
    } else {
      content = {
        type: 'doc',
        content: [
          {
            type: 'outlineNode',
            attrs: { level: 0 },
            content: []
          }
        ]
      };
    }

    this.editor = new Editor({
      element: this.editorContainer,
      extensions: [
        OutlineDocument,
        OutlineNode,
        StarterKit.configure({
          document: false, // We're using our custom document
          paragraph: false, // We're using outline nodes instead
          heading: false,
          bulletList: false,
          orderedList: false,
          listItem: false,
          blockquote: false,
          horizontalRule: false,
          codeBlock: false,
          dropcursor: false,
        }),
      ],
      content,
      editable: !isReadonly,
      onUpdate: ({ editor }) => {
        this.dispatchEvent(new CustomEvent('change', {
          bubbles: true,
          composed: true,
          detail: {
            content: editor.getJSON(),
            markdown: this.toMarkdown(editor.getJSON())
          }
        }));
      },
    });

    // Forward node events from the editor DOM to the custom element
    this.editorContainer.addEventListener('node-created', (e) => {
      this.dispatchEvent(new CustomEvent('node-created', {
        bubbles: true,
        composed: true,
        detail: (e as CustomEvent).detail
      }));
    });

    this.editorContainer.addEventListener('node-indented', (e) => {
      this.dispatchEvent(new CustomEvent('node-indented', {
        bubbles: true,
        composed: true,
        detail: (e as CustomEvent).detail
      }));
    });

    this.editorContainer.addEventListener('node-unindented', (e) => {
      this.dispatchEvent(new CustomEvent('node-unindented', {
        bubbles: true,
        composed: true,
        detail: (e as CustomEvent).detail
      }));
    });

    // Handle clicks on empty space to create/focus nodes
    this.editorContainer.addEventListener('click', (e) => {
      if (!this.editor) return;

      const target = e.target as HTMLElement;

      // If clicking directly on the editor container (empty space), focus the last node
      if (target === this.editorContainer || target.classList.contains('ProseMirror')) {
        // Get the last position in the document
        const { doc } = this.editor.state;
        const lastPos = doc.content.size;

        // Focus at the end of the document
        this.editor.commands.focus(lastPos);

        // If clicking below all nodes, ensure there's a node to focus
        if (this.editorContainer) {
          const clickY = e.clientY;
          const editorRect = this.editorContainer.getBoundingClientRect();
          const nodes = this.editorContainer.querySelectorAll('[data-outline-node]');

          if (nodes.length > 0) {
            const lastNode = nodes[nodes.length - 1] as HTMLElement;
            const lastNodeRect = lastNode.getBoundingClientRect();

            // If click is below the last node, ensure cursor is at the end
            if (clickY > lastNodeRect.bottom) {
              this.editor.commands.focus('end');
            }
          }
        }
      }
    });
  }

  // Public API
  get content() {
    return this.editor?.getJSON() || null;
  }

  set content(value: any) {
    if (this.editor && value) {
      this.editor.commands.setContent(value);
    }
  }

  get markdown(): string {
    const json = this.editor?.getJSON();
    return json ? this.toMarkdown(json) : '';
  }

  set markdown(value: string) {
    if (this.editor && value) {
      const json = this.fromMarkdown(value);
      this.editor.commands.setContent(json);
    }
  }

  get readonly(): boolean {
    return !this.editor?.isEditable || false;
  }

  set readonly(value: boolean) {
    if (this.editor) {
      this.editor.setEditable(!value);
    }
  }

  focus() {
    this.editor?.commands.focus();
  }

  getJSON() {
    return this.editor?.getJSON() || null;
  }

  setJSON(content: any) {
    if (this.editor && content) {
      this.editor.commands.setContent(content);
    }
  }

  // Utility methods for markdown conversion
  private toMarkdown(json: any): string {
    if (!json || !json.content) return '';

    const lines: string[] = [];

    for (const node of json.content) {
      if (node.type === 'outlineNode') {
        const level = node.attrs?.level || 0;
        const indent = '  '.repeat(level);
        const text = this.nodeToText(node);
        lines.push(`${indent}- ${text}`);
      }
    }

    return lines.join('\n');
  }

  private nodeToText(node: any): string {
    if (!node.content) return '';

    let text = '';
    for (const child of node.content) {
      if (child.type === 'text') {
        let t = child.text;
        if (child.marks) {
          for (const mark of child.marks) {
            if (mark.type === 'bold') {
              t = `**${t}**`;
            } else if (mark.type === 'italic') {
              t = `*${t}*`;
            } else if (mark.type === 'code') {
              t = `\`${t}\``;
            }
          }
        }
        text += t;
      }
    }
    return text;
  }

  private fromMarkdown(markdown: string): any {
    const lines = markdown.split('\n');
    const content: any[] = [];

    for (const line of lines) {
      const match = line.match(/^(\s*)-\s+(.*)$/);
      if (match) {
        const indent = match[1];
        const text = match[2];
        const level = Math.floor(indent.length / 2);

        content.push({
          type: 'outlineNode',
          attrs: { level },
          content: this.parseTextWithMarks(text)
        });
      }
    }

    return {
      type: 'doc',
      content: content.length > 0 ? content : [
        { type: 'outlineNode', attrs: { level: 0 }, content: [] }
      ]
    };
  }

  private parseTextWithMarks(text: string): any[] {
    if (!text) return [];

    // Simple markdown parsing (bold, italic, code)
    const content: any[] = [];
    let current = text;

    // This is a simple implementation - in production, you'd want a proper markdown parser
    const segments = current.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/);

    for (const segment of segments) {
      if (!segment) continue;

      if (segment.startsWith('**') && segment.endsWith('**')) {
        content.push({
          type: 'text',
          text: segment.slice(2, -2),
          marks: [{ type: 'bold' }]
        });
      } else if (segment.startsWith('*') && segment.endsWith('*')) {
        content.push({
          type: 'text',
          text: segment.slice(1, -1),
          marks: [{ type: 'italic' }]
        });
      } else if (segment.startsWith('`') && segment.endsWith('`')) {
        content.push({
          type: 'text',
          text: segment.slice(1, -1),
          marks: [{ type: 'code' }]
        });
      } else {
        content.push({
          type: 'text',
          text: segment
        });
      }
    }

    return content;
  }

  // Observe attribute changes
  static get observedAttributes() {
    return ['readonly', 'initial-content'];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (!this.editor) return;

    if (name === 'readonly') {
      this.editor.setEditable(!this.hasAttribute('readonly'));
    } else if (name === 'initial-content' && newValue !== oldValue) {
      try {
        const content = JSON.parse(newValue);
        this.editor.commands.setContent(content);
      } catch {
        // Invalid JSON, ignore
      }
    }
  }
}

// Register the custom element
if (!customElements.get('tree-note')) {
  customElements.define('tree-note', TreeNoteElement);
}

export default TreeNoteElement;

import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Editor } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { RecordModel } from 'pocketbase';

@customElement('note-item')
export class NoteItem extends LitElement {
  @property({ type: Object }) note?: RecordModel;
  @property({ type: Number }) indent = 0;
  @state() private editor?: Editor;
  @state() private childNotes: RecordModel[] = [];

  static styles = css`
    :host {
      display: block;
      margin-left: calc(var(--indent, 0) * 24px);
    }

    .note-container {
      display: flex;
      align-items: flex-start;
      margin-bottom: 4px;
    }

    .bullet {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      margin-right: 4px;
      margin-top: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8px;
    }

    .bullet::before {
      content: '•';
      font-size: 20px;
    }

    .editor-container {
      flex: 1;
      min-height: 24px;
      outline: none;
      padding: 2px 4px;
      border-radius: 2px;
    }

    .editor-container:focus-within {
      background: #f0f0f0;
    }

    .ProseMirror {
      outline: none;
      min-height: 20px;
    }

    .ProseMirror p {
      margin: 0;
    }

    .children {
      margin-left: 0;
    }
  `;

  firstUpdated() {
    const editorEl = this.shadowRoot?.querySelector('.editor-container');
    if (!editorEl) return;

    this.editor = new Editor({
      element: editorEl as HTMLElement,
      extensions: [
        Document,
        Paragraph,
        Text,
      ],
      content: this.note?.content || '',
      editorProps: {
        attributes: {
          spellcheck: 'false',
        },
      },
      onUpdate: ({ editor }) => {
        this.handleContentUpdate(editor.getHTML());
      },
    });

    // Add keyboard event handlers
    this.setupKeyboardHandlers();
  }

  private setupKeyboardHandlers() {
    const editorEl = this.shadowRoot?.querySelector('.ProseMirror');
    if (!editorEl) return;

    let lastEnterTime = 0;

    editorEl.addEventListener('keydown', (e: Event) => {
      const event = e as KeyboardEvent;

      // Tab - create indented child note
      if (event.key === 'Tab') {
        event.preventDefault();
        this.dispatchEvent(new CustomEvent('create-child', {
          bubbles: true,
          composed: true,
          detail: { parentId: this.note?.id }
        }));
        return;
      }

      // Enter - handle double-enter for new sibling
      if (event.key === 'Enter') {
        const now = Date.now();
        const timeSinceLastEnter = now - lastEnterTime;

        // Double enter (within 500ms) - create sibling note
        if (timeSinceLastEnter < 500 && timeSinceLastEnter > 0) {
          event.preventDefault();
          lastEnterTime = 0; // Reset

          this.dispatchEvent(new CustomEvent('create-sibling', {
            bubbles: true,
            composed: true,
            detail: {
              afterId: this.note?.id,
              parentId: this.note?.parent
            }
          }));
          return;
        }

        lastEnterTime = now;
        // Single enter - let TipTap handle normally (new line within note)
      }
    });
  }

  private handleContentUpdate(content: string) {
    this.dispatchEvent(new CustomEvent('content-changed', {
      bubbles: true,
      composed: true,
      detail: { id: this.note?.id, content }
    }));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.editor?.destroy();
  }

  render() {
    return html`
      <div class="note-container">
        <div class="bullet"></div>
        <div class="editor-container"></div>
      </div>
      ${this.childNotes.length > 0 ? html`
        <div class="children">
          ${this.childNotes.map(child => html`
            <note-item .note=${child} .indent=${this.indent + 1}></note-item>
          `)}
        </div>
      ` : ''}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'note-item': NoteItem;
  }
}

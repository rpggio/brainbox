import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import PocketBase, { RecordModel } from 'pocketbase';
import './note-item';

interface Note extends RecordModel {
  content: string;
  parent: string;
  order: number;
}

@customElement('notes-app')
export class NotesApp extends LitElement {
  private pb: PocketBase;
  @state() private notes: Note[] = [];
  @state() private noteTree: Map<string, Note[]> = new Map();

  static styles = css`
    :host {
      display: block;
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    h1 {
      margin-bottom: 20px;
      font-size: 24px;
    }

    .notes-container {
      padding: 10px;
    }

    .add-note-btn {
      margin-top: 10px;
      padding: 8px 16px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .add-note-btn:hover {
      background: #0056b3;
    }

    .info {
      margin-top: 20px;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 4px;
      font-size: 14px;
      color: #666;
    }

    .info ul {
      margin: 8px 0;
      padding-left: 20px;
    }
  `;

  constructor() {
    super();
    this.pb = new PocketBase('http://127.0.0.1:8090');
    this.loadNotes();
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('content-changed', this.handleContentChanged as EventListener);
    this.addEventListener('create-child', this.handleCreateChild as EventListener);
    this.addEventListener('create-sibling', this.handleCreateSibling as EventListener);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('content-changed', this.handleContentChanged as EventListener);
    this.removeEventListener('create-child', this.handleCreateChild as EventListener);
    this.removeEventListener('create-sibling', this.handleCreateSibling as EventListener);
  }

  private async loadNotes() {
    try {
      const records = await this.pb.collection('notes').getFullList<Note>({
        sort: 'order',
      });
      this.notes = records;
      this.buildNoteTree();
    } catch (error) {
      console.error('Failed to load notes:', error);
      this.notes = [];
    }
  }

  private buildNoteTree() {
    this.noteTree = new Map();

    // Group notes by parent
    for (const note of this.notes) {
      const parentId = note.parent || 'root';
      if (!this.noteTree.has(parentId)) {
        this.noteTree.set(parentId, []);
      }
      this.noteTree.get(parentId)!.push(note);
    }

    // Sort each group by order
    for (const [_, children] of this.noteTree) {
      children.sort((a, b) => a.order - b.order);
    }

    this.requestUpdate();
  }

  private handleContentChanged = async (e: CustomEvent) => {
    const { id, content } = e.detail;
    try {
      await this.pb.collection('notes').update(id, { content });
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  private handleCreateChild = async (e: CustomEvent) => {
    const { parentId } = e.detail;
    const siblings = this.noteTree.get(parentId) || [];
    const order = siblings.length;

    try {
      const newNote = await this.pb.collection('notes').create<Note>({
        content: '',
        parent: parentId,
        order,
      });

      this.notes.push(newNote);
      this.buildNoteTree();

      // Focus the new note
      await this.updateComplete;
      this.focusNote(newNote.id);
    } catch (error) {
      console.error('Failed to create child note:', error);
    }
  };

  private handleCreateSibling = async (e: CustomEvent) => {
    const { afterId, parentId } = e.detail;

    const siblings = this.noteTree.get(parentId || 'root') || [];
    const afterIndex = siblings.findIndex(n => n.id === afterId);
    const order = afterIndex >= 0 ? siblings[afterIndex].order + 1 : siblings.length;

    // Increment order of subsequent siblings
    for (let i = afterIndex + 1; i < siblings.length; i++) {
      const sibling = siblings[i];
      try {
        await this.pb.collection('notes').update(sibling.id, {
          order: sibling.order + 1
        });
        sibling.order += 1;
      } catch (error) {
        console.error('Failed to update sibling order:', error);
      }
    }

    try {
      const newNote = await this.pb.collection('notes').create<Note>({
        content: '',
        parent: parentId || '',
        order,
      });

      this.notes.push(newNote);
      this.buildNoteTree();

      // Focus the new note
      await this.updateComplete;
      this.focusNote(newNote.id);
    } catch (error) {
      console.error('Failed to create sibling note:', error);
    }
  };

  private focusNote(noteId: string) {
    // Find the note-item component and focus its editor
    const findNoteItem = (el: Element): Element | null => {
      if (el.tagName === 'NOTE-ITEM' && (el as any).note?.id === noteId) {
        return el;
      }
      for (const child of Array.from(el.children)) {
        const found = findNoteItem(child);
        if (found) return found;
      }
      return null;
    };

    const noteItem = findNoteItem(this);
    if (noteItem) {
      const editorEl = noteItem.shadowRoot?.querySelector('.ProseMirror');
      if (editorEl) {
        (editorEl as HTMLElement).focus();
      }
    }
  }

  private async addRootNote() {
    const rootNotes = this.noteTree.get('root') || [];
    const order = rootNotes.length;

    try {
      const newNote = await this.pb.collection('notes').create<Note>({
        content: '',
        parent: '',
        order,
      });

      this.notes.push(newNote);
      this.buildNoteTree();

      await this.updateComplete;
      this.focusNote(newNote.id);
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  }

  private renderNoteTree(parentId: string = 'root', indent: number = 0): any {
    const children = this.noteTree.get(parentId) || [];
    return children.map(note => html`
      <note-item
        .note=${note}
        .indent=${indent}
      ></note-item>
      ${this.renderNoteTree(note.id, indent + 1)}
    `);
  }

  render() {
    return html`
      <h1>Notes</h1>
      <div class="notes-container">
        ${this.renderNoteTree()}
      </div>
      <button class="add-note-btn" @click=${this.addRootNote}>
        Add Note
      </button>
      <div class="info">
        <strong>Keyboard shortcuts:</strong>
        <ul>
          <li><strong>Enter</strong> - New line within note</li>
          <li><strong>Enter + Enter</strong> - Create new sibling note</li>
          <li><strong>Tab</strong> - Create indented child note</li>
        </ul>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'notes-app': NotesApp;
  }
}

import { Node, mergeAttributes } from '@tiptap/core';

export interface OutlineNodeOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    outlineNode: {
      setOutlineNode: () => ReturnType;
      indent: () => ReturnType;
      unindent: () => ReturnType;
    };
  }
}

export const OutlineNode = Node.create<OutlineNodeOptions>({
  name: 'outlineNode',

  group: 'block',

  content: 'inline*',

  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      level: {
        default: 0,
        parseHTML: element => {
          const level = element.getAttribute('data-level');
          return level ? parseInt(level, 10) : 0;
        },
        renderHTML: attributes => {
          return {
            'data-level': attributes.level,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-outline-node]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-outline-node': '',
      }),
      ['span', { class: 'outline-bullet', contenteditable: 'false' }, '•'],
      ['div', { class: 'outline-content' }, 0],
    ];
  },

  addKeyboardShortcuts() {
    return {
      Enter: () => {
        const { state, dispatch } = this.editor.view;
        const { $from } = state.selection;

        // Check if we're in an outline node
        if ($from.parent.type.name !== this.name) {
          return false;
        }

        // Get current node's level
        const currentLevel = $from.parent.attrs.level || 0;

        // Create a new outline node at the same level
        const transaction = state.tr.split(state.selection.to);

        // Set the level attribute on the new node
        const newNodePos = transaction.selection.$from.before();
        transaction.setNodeMarkup(newNodePos, null, { level: currentLevel });

        dispatch(transaction);

        // Emit custom event
        this.editor.view.dom.dispatchEvent(new CustomEvent('node-created', {
          bubbles: true,
          detail: { position: newNodePos }
        }));

        return true;
      },

      Tab: () => {
        return this.editor.commands.indent();
      },

      'Shift-Tab': () => {
        return this.editor.commands.unindent();
      },

      Backspace: () => {
        const { state, dispatch } = this.editor.view;
        const { $from, empty } = state.selection;

        // Only handle if we're at the start of the node and it's empty
        if (!empty || $from.parentOffset !== 0) {
          return false;
        }

        // Check if we're in an outline node
        if ($from.parent.type.name !== this.name) {
          return false;
        }

        // If the node is empty, delete it
        if ($from.parent.content.size === 0) {
          const transaction = state.tr.delete(
            $from.before(),
            $from.after()
          );
          dispatch(transaction);
          return true;
        }

        return false;
      },
    };
  },

  addCommands() {
    return {
      setOutlineNode: () => ({ commands }) => {
        return commands.setNode(this.name);
      },

      indent: () => ({ state, dispatch, chain }) => {
        const { $from } = state.selection;

        if ($from.parent.type.name !== this.name) {
          return false;
        }

        const currentLevel = $from.parent.attrs.level || 0;
        const newLevel = Math.min(currentLevel + 1, 10); // Max 10 levels

        const transaction = state.tr.setNodeMarkup(
          $from.before(),
          null,
          { level: newLevel }
        );

        if (dispatch) {
          dispatch(transaction);

          // Emit custom event
          this.editor.view.dom.dispatchEvent(new CustomEvent('node-indented', {
            bubbles: true,
            detail: { position: $from.before(), level: newLevel }
          }));
        }

        return true;
      },

      unindent: () => ({ state, dispatch }) => {
        const { $from } = state.selection;

        if ($from.parent.type.name !== this.name) {
          return false;
        }

        const currentLevel = $from.parent.attrs.level || 0;

        if (currentLevel === 0) {
          return false;
        }

        const newLevel = Math.max(currentLevel - 1, 0);

        const transaction = state.tr.setNodeMarkup(
          $from.before(),
          null,
          { level: newLevel }
        );

        if (dispatch) {
          dispatch(transaction);

          // Emit custom event
          this.editor.view.dom.dispatchEvent(new CustomEvent('node-unindented', {
            bubbles: true,
            detail: { position: $from.before(), level: newLevel }
          }));
        }

        return true;
      },
    };
  },
});

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { userEvent } from '@vitest/browser/context';
import '../tree-note';

describe('TreeNote Web Component', () => {
  let editor: HTMLElement;

  beforeEach(async () => {
    // Clear the body
    document.body.innerHTML = '';

    // Create a new tree-note element
    editor = document.createElement('tree-note');
    document.body.appendChild(editor);

    // Wait for the component to be fully initialized
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Component Initialization', () => {
    it('should create a custom element', () => {
      expect(editor).toBeTruthy();
      expect(editor.tagName).toBe('TREE-NOTE');
    });

    it('should have a shadow root', () => {
      expect(editor.shadowRoot).toBeTruthy();
    });

    it('should initialize with one empty node', async () => {
      const shadowRoot = editor.shadowRoot!;
      const nodes = shadowRoot.querySelectorAll('[data-outline-node]');
      expect(nodes.length).toBeGreaterThan(0);
    });

    it('should have a bullet in each node', async () => {
      const shadowRoot = editor.shadowRoot!;
      const bullets = shadowRoot.querySelectorAll('.outline-bullet');
      expect(bullets.length).toBeGreaterThan(0);
      expect(bullets[0].textContent).toBe('•');
    });
  });

  describe('Node Creation', () => {
    it('should create a new node when Enter is pressed', async () => {
      const shadowRoot = editor.shadowRoot!;
      const editorEl = shadowRoot.querySelector('.tree-note-editor') as HTMLElement;

      // Focus the editor
      editorEl.focus();
      await new Promise(resolve => setTimeout(resolve, 50));

      // Get initial node count
      const initialNodes = shadowRoot.querySelectorAll('[data-outline-node]').length;

      // Press Enter
      await userEvent.keyboard('{Enter}');
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check that a new node was created
      const finalNodes = shadowRoot.querySelectorAll('[data-outline-node]').length;
      expect(finalNodes).toBe(initialNodes + 1);
    });

    it('should emit node-created event when Enter is pressed', async () => {
      const shadowRoot = editor.shadowRoot!;
      const editorEl = shadowRoot.querySelector('.tree-note-editor') as HTMLElement;

      let eventFired = false;
      editor.addEventListener('node-created', () => {
        eventFired = true;
      });

      editorEl.focus();
      await new Promise(resolve => setTimeout(resolve, 50));

      await userEvent.keyboard('{Enter}');
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(eventFired).toBe(true);
    });

    it('should create new node at same indentation level', async () => {
      const shadowRoot = editor.shadowRoot!;
      const editorEl = shadowRoot.querySelector('.tree-note-editor') as HTMLElement;

      editorEl.focus();
      await new Promise(resolve => setTimeout(resolve, 50));

      // Indent first node
      await userEvent.keyboard('{Tab}');
      await new Promise(resolve => setTimeout(resolve, 50));

      const firstNode = shadowRoot.querySelector('[data-outline-node]');
      const firstLevel = firstNode?.getAttribute('data-level');

      // Press Enter to create new node
      await userEvent.keyboard('{Enter}');
      await new Promise(resolve => setTimeout(resolve, 100));

      const nodes = shadowRoot.querySelectorAll('[data-outline-node]');
      const secondNode = nodes[1];
      const secondLevel = secondNode?.getAttribute('data-level');

      expect(firstLevel).toBe(secondLevel);
    });
  });

  describe('Indentation', () => {
    it('should indent node when Tab is pressed', async () => {
      const shadowRoot = editor.shadowRoot!;
      const editorEl = shadowRoot.querySelector('.tree-note-editor') as HTMLElement;

      editorEl.focus();
      await new Promise(resolve => setTimeout(resolve, 50));

      const node = shadowRoot.querySelector('[data-outline-node]');
      const initialLevel = node?.getAttribute('data-level');

      await userEvent.keyboard('{Tab}');
      await new Promise(resolve => setTimeout(resolve, 100));

      const newLevel = node?.getAttribute('data-level');
      expect(parseInt(newLevel || '0')).toBe(parseInt(initialLevel || '0') + 1);
    });

    it('should emit node-indented event when Tab is pressed', async () => {
      const shadowRoot = editor.shadowRoot!;
      const editorEl = shadowRoot.querySelector('.tree-note-editor') as HTMLElement;

      let eventFired = false;
      let eventLevel = -1;

      editor.addEventListener('node-indented', (e) => {
        eventFired = true;
        eventLevel = (e as CustomEvent).detail.level;
      });

      editorEl.focus();
      await new Promise(resolve => setTimeout(resolve, 50));

      await userEvent.keyboard('{Tab}');
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(eventFired).toBe(true);
      expect(eventLevel).toBe(1);
    });

    it('should update padding-left when indented', async () => {
      const shadowRoot = editor.shadowRoot!;
      const editorEl = shadowRoot.querySelector('.tree-note-editor') as HTMLElement;

      editorEl.focus();
      await new Promise(resolve => setTimeout(resolve, 50));

      const node = shadowRoot.querySelector('[data-outline-node]') as HTMLElement;
      const initialPadding = getComputedStyle(node).paddingLeft;

      await userEvent.keyboard('{Tab}');
      await new Promise(resolve => setTimeout(resolve, 100));

      const newPadding = getComputedStyle(node).paddingLeft;
      expect(newPadding).not.toBe(initialPadding);
    });
  });

  describe('Unindentation', () => {
    it('should unindent node when Shift+Tab is pressed', async () => {
      const shadowRoot = editor.shadowRoot!;
      const editorEl = shadowRoot.querySelector('.tree-note-editor') as HTMLElement;

      editorEl.focus();
      await new Promise(resolve => setTimeout(resolve, 50));

      // First indent
      await userEvent.keyboard('{Tab}');
      await new Promise(resolve => setTimeout(resolve, 50));

      const node = shadowRoot.querySelector('[data-outline-node]');
      const indentedLevel = node?.getAttribute('data-level');

      // Then unindent
      await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
      await new Promise(resolve => setTimeout(resolve, 100));

      const finalLevel = node?.getAttribute('data-level');
      expect(parseInt(finalLevel || '0')).toBe(parseInt(indentedLevel || '0') - 1);
    });

    it('should emit node-unindented event when Shift+Tab is pressed', async () => {
      const shadowRoot = editor.shadowRoot!;
      const editorEl = shadowRoot.querySelector('.tree-note-editor') as HTMLElement;

      let eventFired = false;

      editor.addEventListener('node-unindented', () => {
        eventFired = true;
      });

      editorEl.focus();
      await new Promise(resolve => setTimeout(resolve, 50));

      // First indent
      await userEvent.keyboard('{Tab}');
      await new Promise(resolve => setTimeout(resolve, 50));

      // Then unindent
      await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(eventFired).toBe(true);
    });

    it('should not unindent below level 0', async () => {
      const shadowRoot = editor.shadowRoot!;
      const editorEl = shadowRoot.querySelector('.tree-note-editor') as HTMLElement;

      editorEl.focus();
      await new Promise(resolve => setTimeout(resolve, 50));

      const node = shadowRoot.querySelector('[data-outline-node]');

      // Try to unindent when already at level 0
      await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
      await new Promise(resolve => setTimeout(resolve, 100));

      const level = node?.getAttribute('data-level');
      expect(level).toBe('0');
    });
  });

  describe('Text Input', () => {
    it('should accept text input', async () => {
      const shadowRoot = editor.shadowRoot!;
      const editorEl = shadowRoot.querySelector('.tree-note-editor') as HTMLElement;

      editorEl.focus();
      await new Promise(resolve => setTimeout(resolve, 50));

      await userEvent.keyboard('Hello World');
      await new Promise(resolve => setTimeout(resolve, 100));

      const content = shadowRoot.querySelector('.outline-content');
      expect(content?.textContent).toContain('Hello World');
    });

    it('should handle multiple lines of text', async () => {
      const shadowRoot = editor.shadowRoot!;
      const editorEl = shadowRoot.querySelector('.tree-note-editor') as HTMLElement;

      editorEl.focus();
      await new Promise(resolve => setTimeout(resolve, 50));

      await userEvent.keyboard('First line');
      await userEvent.keyboard('{Enter}');
      await new Promise(resolve => setTimeout(resolve, 50));
      await userEvent.keyboard('Second line');
      await new Promise(resolve => setTimeout(resolve, 100));

      const nodes = shadowRoot.querySelectorAll('[data-outline-node]');
      expect(nodes.length).toBe(2);
    });
  });

  describe('Public API', () => {
    it('should expose getJSON method', () => {
      expect(typeof (editor as any).getJSON).toBe('function');
    });

    it('should expose setJSON method', () => {
      expect(typeof (editor as any).setJSON).toBe('function');
    });

    it('should expose focus method', () => {
      expect(typeof (editor as any).focus).toBe('function');
    });

    it('should get and set content via content property', () => {
      const testContent = {
        type: 'doc',
        content: [
          {
            type: 'outlineNode',
            attrs: { level: 0 },
            content: [{ type: 'text', text: 'Test' }]
          }
        ]
      };

      (editor as any).content = testContent;
      const retrievedContent = (editor as any).content;

      expect(retrievedContent).toBeTruthy();
      expect(retrievedContent.type).toBe('doc');
    });

    it('should get and set markdown property', async () => {
      (editor as any).markdown = '- First item\n  - Nested item';
      await new Promise(resolve => setTimeout(resolve, 100));

      const markdown = (editor as any).markdown;
      expect(markdown).toContain('First item');
      expect(markdown).toContain('Nested item');
    });

    it('should handle readonly property', () => {
      (editor as any).readonly = true;
      expect((editor as any).readonly).toBe(true);

      (editor as any).readonly = false;
      expect((editor as any).readonly).toBe(false);
    });
  });

  describe('Events', () => {
    it('should emit change event on content modification', async () => {
      const shadowRoot = editor.shadowRoot!;
      const editorEl = shadowRoot.querySelector('.tree-note-editor') as HTMLElement;

      let changeEventFired = false;

      editor.addEventListener('change', () => {
        changeEventFired = true;
      });

      editorEl.focus();
      await new Promise(resolve => setTimeout(resolve, 50));

      await userEvent.keyboard('Test');
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(changeEventFired).toBe(true);
    });

    it('should include content in change event detail', async () => {
      const shadowRoot = editor.shadowRoot!;
      const editorEl = shadowRoot.querySelector('.tree-note-editor') as HTMLElement;

      let eventContent: any = null;

      editor.addEventListener('change', (e) => {
        eventContent = (e as CustomEvent).detail.content;
      });

      editorEl.focus();
      await new Promise(resolve => setTimeout(resolve, 50));

      await userEvent.keyboard('Test');
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(eventContent).toBeTruthy();
      expect(eventContent.type).toBe('doc');
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle creating multiple nested nodes', async () => {
      const shadowRoot = editor.shadowRoot!;
      const editorEl = shadowRoot.querySelector('.tree-note-editor') as HTMLElement;

      editorEl.focus();
      await new Promise(resolve => setTimeout(resolve, 50));

      // Create first node
      await userEvent.keyboard('Level 0');
      await userEvent.keyboard('{Enter}');
      await new Promise(resolve => setTimeout(resolve, 50));

      // Create indented node
      await userEvent.keyboard('{Tab}');
      await userEvent.keyboard('Level 1');
      await userEvent.keyboard('{Enter}');
      await new Promise(resolve => setTimeout(resolve, 50));

      // Create another indented node
      await userEvent.keyboard('{Tab}');
      await userEvent.keyboard('Level 2');
      await new Promise(resolve => setTimeout(resolve, 100));

      const nodes = shadowRoot.querySelectorAll('[data-outline-node]');
      expect(nodes.length).toBe(3);

      const levels = Array.from(nodes).map(n => n.getAttribute('data-level'));
      expect(levels).toEqual(['0', '1', '2']);
    });

    it('should maintain structure after multiple edits', async () => {
      const shadowRoot = editor.shadowRoot!;
      const editorEl = shadowRoot.querySelector('.tree-note-editor') as HTMLElement;

      editorEl.focus();
      await new Promise(resolve => setTimeout(resolve, 50));

      // Create a structure
      await userEvent.keyboard('First');
      await userEvent.keyboard('{Enter}');
      await userEvent.keyboard('{Tab}');
      await userEvent.keyboard('Second');
      await userEvent.keyboard('{Enter}');
      await userEvent.keyboard('Third');
      await userEvent.keyboard('{Enter}');
      await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
      await userEvent.keyboard('Fourth');
      await new Promise(resolve => setTimeout(resolve, 100));

      const nodes = shadowRoot.querySelectorAll('[data-outline-node]');
      expect(nodes.length).toBe(4);

      // Verify the structure
      const levels = Array.from(nodes).map(n => n.getAttribute('data-level'));
      expect(levels[0]).toBe('0'); // First
      expect(levels[1]).toBe('1'); // Second (indented)
      expect(levels[2]).toBe('1'); // Third (same level)
      expect(levels[3]).toBe('0'); // Fourth (unindented)
    });
  });

  describe('DOM Position Verification', () => {
    it('should position bullets correctly', async () => {
      const shadowRoot = editor.shadowRoot!;
      const bullet = shadowRoot.querySelector('.outline-bullet') as HTMLElement;

      expect(bullet).toBeTruthy();

      const bulletRect = bullet.getBoundingClientRect();
      expect(bulletRect.width).toBeGreaterThan(0);
      expect(bulletRect.height).toBeGreaterThan(0);
    });

    it('should position content containers correctly relative to bullets', async () => {
      const shadowRoot = editor.shadowRoot!;
      const node = shadowRoot.querySelector('[data-outline-node]') as HTMLElement;
      const bullet = node.querySelector('.outline-bullet') as HTMLElement;
      const content = node.querySelector('.outline-content') as HTMLElement;

      const bulletRect = bullet.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();

      // Content should be to the right of bullet
      expect(contentRect.left).toBeGreaterThan(bulletRect.left);
    });

    it('should have correct vertical spacing between nodes', async () => {
      const shadowRoot = editor.shadowRoot!;
      const editorEl = shadowRoot.querySelector('.tree-note-editor') as HTMLElement;

      editorEl.focus();
      await new Promise(resolve => setTimeout(resolve, 50));

      // Create multiple nodes
      await userEvent.keyboard('First');
      await userEvent.keyboard('{Enter}');
      await userEvent.keyboard('Second');
      await userEvent.keyboard('{Enter}');
      await userEvent.keyboard('Third');
      await new Promise(resolve => setTimeout(resolve, 100));

      const nodes = shadowRoot.querySelectorAll('[data-outline-node]');
      expect(nodes.length).toBe(3);

      const firstRect = (nodes[0] as HTMLElement).getBoundingClientRect();
      const secondRect = (nodes[1] as HTMLElement).getBoundingClientRect();

      // Second node should be below first node
      expect(secondRect.top).toBeGreaterThan(firstRect.top);
    });
  });
});

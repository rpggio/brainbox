import { Node } from '@tiptap/core';

export const OutlineDocument = Node.create({
  name: 'doc',
  topNode: true,
  content: 'outlineNode+',
});

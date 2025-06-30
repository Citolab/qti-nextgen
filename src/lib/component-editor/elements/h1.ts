import type { MyModuleInterface } from '../../component-editor';
import {
  deleteContentsLikeWord,
  insertParagraphForElementNode,
  insertParagraphForTextNode,
  insertTextInElementNode,
  replaceElement
} from '../components/utilities';

const MODULE: MyModuleInterface = {
  identifier: 'h1',
  create: (range, data) => {
    if (range.collapsed || range.startContainer == range.endContainer) {
      replaceElement(range, range.startContainer.parentElement, 'h1');
      return {
        startContainer: range.startContainer,
        startOffset: range.startOffset,
        endContainer: range.endContainer,
        endOffset: range.endOffset,
        collapsed: true
      };
    }
  },
  mutateRemoved: el => {
    console.log('H1 removed hook', el);
    return null;
  },
  mutateAdded: el => {
    if (el.childNodes.length === 0) {
      // el.appendChild(el.ownerDocument.createElement('br'));
    }
    return null;
  },
  mutateEmpty: (el: Element): StaticRange => {
    console.log('H1 empty hook', el);
    const p = el.ownerDocument.createElement('p');
    // p.appendChild(el.ownerDocument.createElement('br'));
    el.replaceWith(p);
    return null;
  },
  insertText: (range: Range, data): StaticRange => {
    return insertTextInElementNode(range.startContainer as HTMLElement, data);
  },
  insertParagraph: (range): StaticRange => {
    // Delete contents if range isn't collapsed
    if (!range.collapsed) {
      return deleteContentsLikeWord(range);
    }

    const { startContainer: sc, startOffset: so } = range;

    // Handle different node types with ternary/short-circuit operator
    return sc.nodeType === Node.TEXT_NODE
      ? insertParagraphForTextNode(range, sc as Text, so)
      : sc.nodeType === Node.ELEMENT_NODE
        ? insertParagraphForElementNode(range, sc as HTMLElement, 'p')
        : (console.error('Unsupported node type:', sc?.nodeType), null);
  }
};

export const { identifier, style, create, mutateRemoved, mutateAdded, mutateEmpty, insertText, insertParagraph } = MODULE;

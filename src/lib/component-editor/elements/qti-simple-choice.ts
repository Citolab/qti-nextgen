import { MyModuleInterface } from '@editor/content';
import {
  deleteContentsLikeWord,
  insertParagraphForElementNode,
  insertParagraphForTextNode
} from '../../component-editor/components/utilities';

const MODULE: MyModuleInterface = {
  identifier: 'qti-simple-choice',
  style: `qti-simple-choice:empty:after {
    color:gray;
    font-style: italic;
    content: 'afleider';
  }`,
  mutateRemoved: (el: HTMLElement | Node) => {
    return null;
  },
  mutateAdded: el => {
    if (el.childNodes.length === 0) {
      el.appendChild(el.ownerDocument.createElementNS(null,'br'));
    }
    return null;
  },
  mutateEmpty: el => {
    if (el.childNodes.length === 0) {
      el.appendChild(el.ownerDocument.createElementNS(null,'br'));
    }
    return null;
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

export const { identifier, style, insertParagraph } = MODULE;

import type { MyModuleInterface } from '../../component-editor';
import {
  deleteContentsLikeWord,
  insertParagraphForElementNode,
  insertParagraphForTextNode,
  insertTextInElementNode
} from '../components/utilities';

const MODULE: MyModuleInterface = {
  identifier: 'p',
  create: (range): StaticRange => {
    if (range.collapsed || range.startContainer == range.endContainer) {
      // replaceElement(range, getUpperParent(range), 'p');
      return {
        startContainer: range.startContainer,
        startOffset: range.startOffset,
        endContainer: range.endContainer,
        endOffset: range.endOffset,
        collapsed: range.collapsed
      } as StaticRange;
    }
  },
  key: { modifier: 'cmd', key: 'p' },
  // style: `p {
  // background-color: #f0f0f0;
  // padding: 8px;
  // border-radius: 5px;
  // }`,
  mutateRemoved: el => {
    // console.log('P removed hook', el);
    return null;
  },
  mutateAdded: el => {
    // console.log('P added hook', el);
    // if (el.childNodes.length === 0) {
    //   el.appendChild(el.ownerDocument.createElementNS(null,'br'));
    // }
    return null;
  },
  mutateEmpty: el => {
    // console.log(el, 'P empty hook');
    // if (el.childNodes.length === 0) {
    //   el.appendChild(el.ownerDocument.createElementNS(null,'br'));
    // }
    return {
      startContainer: el,
      startOffset: 0,
      collapsed: true,
      endContainer: el,
      endOffset: 0
    };
  },
  insertText: (range: Range, data): StaticRange => {
    return insertTextInElementNode(range.startContainer as HTMLElement, data);
  },
  deleteContentBackward: (range): StaticRange => {
    let cp: StaticRange;
    cp = deleteContentsLikeWord(range);
    return cp;
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

export const {
  identifier,
  style,
  create,
  mutateRemoved,
  mutateAdded,
  mutateEmpty,
  insertText,
  deleteContentBackward,
  insertParagraph
} = MODULE;

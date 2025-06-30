import { MyModuleInterface } from '@editor/content';
import {
  createBrTagIfNecessary,
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
      el.appendChild(el.ownerDocument.createElement('br'));
    }
    return null;
  },
  mutateEmpty: el => {
    if (el.childNodes.length === 0) {
      el.appendChild(el.ownerDocument.createElement('br'));
    }
    return null;
  },
  insertParagraph: (range): StaticRange => {
    let cp: StaticRange;
    if (!range.collapsed) {
      deleteContentsLikeWord(range);
    }

    if (range.collapsed) {
      const { startContainer: sc, startOffset: so } = range;

      switch (sc?.nodeType) {
        case Node.TEXT_NODE:
          cp = insertParagraphForTextNode(range, sc as Text, so);
          break;

        case Node.ELEMENT_NODE:
          cp = insertParagraphForElementNode(range, sc as HTMLElement);
          break;

        default:
          console.error('Unsupported node type:', sc?.nodeType);
          break;
      }
    }
    createBrTagIfNecessary(cp);
    return cp;
  }
};

export const { identifier, style } = MODULE;

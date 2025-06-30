import { deleteContentsLikeWord } from "../components/utilities";

export const xmlRootNodeName = 'this-is-the-root-tag';

const MODULE = {
  identifier: xmlRootNodeName,
  insertText: (range, data) => {
    throw new Error(`insertParagraph can not be called on the root element.`);
  },
  deleteContentBackward: (range, data) => {
    let cp: StaticRange;
    cp = deleteContentsLikeWord(range);
    return cp;
  },
  insertParagraph: (range, data) => {
    throw new Error(`insertParagraph can not be called on the root element.`);
  }
};

export const {
  identifier,
  insertText,
  deleteContentBackward,
  insertParagraph
} = MODULE;

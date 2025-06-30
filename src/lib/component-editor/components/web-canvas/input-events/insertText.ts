import { IInputEvent } from '.';
import { deleteContentsLikeWord, insertTextInTextNode } from '../../utilities';

export const insertText: IInputEvent<string> = async (elMap, range, data) => {
  const { startContainer: sc, startOffset: so } = range;

  // Delete content if range is not collapsed
  if (!range.collapsed) deleteContentsLikeWord(range);

  // Handle insertion based on node type
  if (sc?.nodeType === Node.TEXT_NODE) {
    return Promise.resolve(insertTextInTextNode(sc as Text, so, data));
  }

  if (sc?.nodeType === Node.ELEMENT_NODE) {
    const commonAncestorName = range.commonAncestorContainer.nodeName.toLowerCase();
    const elementModule = elMap.get(commonAncestorName);

    if (elementModule?.insertText) {
      return Promise.resolve(elementModule.insertText(range, data));
    }

    throw new Error(`No insertText hook found for element: ${commonAncestorName}`);
  }

  // Return an empty promise in case of unsupported node type
  return Promise.reject(new Error('Unsupported node type.'));
};



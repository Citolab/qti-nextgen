import { IInputEvent } from '.';

function getDeletionKind(range) {
  const { startContainer, startOffset, endContainer, endOffset } = range;

  // 2a: inside a single Text node
  if (startContainer.nodeType === Node.TEXT_NODE && startContainer === endContainer) {
    return 'insideText'; // case 2a
  }

  // 2b: at boundary (end of one text, start of next)
  if (
    startContainer !== endContainer &&
    endContainer.nodeType === Node.ELEMENT_NODE &&
    startContainer.nodeType === Node.TEXT_NODE
  ) {
    return 'boundaryMerge'; // case 2b
  }

  // 2c: everything else → atomic element deletion
  return 'atomic'; // case 2c
}

export const deleteContentBackward: IInputEvent<string> = async (elMap, range, data): Promise<StaticRange> => {
  const kind = getDeletionKind(range);

  switch (kind) {
    case 'insideText': // 2a
      // delete one character/grapheme in a text node
      console.log('Handling 2a: delete within text');

      range.deleteContents(); // this will delete the text in the range
      return range;

      break;

    case 'boundaryMerge': // 2b
      // merge blocks: pull nextNode’s text up, remove its element

      const ec = range.endContainer as HTMLElement;
      const sc = range.startContainer as Text;

      const length = sc.textContent?.length || 0;

      sc.textContent = sc.textContent + ec.textContent;
      ec.remove();

      return {
        startContainer: sc,
        endContainer: sc,
        startOffset: length,
        endOffset: length,
        collapsed: true
      } as StaticRange;

      break;

    case 'atomic': // 2c
      // remove the single atomic element (img, hr, etc)
      console.log('Handling 2c: delete atomic element');
      break;

    default:
      console.warn('Unknown deletion case', kind);
  }

  throw new Error('Unsupported startContainer for deleteContentBackward');
};

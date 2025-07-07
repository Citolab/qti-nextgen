import { IInputEvent } from '.';

export const deleteContentBackward: IInputEvent<string> = async (elMap, range, data): Promise<StaticRange> => {
  if (range.startContainer !== range.endContainer) {
    const text = range.endContainer.innerText;

    const length = range.startContainer.textContent?.length || 0;

    range.startContainer.textContent = range.startContainer.textContent + range.endContainer.textContent;
    range.endContainer.remove();

    return {
      startContainer: range.startContainer,
      endContainer: range.startContainer,
      startOffset: length,
      endOffset: length,
      collapsed: true
    } as StaticRange;
  } else {
    range.deleteContents();
    return range;
  }

  throw new Error('Unsupported startContainer for deleteContentBackward');
};

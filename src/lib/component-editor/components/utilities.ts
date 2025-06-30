export function getUpperParent(range: Range): Element | null {
  const staticRange = new StaticRange({
    startContainer: range.startContainer,
    startOffset: range.startOffset,
    endContainer: range.endContainer,
    endOffset: range.endOffset
  });

  const { startContainer: sc } = staticRange;
  const scElm = sc.nodeType === Node.TEXT_NODE ? sc.parentElement : (sc as Element);

  let parent = scElm as Element;
  // check if parent.parentElement has contenteditable as attribute
  while (!parent.parentElement.hasAttribute('contenteditable')) {
    parent = parent.parentElement;
  }
  return parent;
}

export function findElement(range: Range, elName: string, canvas?: Element): Element | null {
  const staticRange = new StaticRange({
    startContainer: range.startContainer,
    startOffset: range.startOffset,
    endContainer: range.endContainer,
    endOffset: range.endOffset
  });

  const { startContainer: sc } = staticRange;
  let scElm = sc.nodeType === Node.TEXT_NODE ? sc.parentElement : (sc as Element);

  while (!scElm.parentElement.hasAttribute('contenteditable')) {
    if (scElm.nodeName === elName) {
      return scElm;
    }
    scElm = scElm.parentElement;
  }
  return null;
}

function splitElement(element: Node, offset: number, splitInto?: string): [text: string, el: Element] | null {
  const text = element.textContent?.slice(0, offset) || '';
  const textGoesToNewNode = element.textContent?.slice(offset) || '';

  if (element.ownerDocument && element.parentElement) {
    element.textContent = text;

    const newElement = element.ownerDocument.createElement(splitInto || element.parentElement.localName);
    const newText = element.ownerDocument.createTextNode(textGoesToNewNode);

    if (newText.textContent !== '') {
      newElement.appendChild(newText);
    }

    return [text, newElement];
  }
  return null;
}

export function replaceElement(rangeXML: Range, source: Element, newType: string): Element {
  const frag = document.createDocumentFragment();
  while (source.firstChild) {
    frag.appendChild(source.firstChild);
  }
  const newElem = rangeXML.startContainer.ownerDocument.createElementNS(null, newType);
  newElem.appendChild(frag);
  source.parentNode.replaceChild(newElem, source);
  return newElem;
}

export function deleteContentsLikeWord(range: Range): StaticRange | null {
  // Save the position information before deletion
  // const { startContainer, startOffset } = range;

  // Delete the selected content
  range.deleteContents();

  const inElement = range.startContainer.parentElement;
  if (inElement.tagName == 'strong') {
    if (inElement.childNodes.length === 1 && inElement.childNodes[0].nodeName === '#text' && inElement.childNodes[0].textContent === '') {
      inElement.remove();
    }
  }

  return range;


}

export const clearBrTagIfNecessary = (element: HTMLElement) => {
  if (
    element.nodeType === Node.ELEMENT_NODE &&
    element.childNodes.length === 1 &&
    element.childNodes[0].nodeName?.toLocaleLowerCase() === 'br'
  ) {
    element.innerHTML = '';
  }
};

export const createBrTagIfNecessary = (range: StaticRange) => {};
// Insert text into a text node

export const insertTextInTextNode = (sc: Text, so: number, data: string): StaticRange => {
  sc.textContent = sc.textContent?.slice(0, so) + data + sc.textContent?.slice(so);

  return {
    startContainer: sc,
    endContainer: sc,
    startOffset: so + data.length,
    endOffset: so + data.length,
    collapsed: true
  } as StaticRange;
};
// Insert text into an element node

export const insertTextInElementNode = (sc: HTMLElement, data: string): StaticRange => {
  const textNode = sc.ownerDocument.createTextNode(data);
  sc.appendChild(textNode);

  return {
    startContainer: textNode,
    endContainer: textNode,
    startOffset: data.length,
    endOffset: data.length,
    collapsed: true
  } as StaticRange;
};
/**
 * Handles insertion of a paragraph when the startContainer is a text node.
 * Splits the element, updates content, and inserts the new element.
 */

export const insertParagraphForTextNode = (range: Range, textNode: Text, offset: number): StaticRange => {
  const parentElement = textNode.parentElement;

  // Split the element at the offset
  const [beforeText, newElement] = splitElement(textNode, offset);

  // Update the original text node if needed
  if (beforeText) {
    textNode.textContent = beforeText;
  }

  // Insert the new element after the parent
  if (parentElement && newElement) {
    parentElement.after(newElement);

    // Create the new range at the beginning of the new element
    const newContainer = newElement.textContent === '' ? newElement : newElement.firstChild;
    const newOffset = 0;

    // Create a proper StaticRange object
    return new StaticRange({
      startContainer: newContainer,
      startOffset: newOffset,
      endContainer: newContainer,
      endOffset: newOffset
    });
  }

  // Fallback if something went wrong
  return new StaticRange(range);
};

/**
 * Handles insertion of a paragraph when the startContainer is an element node.
 * Creates a new paragraph or sibling element, depending on the context.
 */
export const insertParagraphForElementNode = (range, sc: HTMLElement, createElementTag: string): StaticRange => {
  let newParagraphElement: HTMLElement;
  const document = sc.ownerDocument;

  newParagraphElement = document.createElement(createElementTag);
  sc.after(newParagraphElement);

  const cp = { ...range.static, startContainer: newParagraphElement, startOffset: 0, endOffset: 0, collapsed: true };
  return cp;
};

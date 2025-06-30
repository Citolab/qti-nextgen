import * as rangy from 'rangy2';

export class RangeXML
  implements
    Omit<
      Range,
      | 'START_TO_START'
      | 'START_TO_END'
      | 'END_TO_END'
      | 'END_TO_START'
      | 'comparePoint'
      | 'createContextualFragment'
      | 'detach'
      | 'isPointInRange'
      | 'setEndAfter'
      | 'setEndBefore'
      | 'setStartAfter'
      | 'setStartBefore'
      | 'compareBoundaryPoints'
      | 'cloneRange'
      | 'collapse'
      | 'getClientRects'
      | 'getBoundingClientRect'
      | 'getExtent'
      | 'getStart'
      | 'getEnd'
      | 'selectNode'
      | 'selectNodeContents'
      | 'toString'
    >
{
  public _range: rangy.WrappedRange;

  constructor(
    public staticRange: StaticRangeInit,
  ) {
    this._range = rangy.createRange();
    this._range.setStart(this.staticRange.startContainer, this.staticRange.startOffset);
    this._range.setEnd(this.staticRange.endContainer, this.staticRange.endOffset);
  }

  get startContainer(): Node {
    return this._range.startContainer;
  }
  get startOffset(): number {
    return this._range.startOffset;
  }
  get endContainer(): Node {
    return this._range.endContainer;
  }
  get endOffset(): number {
    return this._range.endOffset;
  }
  get collapsed(): boolean {
    return this._range.collapsed;
  }
  get commonAncestorContainer(): Node {
    return this._range.commonAncestorContainer;
  }

  insertNode = value => this._range.insertNode(value);
  surroundContents = (newParent: any): void => this._range.surroundContents(newParent);
  deleteContents = (): void => this._range.deleteContents();
  extractContents = (): DocumentFragment => this._range.extractContents();
  cloneContents = (): DocumentFragment => this._range.cloneContents();
  intersectsNode = (value): boolean => this._range.intersectsNode(value);
  setStart = (node: Node, offset: number): void => this._range.setStart(node, offset);
  setEnd = (node: Node, offset: number): void => this._range.setEnd(node, offset);
  cloneRange = () => this._range.cloneRange();
}

//   // if (scEl.textContent === '') {
//   //   scEl.appendChild(this.doc.createElement('br'));
//   // }
// }
// // if (sc === ec && scEl == ecEl) {
// //   const xmlDoc = this._range.getDocument();
// //   const parentElement = scEl.parentElement;
// //   scEl.remove();
// //   scEl = xmlDoc.createElement('p');
// //   parentElement.replaceWith(scEl);

// //   if (scEl.textContent === '') {
// //     scEl.appendChild(this.doc.createElement('br'));
// //   }
// // }
// // else {
// // This usecase is for deleting everything ctrl+a and then delete
// // and then type a letter, delete that letter..
// // THATS WHEN YOU ENTER THIS CODE
// scEl.normalize();
// // if (scEl.innerHTML === '') {
// //   scEl.appendChild(this.doc.createElement('br'));
// // }
// // }

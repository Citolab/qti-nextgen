
export function createEmptyPatchDocument(rootNode: string): XMLDocument {
  // get the firstElement from this._doc, and create a new xmlDocument with only the firstElement
  const patchDocument = new DOMParser().parseFromString(`<${rootNode}></${rootNode}>`, 'text/xml');
  patchDocument.normalize();
  return patchDocument;
}

export function populateCanvases(canvases: Element[]) {
  canvases.forEach(canvas => {
    collapseWhitespaceLikeHTMLdoesInCanvas(canvas);

    if (canvas.innerHTML.trim() === '') {
      canvas.innerHTML = '<p></p>';
    }
    // canvas.querySelectorAll('*:empty').forEach(emptyElement => {
    //   emptyElement.innerHTML = '<br />';
    // });
  });
}

export function collapseWhitespaceLikeHTMLdoesInCanvas(rootNode) {
  function collapseNodeText(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      node.data = node.data.replace(/\s+/g, ' ').trim();
    } else {
      for (let i = 0; i < node.childNodes.length; i++) {
        collapseNodeText(node.childNodes[i]);
      }
    }
  }
  collapseNodeText(rootNode);
}

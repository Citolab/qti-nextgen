export function parseContentWithCursors(content: string): { xmlDocument: Document; range: Range } {
  // Parse the XML document with `!` and `¡` markers included
  const parser = new DOMParser();
  const xmlDocument = parser.parseFromString(content, 'application/xml');
  const cursorPositions: { node: Node; offset: number; marker: 'start' | 'end' }[] = [];

  // Use TreeWalker to locate each `!` and `¡` in text nodes
  const walker = xmlDocument.createTreeWalker(xmlDocument, NodeFilter.SHOW_TEXT, null);
  let currentNode: Node | null;

  while ((currentNode = walker.nextNode())) {
    let textContent = currentNode.textContent || '';
    let startIndex = textContent.indexOf('!');
    let endIndex = textContent.indexOf('¡');

    // Handle each marker individually and mark its position
    while (startIndex !== -1 || endIndex !== -1) {
      if (startIndex !== -1 && (endIndex === -1 || startIndex < endIndex)) {
        cursorPositions.push({
          node: currentNode,
          offset: startIndex,
          marker: 'start'
        });
        // Remove the `!` marker from text content in place
        textContent = currentNode.textContent = textContent.replace('!', '');
      } else if (endIndex !== -1) {
        cursorPositions.push({
          node: currentNode,
          offset: endIndex,
          marker: 'end'
        });
        // Remove the `¡` marker from text content in place
        textContent = currentNode.textContent = textContent.replace('¡', '');
      }
      // Recheck for any additional markers in the updated text content
      startIndex = textContent.indexOf('!');
      endIndex = textContent.indexOf('¡');
    }
  }

  // Determine the range based on cursor positions
  if (cursorPositions.length !== 2) {
    throw new Error('Unexpected number of cursor positions, expected exactly two markers');
  }

  // Arrange markers as start and end based on their type
  const [firstMarker, secondMarker] = cursorPositions;
  const start = firstMarker.marker === 'start' ? firstMarker : secondMarker;
  const end = firstMarker.marker === 'end' ? firstMarker : secondMarker;

  const range = xmlDocument.createRange();
  range.setStart(start.node, start.offset);
  range.setEnd(end.node, end.offset);

  return { xmlDocument, range: range };
}


export function insertCursorsIntoContent(xmlDocument: Document, range: StaticRange): string {
  // Create a serializer to convert the document back to a string
  const serializer = new XMLSerializer();

  // Insert `!` at the start position in the text node
  const startNode = range.startContainer;
  const startText = startNode.textContent || '';
  startNode.textContent = 
    startText.slice(0, range.startOffset) + '!' + startText.slice(range.startOffset);

  // Insert `¡` at the end position in the text node
  const endNode = range.endContainer;
  const endText = endNode.textContent || '';
  // Adjust the offset for end if start and end are in the same node
  const endOffset = startNode === endNode ? range.endOffset + 1 : range.endOffset;
  endNode.textContent = 
    endText.slice(0, endOffset) + '¡' + endText.slice(endOffset);

  // Serialize the modified XML document back to a string
  return serializer.serializeToString(xmlDocument);
}

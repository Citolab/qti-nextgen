import { IInputEvent } from '.';


/**
 * Main function to insert a paragraph, calls specific functions based on the node type.
 * Handles both text node and element node cases.
 */
export const insertParagraph: IInputEvent<string> = async (elMap, range, data): Promise<StaticRange> => {

  let node = range.commonAncestorContainer;
  let commonElement = node.nodeType === Node.TEXT_NODE ? node.parentElement : node as HTMLElement;

  const elementModule = elMap.get(commonElement.nodeName.toLowerCase());

  if (elementModule?.insertParagraph) return elementModule.insertParagraph(range, data);

  throw new Error(`No insertParagraph hook found for element: ${commonElement.nodeName}`);
};



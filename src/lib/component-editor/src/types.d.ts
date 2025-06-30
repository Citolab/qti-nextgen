export declare class Diff {
  constructor(options?: {});
  toString(): string;
  setValue(
    aKey: string | number,
    aValue:
      | string
      | number
      | boolean
      | number[]
      | {
          [key: string]:
            | string
            | {
                [key: string]: string;
              };
        }
      | elementNodeType
  ): this;
  action: string;
  oldValue: string;
  newValue: string;
  route: number[];
}

interface elementNodeType {
  nodeName: string;
  attributes?: {
    [key: string]: string;
  };
  childNodes?: nodeType[];
  checked?: boolean;
  value?: string | number;
  selected?: boolean;
}
interface textNodeType {
  nodeName: '#text' | '#comment';
  data: string;
  childNodes?: never;
}
type nodeType = elementNodeType | textNodeType;

import type { RangeXML } from './RangeXML';

// https://github.com/microsoft/TypeScript/issues/420#issuecomment-1326648055
export interface MyModuleInterface {
  // the identifier, this is the tagname of the element
  identifier: string;
  // range is an XML Range object which you can use to manipulate the xml
  // Deliver a static range, you can clone the original and adjust it
  create?: ContentFunc;
  wrap?: ContentFunc;

  // the new created element of type UL in the document
  // you can manipulate the element here
  // for likewise if a choice-element is added, you can add an identier to it
  // the boolean is for the the apply, if you altered the xml, it will be applied
  mutateAdded?: (el: Element | Node) => StaticRange | null;
  mutateRemoved?: (el: Element | Node) => StaticRange | null;
  // if the element is empty, you can mutate it here
  // add a br or something, or in case of an ul, convert it to a p
  mutateEmpty?: (el: Element | Node) => StaticRange | null;
  // If you're element requires specific styling you can add it here
  // Likewise, an empty paragraph can be styled with a pseudo element
  style?: string;
  // the key which invokes the create method
  key?: { modifier: string; key: string };

  // all the onbeforeinput triggers
  insertText?(range: Range, data: string): StaticRange | null;
  insertParagraph?(range: Range, data: string): StaticRange | null;
  deleteContentBackward?(range: Range, data: string): StaticRange | null;
}

export interface ContentFunc {
  (xmlRange: Range, data?: string): StaticRange;
}

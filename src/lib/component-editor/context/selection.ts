import { createContext } from '@lit/context';

export interface XmlSelection {
  canvas: Element | null;
  range: StaticRange | null;
  type: 'caret' | 'range' | 'none';
  element: Node | null;
}

export const xmlSelectionContext = createContext<XmlSelection>('xmlSelection');

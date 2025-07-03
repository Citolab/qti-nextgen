import { createContext } from '@lit/context';
import { ContentFunc, Diff, MyModuleInterface } from '../src/types';
import { XMLStore } from '../components/xml-store/xml-store';

export interface EditContext {
  elms: Map<string, MyModuleInterface> | null;
  applyDiffs: (docEl: Element, diffs: Diff[]) => void;
  xpath: (node: Node) => string;
  canvases: () => Element[];
  xmlNode: (node: Node) => Node | Element | null;
  updateXML: (fn: ContentFunc) => void;
  addNewContent: (value: string) => void;
  editContent: (el: Element, value: string) => void;
  changeSelection: (range: StaticRange) => void;
  doc: () => XMLDocument;
  xmlRange: Range | null;
  xmlStore: XMLStore
}

export const editContext = createContext<EditContext>('editContext');

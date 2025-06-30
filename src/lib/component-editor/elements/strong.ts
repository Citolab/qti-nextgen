import type { MyModuleInterface } from '../../component-editor';
import { insertTextInElementNode } from '../components/utilities';

const MODULE: MyModuleInterface = {
  identifier: 'strong',
  wrap: (range, data) => {
    const newParent = range.startContainer.ownerDocument.createElement('strong');
    range.surroundContents(newParent);
    return range;
  },
  insertText: (range: Range, data): StaticRange => {
    return insertTextInElementNode(range.startContainer as HTMLElement, data);
  }
};

export const { identifier, wrap } = MODULE;

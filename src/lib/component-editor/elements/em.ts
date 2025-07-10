import type { MyModuleInterface } from '../../component-editor';

const MODULE: MyModuleInterface = {
  identifier: 'em',
  wrap: (range, data) => {
    const newParent = range.startContainer.ownerDocument.createElementNS(null, 'em');
    range.surroundContents(newParent);
    return range;
  }
};

export const { identifier, wrap } = MODULE;

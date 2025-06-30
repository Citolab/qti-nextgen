import type { MyModuleInterface } from '../../component-editor';

const MODULE: MyModuleInterface = {
  identifier: 'li',
  style: `li:empty:after {
    color:gray;
    font-style: italic;
    content: 'lijst item';
  }`,
  mutateRemoved: el => {
    console.log('LI removed hook', el);
    return null;
  },
  mutateAdded: el => {
    if (el.childNodes.length === 0) {
      // el.appendChild(el.ownerDocument.createElement('br'));
    }
    return null;
  },
  mutateEmpty: el => {
    if (el.childNodes.length === 0) {
      // el.appendChild(el.ownerDocument.createElement('br'));
    }
    return null;
  }
};

export const { identifier, style, mutateRemoved, mutateAdded, mutateEmpty } = MODULE;

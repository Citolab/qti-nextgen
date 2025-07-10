import type { MyModuleInterface } from '../../component-editor';

const MODULE: MyModuleInterface = {
  identifier: 'ul',
  create: (range, data) => {
    !range.collapsed && range.deleteContentsLikeWord();

    const UL = range.doc.createElementNS(null,'ul');
    const LI = range.doc.createElementNS(null,'li');
    UL.appendChild(LI);

    range.canvas.insertBefore(UL, range.upperParent.nextSibling);

    return { ...range.static, collapsed: true, startContainer: LI, startOffset: 0 };
  },
  mutateRemoved: el => {
    console.log('H1 removed hook', el);
    return null;
  },
  mutateAdded: el => {
    console.log('H1 added hook', el);
    return null;
  },
  mutateEmpty: (el: Element) => {
    if (el.children.length > 0) return null; // <-- don't know why this is needed, but it is
    const p = el.ownerDocument.createElementNS(null,'p');
    // p.appendChild(el.ownerDocument.createElementNS(null,'br'));
    el.replaceWith(p);
    return null;
  }
};

export const { identifier, create, mutateRemoved, mutateAdded, mutateEmpty } = MODULE;

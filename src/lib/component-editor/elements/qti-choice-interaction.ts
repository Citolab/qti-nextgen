import { MyModuleInterface } from '@editor/content';
import { deleteContentsLikeWord, getUpperParent } from '../../component-editor/components/utilities';

const MODULE: MyModuleInterface = {
  identifier: 'qti-choice-interaction',
  create: (range, data) => {
    const doc = range.startContainer.ownerDocument;
    !range.collapsed && deleteContentsLikeWord(range);

    const CI = doc.createElementNS(null,'qti-choice-interaction');
    CI.setAttribute('response-identifier', 'RESPONSE');
    CI.setAttribute('max-choices', '1');

    const PR = doc.createElementNS(null,'qti-prompt');
    const BR = doc.createElementNS(null,'br');

    PR.appendChild(BR);

    const SC = doc.createElementNS(null,'qti-simple-choice');
    SC.setAttribute('identifier', 'CHOICE');
    // SC.setAttribute('fixed', 'false');
    // SC.setAttribute('show-hide', 'show');

    const SCT = doc.createTextNode('first');
    SC.appendChild(SCT);
    CI.appendChild(PR);
    CI.appendChild(SC);

    getUpperParent(range).after(CI);

    const staticRange = new StaticRange({
      startContainer: range.startContainer,
      startOffset: range.startOffset,
      endContainer: range.endContainer,
      endOffset: range.endOffset
    });

    return { ...staticRange, collapsed: true, startContainer: SC, startOffset: 0 };
  },
  mutateAdded(el: Element): StaticRange {
    const xmlFragmentString = `
      <qti-response-declaration 
        identifier="${el.getAttribute('response-identifier')}" cardinality="single" base-type="identifier">
        <qti-correct-response>
          <qti-value>0</qti-value>
        </qti-correct-response>
      </qti-response-declaration>
    `;
    const xmlFragment = new DOMParser().parseFromString(xmlFragmentString, 'application/xml').documentElement;
    el.ownerDocument.querySelector('qti-assessment-item')?.prepend(xmlFragment);
    return null;
  }
};

export const { identifier, create, mutateAdded } = MODULE;

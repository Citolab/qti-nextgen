import type { EditContext } from '@editor/content';
import { editContext } from '@editor/content';
import { consume } from '@lit/context';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { deleteContentsLikeWord, getUpperParent } from '../../component-editor/components/utilities';

@customElement('meer-keuze')
export class MeerKeuze extends LitElement {
  @consume({ context: editContext })
  @property({ attribute: false })
  public logger?: EditContext;

  static styles = css`
    button {
      all: unset;
    }
  `;

  render = () => html`
    <button
      part="btn"
      @mousedown=${e => {
        e.preventDefault();
        this.logger.updateXML((range, data) => {
          !range.collapsed && deleteContentsLikeWord(range);
          const doc = range.startContainer.ownerDocument;

          const CI = doc.createElementNS(null,'qti-choice-interaction');
          CI.setAttribute('response-identifier', 'RESPONSE');
          CI.setAttribute('max-choices', '1');

          const PR = doc.createElementNS(null,'qti-prompt');
          const PRT = doc.createTextNode('vraag');
          PR.appendChild(PRT);

          const SC = doc.createElementNS(null,'qti-simple-choice');
          SC.setAttribute('identifier', 'CHOICE');
          // SC.setAttribute('fixed', 'false');
          // SC.setAttribute('show-hide', 'show');

          const SCT = doc.createTextNode('alternatief');
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
        });
      }}
    >
      <slot></slot>
    </button>
  `;
}

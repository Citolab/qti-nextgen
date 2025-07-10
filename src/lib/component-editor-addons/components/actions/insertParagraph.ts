import { customElement, property } from 'lit/decorators.js';
import { LitElement, css, html } from 'lit';
import { consume } from '@lit/context';
import { EditContext, editContext } from '../../../component-editor';
import { getUpperParent } from '../../../component-editor/components/utilities';

@customElement('insert-paragraph')
export class InsertParagraph extends LitElement {
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
          const P = range.startContainer.ownerDocument.createElementNS(null,'p');
          // const BR = range.doc.createElement('br');
          // P.append(BR);
          // range.upperParent.replaceWith(P);
          getUpperParent(range).replaceWith(P);
          return { ...range, startContainer: P, endContainer: P, startOffset: 0, endOffset: 0, collapsed: true };
        });
      }}
    >
      <slot></slot>
    </button>
  `;
}

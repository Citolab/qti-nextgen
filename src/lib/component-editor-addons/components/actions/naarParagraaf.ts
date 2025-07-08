import { customElement, property } from 'lit/decorators.js';
import { LitElement, css, html } from 'lit';
import { consume } from '@lit/context';
import { canvasesContext, EditContext, editContext } from '../../../component-editor';
import { getUpperParent } from '../../../component-editor/components/utilities';

@customElement('naar-paragraaf')
export class ToParagraph extends LitElement {
  @consume({ context: editContext })
  @property({ attribute: false })
  public logger?: EditContext;

  @consume({ context: canvasesContext, subscribe: true })
  @property({ attribute: false })
  public canvases: Element[] = [];

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
          // range.replaceElement(range.upperParent, 'h1');
          const P = range.startContainer.ownerDocument.createElementNS(null, 'p');
          P.textContent = getUpperParent(range, this.canvases).textContent;
          if (P.textContent === '') {
            const BR = range.startContainer.ownerDocument.createElementNS(null, 'br');
            P.append(BR);
          }
          getUpperParent(range, this.canvases).replaceWith(P);
          return { ...range, startContainer: P, endContainer: P, startOffset: 0, endOffset: 0, collapsed: true };
        });
      }}
    >
      <slot></slot>
    </button>
  `;
}

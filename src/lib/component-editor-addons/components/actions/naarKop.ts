import { customElement, property } from 'lit/decorators.js';
import { LitElement, css, html } from 'lit';
import { consume } from '@lit/context';
import { canvasesContext, EditContext, editContext, MyModuleInterface } from '../../../component-editor';
import { getUpperParent } from '../../../component-editor/components/utilities';

@customElement('naar-kop')
export class AddComponent extends LitElement {
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
          const H1 = range.startContainer.ownerDocument.createElementNS(null, 'h1');
          console.log(this.canvases)
          const uppParent = getUpperParent(range, this.canvases);
          H1.textContent = uppParent.textContent;
          if (H1.textContent === '') {
            const BR = range.startContainer.ownerDocument.createElementNS(null, 'br');
            H1.append(BR);
          }
          getUpperParent(range, this.canvases).replaceWith(H1);
          return { ...range, startContainer: H1, endContainer: H1, startOffset: 0, endOffset: 0, collapsed: true };
        });
      }}
    >
      <slot></slot>
    </button>
  `;
}

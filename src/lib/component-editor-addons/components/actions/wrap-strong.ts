import { customElement, property } from 'lit/decorators.js';
import { LitElement, css, html } from 'lit';
import { consume } from '@lit/context';
import { EditContext, editContext } from '../../../component-editor';

@customElement('wrap-strong')
export class WrapStrong extends LitElement {
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
          range.surroundContents(document.createElementNS(null,"strong"))
          return range;
        });
      }}
    >
      <slot></slot>
    </button>
  `;
}
import { consume } from '@lit/context';
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { XmlSelection, xmlSelectionContext } from '../context/selection';

export class SelectionLogger extends LitElement {
  @consume({ context: xmlSelectionContext, subscribe: true })
  @property({ attribute: false })
  public selection?: XmlSelection;

  render() {
    if (!this.selection?.range?.startContainer) return html`<p>No selection</p>`;
    const { startContainer, startOffset, endContainer, endOffset } = this.selection.range;
    return html`
      <table>
        <tr>
          <td>canvas.nodeName</td>
          <td>${this.selection.canvas.nodeName}</td>
        </tr>
        <tr>
          <td>element.nodeName</td>
          <td>${this.selection.element.nodeName}</td>
        </tr>
        <tr>
          <td>selection.type</td>
          <td>${this.selection.type}</td>
        </tr>
        <tr>
          <td>startContainer</td>
          <td>${startContainer.nodeName},${startOffset}</td>
        </tr>
        <tr>
          <td>endContainer</td>
          <td>${endContainer.nodeName},${endOffset}</td>
        </tr>
      </table>
    `;
  }
}

customElements.define('selection-logger', SelectionLogger);

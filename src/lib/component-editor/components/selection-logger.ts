import { consume } from '@lit/context';
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { XmlSelection, xmlSelectionContext } from '../context/selection';

/*
getTargetRanges: [{ (#text "sadasd asd a", 12) - (<p>, 0) }]
*/
export class SelectionLogger extends LitElement {
  @consume({ context: xmlSelectionContext, subscribe: true })
  @property({ attribute: false })
  public selection?: XmlSelection;

  render() {
    if (!this.selection?.range?.startContainer) return html`<p>No selection</p>`;
    const { startContainer, startOffset, endContainer, endOffset } = this.selection.range;
    // range is a static range
    const formatNode = (node: Node, offset: number) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return `(#text "${node.textContent}", ${offset})`;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        return `(<${(node as Element).nodeName.toLowerCase()}>, ${offset})`;
      } else {
        return `(${node.nodeName}, ${offset})`;
      }
    };

    const rangeDisplay = `[${formatNode(startContainer, startOffset)} - ${formatNode(endContainer, endOffset)}]`;
    return html`
      rangeDisplay: ${rangeDisplay}
    `;
  }
}

customElements.define('selection-logger', SelectionLogger);

import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { autoUpdate, computePosition, offset } from '@floating-ui/dom';
import { consume } from '@lit/context';
import { EditContext, editContext } from '../../../component-editor';
import { InfoCanvas } from '../info-canvas';

@customElement('text-selection')
export class TextSelectionPanel extends LitElement {
  @consume({ context: editContext, subscribe: true })
  @property({ attribute: false })
  public logger?: EditContext;
  infoCanvas: InfoCanvas;

  // floating ui styles
  static styles = css`
    :host {
      position: absolute;
      left: 0;
      top: 0;
      width: max-content;
    }
  `;

  constructor() {
    super();

    this.infoCanvas = this.closest('web-content-editor').querySelector('web-canvas') as InfoCanvas;

    this.infoCanvas.addEventListener('canvas-selectionchange', (e: CustomEvent) => {
      if (e.detail === null) return; // no selection, do not show the panel
      //      if ((e as any).detail.type === 'Range') { pk: old check, do not know why this is not working
      if (e.detail.range.endOffset > 0 && e.detail.range.endOffset !== e.detail.range.startOffset) {
        this._elementClicked(e.target as HTMLElement);
      }
    });
  }

  connectedCallback(): void {
    super.connectedCallback();

    const sheet = new CSSStyleSheet();
    sheet.replaceSync(``);
    (this.closest('web-content-editor').getRootNode() as Document).adoptedStyleSheets.push(sheet);
    this.hide();
    this.addEventListener('mouseup', this.handleMouseUp);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('mouseup', this.handleMouseUp);
  }

  render() {
    return html` <slot></slot>`;
  }

  private _elementClicked(el: Element) {
    const selection = (this.closest('web-content-editor').getRootNode() as Document).getSelection();
    const range =
      typeof selection?.rangeCount === 'number' && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    const virtualEl = {
      getBoundingClientRect: () => range.getBoundingClientRect()
    };
    autoUpdate(virtualEl, this, () => {
      computePosition(virtualEl, this, {
        placement: 'top',
        middleware: [offset(10)]
      }).then(({ x, y }) => {
        Object.assign(this.style, {
          left: `${x}px`,
          top: `${y}px`
        });
      });
    });
    this.show();
  }

  private handleMouseUp = () => {
    this.hide();
  };

  show() {
    this.style.removeProperty('display');
  }

  hide() {
    this.style.display = 'none';
  }
}

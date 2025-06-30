import { LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { InfoCanvas } from '../info-canvas';

@customElement('empty-canvas')
export class EmptyCanvasElement extends LitElement {
  private selectionChangeHandler = this.handleSelectionChange.bind(this);
  infoCanvas: InfoCanvas;

  constructor() {
    super();
    this.infoCanvas = this.closest('web-content-editor').querySelector('info-canvas') as InfoCanvas;
  }

  connectedCallback(): void {
    super.connectedCallback();

    const sheet = new CSSStyleSheet();
    sheet.replaceSync(`
    [data-message] {
      content: 'A' !important;
      &:after {
        color: gray;
        font-style: italic;
        content: attr(data-message);
      }
    }`);

    (this.closest('web-content-editor').getRootNode() as Document).adoptedStyleSheets.push(sheet);
    this.infoCanvas.addEventListener('canvas-selectionchange', this.initializeCanvases.bind(this));
    // this.infoCanvas.addEventListener('patched', this.initializeCanvases.bind(this));
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.infoCanvas.removeEventListener('canvas-selectionchange', this.initializeCanvases.bind(this));
  }

  public initializeCanvases() {
    this.infoCanvas.canvases.forEach((canvas: HTMLElement) => {
      Array.from(canvas.children).forEach((el: HTMLElement) => {
        if (this._isEmptyElement(el)) {
          if (el.isEqualNode((this.closest('web-content-editor').getRootNode() as Document).getSelection().focusNode)) {
            // press / for menu
            el.firstElementChild.setAttribute('data-message', `${el.localName}`);
          } else {
            el.firstElementChild.removeAttribute('data-message');
          }
        }
      });
    });
  }

  private handleSelectionChange(event: Event) {
    const el = (this.closest('web-content-editor').getRootNode() as Document).getSelection().focusNode as HTMLElement;
    if (el.nodeType === Node.TEXT_NODE && el.innerHTML.trim() === '<br>') {
      el.firstElementChild.removeAttribute('data-message');
    }
  }

  private _isEmptyElement(el: HTMLElement) {
    return el.innerHTML.trim() === '<br>' && el.children.length === 1;
  }
}

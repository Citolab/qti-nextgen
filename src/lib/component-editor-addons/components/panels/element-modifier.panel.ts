import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { computePosition, offset } from '@floating-ui/dom';
import { consume } from '@lit/context';
import { EditContext, editContext } from '../../../component-editor';
import { InfoCanvas } from '../info-canvas';
import { xmlRootNodeName } from '../../../component-editor/elements/this-is-the-root-tag';

@customElement('element-modifier')
export class ElementModifierPanel extends LitElement {
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

    this.infoCanvas.addEventListener('mousedown', (e: MouseEvent) => {
      const clickedOnBefore = e.clientX - (e.target as HTMLElement).getBoundingClientRect().left;
      if (clickedOnBefore < 0) {
        e.preventDefault();
        this._elementClicked(e.target as HTMLElement);
      }
    });
  }

  connectedCallback(): void {
    super.connectedCallback();

    const sheet = new CSSStyleSheet();
    sheet.replaceSync(`
    web-canvas > ${xmlRootNodeName} [part="canvas"] > * {
      position: relative;
      pointer-events: none;
      &:before{
        position: absolute;
        left: -2rem;
        top: 0px;
        z-index: 40;
        display: block;
        font-size: 1.25rem;
        width: 1.25rem;
        height: 1.25rem;
        vertical-align: middle;
        background: white;
        cursor: pointer;
        padding-right: 0.25rem;
        --tw-text-opacity: 1;
        color: rgb(156 163 175 / var(--tw-text-opacity));
        fill: currentColor;
        content: "\\22EE";
        cursor: pointer;
        pointer-events: auto;
      }
      &:hover:before{
        --tw-text-opacity: 1;
        color: rgb(31 41 55 / var(--tw-text-opacity));
      }
    }`);
    (this.closest('web-content-editor').parentElement.getRootNode() as Document).adoptedStyleSheets.push(sheet);
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
    this.logger.changeSelection({
      startContainer: el.firstChild,
      startOffset: 0,
      endContainer: el.firstChild,
      endOffset: el.textContent.length,
      collapsed: false
    });

    const virtualEl = {
      getBoundingClientRect: () => el.getBoundingClientRect()
    };

    computePosition(virtualEl, this, {
      placement: 'left-start',
      middleware: [offset(40)]
    }).then(({ x, y }) => {
      Object.assign(this.style, {
        left: `${x}px`,
        top: `${y}px`
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

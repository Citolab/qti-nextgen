import { consume } from '@lit/context';
import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Diff, EditContext, editContext } from '../../../component-editor';
import { InfoCanvas } from '../info-canvas';

@customElement('pilot-canvas')
export class PilotCanvas extends LitElement {
  @consume({ context: editContext, subscribe: true })
  @property({ attribute: false })
  protected _logger?: EditContext;

  infoCanvas: InfoCanvas;

  constructor() {
    super();
    this.infoCanvas = this.closest('web-content-editor').querySelector('info-canvas') as InfoCanvas;
  }

  connectedCallback(): void {
    super.connectedCallback();

    const sheet = new CSSStyleSheet();
    sheet.replaceSync(`
    [data-pilot]:after {
      color: gray;
      font-style: italic;
      content: attr(data-pilot);
    }`);
    (this.closest('web-content-editor').parentElement.getRootNode() as Document).adoptedStyleSheets.push(sheet);

    this.infoCanvas.addEventListener('patched', (event: Event & { detail: Diff[] }) => {
      this.patch(event.detail);
    });

    this.infoCanvas.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        this.infoCanvas.canvases.forEach(canvas => {
          const pilots = canvas.querySelectorAll('[data-pilot]');
          pilots.length > 0 && e.preventDefault();
          pilots.forEach((el: Element) => {
            this._logger.updateXML((range, data) => {
              const xmlEl = this._logger.xmlNode(el);
              const completionText = el.getAttribute('data-pilot');
              xmlEl.textContent = el.textContent + completionText;

              return {
                ...range,
                startContainer: xmlEl.firstChild,
                endContainer: xmlEl.firstChild,
                startOffset: xmlEl.textContent.length,
                endOffset: xmlEl.textContent.length,
                collapsed: true
              };
            });
            el.removeAttribute('data-pilot');
          });
        });
      }
    });
  }

  public patch(diffs: Diff[]) {
    this.infoCanvas.canvases.forEach((canvas: Element) => {
      Array.from(canvas.children).forEach((el: Element) => {
        // debugger;
        if (el?.textContent?.toLowerCase() === 'genereer') {
          el.setAttribute('data-pilot', ` supervette ai dingen`);
        } else {
          el.removeAttribute('data-pilot');
        }
      });
    });
  }
}

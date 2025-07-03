import { consume } from '@lit/context';
import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Diff, EditContext, editContext, signalPatch } from '../../../component-editor';
import { InfoCanvas } from '../info-canvas';
import { Signal } from '@lit-labs/signals';

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

    const watcherPatch = new Signal.subtle.Watcher(async () => {
      await 0; // Notify callbacks are not allowed to access signals synchronously
      this.patch(signalPatch.get());
      watcherPatch.watch(); // Watchers have to be re-enabled after they run:
    });
    watcherPatch.watch(signalPatch);

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
        if (el?.textContent?.toLowerCase() === 'genereer') {
          el.setAttribute('data-pilot', ` supervette ai dingen`);
        } else {
          el.removeAttribute('data-pilot');
        }
      });
    });
  }
}

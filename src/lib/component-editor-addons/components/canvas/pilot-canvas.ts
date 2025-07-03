import { consume, ContextConsumer } from '@lit/context';
import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { canvasesContext, Diff, EditContext, editContext, patchContext } from '../../../component-editor';

@customElement('pilot-canvas')
export class PilotCanvas extends LitElement {
  @consume({ context: editContext, subscribe: true })
  @property({ attribute: false })
  protected _logger?: EditContext;

  private patchConsumer = new ContextConsumer(this, {
    context: patchContext,
    subscribe: true,
    callback: this._onPatchContextChanged.bind(this)
  });
  canvases: HTMLElement[];

  private _onPatchContextChanged(value: Diff[]) {
    if (!value || value.length === 0) {
      return;
    }
    this.patch(value);
  }

  private canvasesConsumer = new ContextConsumer(this, {
    context: canvasesContext,
    subscribe: true,
    callback: this._onCanvasesContextChanged.bind(this)
  });

  private _onCanvasesContextChanged(value: HTMLElement[]) {
    if (!value || value.length === 0) {
      return;
    }
    this.canvases = value;
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

    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        this.canvases.forEach(canvas => {
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
    if (!this.canvases || this.canvases.length === 0) {
      return;
    }
    this.canvases.forEach((canvas: Element) => {
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

import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { canvasesContext, Diff, EditContext, editContext, patchContext } from '../../component-editor';
import { consume, ContextConsumer } from '@lit/context';
import { xmlRootNodeName } from '../../component-editor/elements/this-is-the-root-tag';

@customElement('info-canvas')
export class InfoCanvas extends LitElement {
  createRenderRoot = () => this; // disable shadowRoot for XPATH and styling

  @consume({ context: editContext, subscribe: true })
  @property({ attribute: false })
  protected _logger?: EditContext;
  roottagname: string;
  rootCanvas: any;
  canvases: any[] = [];

  static styles = css`
    :host {
      position: relative;
    }
  `;

  private patchConsumer = new ContextConsumer(this, {
    context: patchContext,
    subscribe: true,
    callback: this._onPatchContextChanged.bind(this)
  });

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

  public initializeCanvases(canvasesXML: Element[]) {
    this.canvases = canvasesXML.map((canvas: Element) => this.getHTMLNode(canvas));
    this.canvases.forEach((canvas: HTMLElement) => {
      canvas.setAttribute('part', 'canvas');
      canvas.style.whiteSpace = 'pre-wrap';
    });
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.rootCanvas = document.createElement(xmlRootNodeName);
    this.prepend(this.rootCanvas);
  }

  protected getHTMLNode(xmlNode: Element | Node): HTMLElement {
    const xPathXML = this._logger.xpath(xmlNode).slice(1);
    const result = document.evaluate(xPathXML, this, null, XPathResult.ANY_TYPE, null).iterateNext() as HTMLElement;
    return result;
  }

  public patch(diffs: Diff[]) {
    this._logger.applyDiffs(this.rootCanvas, diffs);
  }

  render() {
    return html`<slot></slot>`;
  }
}

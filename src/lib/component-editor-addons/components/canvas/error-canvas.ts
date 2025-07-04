import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { Diff, patchContext, PatchedEvent } from '../../../component-editor';
import { InfoCanvas } from '../info-canvas';
import { ContextConsumer } from '@lit/context';

@customElement('error-canvas')
export class ErrorCanvasElement extends LitElement {
  @state()
  private _errors: {
    severity: string;
    range: Range;
    word: string;
    position: { left: string; top: string; width: string; height: string };
  }[] = [];
  infoCanvas: InfoCanvas;

  @property({ type: Array, attribute: 'forbidden-words' })
  forbiddenWords: string[] = [];

  createRenderRoot() {
    return this;
  }

  constructor() {
    super();
    this.infoCanvas = this.closest('web-content-editor').querySelector('web-canvas') as InfoCanvas;
    this.infoCanvas.addEventListener(PatchedEvent.eventName, () => {
      this.check()
    })
  }

  // private patchConsumer = new ContextConsumer(this, {
  //   context: patchContext,
  //   subscribe: true,
  //   callback: this._onPatchContextChanged.bind(this)
  // });

  // private _onPatchContextChanged(value: Diff[]) {
  //   if (!value || value.length === 0) {
  //     return;
  //   }
  //   this.patch(value);
  // }

  connectedCallback(): void {
    super.connectedCallback();

    // const sheet = new CSSStyleSheet();
    // sheet.replaceSync(`
    // web-canvas [part='canvas'] *:empty:not(br):after {
    //   content: 'THIS SHOULD NOT HAPPEN';
    //   color: red;
    //   font-style: italic;
    // }
    // `);
    // this.closest('web-content-editor').parentElement.getRootNode().adoptedStyleSheets.push(sheet);

    this.addEventListener('click', (e: MouseEvent) => {
      e.preventDefault();
      const el = document.elementsFromPoint(e.clientX, e.clientY);
      const error = el.find((el: HTMLElement) => el.classList.contains('error'));
      if (error) {
        alert('error');
      }
    });
  }

  public check() {
    // First we create a tree walker that will walk through all text nodes in the canvas
    const treewalkers: TreeWalker[] = this.infoCanvas.canvases.map((canvas: HTMLCanvasElement) =>
      document.createTreeWalker(canvas, NodeFilter.SHOW_TEXT, {
        acceptNode: node => (node.textContent.trim().length > 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT)
      })
    );

    // PK: future optimizations:
    // Check existing errors for validity
    // - Check if the range still exists
    // - Check if the range still contains the forbiddenword
    // - Check if the position is still correct
    // Check only new content, throught the diff for errors
    // Only update the position of the errors when moved

    // PK: fixme, for now we just clear the errors and rebuild them
    this._errors = [];

    treewalkers.forEach((walker: TreeWalker) => {
      // const textNodes = [];
      while (walker.nextNode()) {
        // textNodes.push(walker.currentNode);
        const text = walker.currentNode.nodeValue;
        // check if the text contains a forbiddenword
        const forbiddenwordsused = this.forbiddenWords.filter(word => text.includes(word));
        // get the index of the forbiddenword
        forbiddenwordsused.forEach(forbiddenword => {
          const index = text.indexOf(forbiddenword);
          if (index > -1) {
            // create range for the forbiddenword
            const range = document.createRange();
            range.setStart(walker.currentNode, index);
            range.setEnd(walker.currentNode, index + forbiddenword.length);
            // get the position relative to the canvas
            const position = rangePositionRelativeToCanvas(range, this.infoCanvas);
            // add this one to the errors
            this._errors = [...this._errors, { severity: 'error', range, word: forbiddenword, position }];
          }
        });
      }
    });
  }

  render() {
    return html`
      ${this._errors.map(
        error =>
          html`<div
            part="error"
            class="error"
            style="position:absolute; z-index:auto; pointer-events: auto; ${styleMap(error.position)}
            "
          ></div>`
      )}
    `;
  }
}

const rangePositionRelativeToCanvas = (range: Range, canvas: HTMLElement) => {
  const bcRange = range.getBoundingClientRect();
  const bcDiv = canvas.getBoundingClientRect();

  const position = {
    left: `${bcRange.left - bcDiv.left}px`,
    top: `${bcRange.top - bcDiv.top}px`,
    width: `${bcRange.width}px`,
    height: `${bcRange.height}px`
  };
  return position;
};

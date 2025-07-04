import type { EditContext } from '@editor/content';
import { editContext } from '@editor/content';
import { autoPlacement, computePosition, offset } from '@floating-ui/dom';
import { consume } from '@lit/context';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { PanelMixin } from './panel-canvas.mixin';

@customElement('panel-handler')
export class MenuAuthoring extends LitElement {
  @consume({ context: editContext })
  @property({ attribute: false })
  public logger?: EditContext;

  private _panels: { appear: 'textselect' | 'onslash'; el: typeof PanelMixin & LitElement }[] = [];

  constructor() {
    super();
    this.addEventListener('register-panel', (e: CustomEvent<{ appear: 'textselect' | 'onslash'; el: LitElement }>) => {
      this._panels.push(e.detail as any);
    });
    this.addEventListener('keydown', this._onKeydown);
    // this.addEventListener('caret-change', this._onCaretChange);
  }

  private _onKeydown(e: KeyboardEvent) {
    const addComponentPanel = this._panels.find(p => p.appear === 'onslash').el;

    if (e.key === '/') {
      e.preventDefault();
      const selection = (this.closest('web-content-editor').getRootNode() as Document).getSelection();
      const range = typeof selection?.rangeCount === 'number' && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;


      console.log(range)
      // buggy behavior in br, explicitely select parent
      if (range && range.startContainer.nodeName === 'BR') {
        const parentElement = range.startContainer.parentElement;
        const newRange = document.createRange();
        newRange.selectNode(parentElement);
        range.setStart(parentElement, 0);
        range.setEnd(parentElement, 0);
      }

      // probably new line buggy behavior, explicitely select the contents
      const rects = range.getClientRects();
      if (!rects.length) {
        if (range.startContainer && range.collapsed) {
          range.selectNodeContents(range.startContainer);
        }
      }

      // place panel
      if (range !== null) {
        const virtualEl = {
          getBoundingClientRect: () => range.getBoundingClientRect()
        };

        console.log('virtualEl', virtualEl);
        computePosition(virtualEl, addComponentPanel, {
          placement: 'top',
          middleware: [offset(10)]
        }).then(({ x, y }) => {
          Object.assign(addComponentPanel.style, {
            left: `${x}px`,
            top: `${y}px`
          });
        });

        (addComponentPanel as any).show();
      }
    }
    // else  {
    //   (addComponentPanel as any).hide();
    // }
  }

  render() {
    return html`<slot></slot>`;
  }
}

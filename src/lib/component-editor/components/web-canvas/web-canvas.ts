import { ContextConsumer } from '@lit/context';
import { DiffDOM } from 'diff-dom';
import { LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Diff } from '../../src/types';
import { xmlRootNodeName } from '../../elements/this-is-the-root-tag';
import { canvasesContext, patchContext } from '../web-content-editor';
import { xPath } from '../xml-store/libs/xpath/Xpath';

@customElement('web-canvas')
export class WebCanvas extends LitElement {
  createRenderRoot = () => this;

  rootCanvas: HTMLElement;
  canvases: HTMLElement[] = [];

  private _diffDOM: DiffDOM = new DiffDOM({
    preDiffApply: info => info.diff.action === 'removeAttribute' && true
  });

  activeElement: HTMLElement;

  constructor() {
    super();

    new ContextConsumer(this, {
      context: patchContext,
      subscribe: true,
      callback: (diffs: Diff[]) => diffs?.length && this.patch(diffs)
    });
    new ContextConsumer(this, {
      context: canvasesContext,
      subscribe: true,
      callback: (canvases: Element[]) => canvases?.length && this.initializeCanvases(canvases)
    });
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.rootCanvas = document.createElement(xmlRootNodeName);
    this.prepend(this.rootCanvas);
  }

  private patch(diffs: Diff[]) {
    this._diffDOM.apply(this.rootCanvas, diffs);
    setTimeout(() => {
      const eventPatched = new PatchedEvent();
      this.dispatchEvent(eventPatched);
    }, 100);
  }

  // ------------------ PRIVATE ------------------

  public initializeCanvases(canvasesXML: Element[]) {
    this.canvases = canvasesXML.map((canvas: Element) => this._getHTMLNode(canvas));
    this.canvases.forEach((canvas: HTMLElement) => {
      canvas.setAttribute('part', 'canvas');
      canvas.setAttribute('contenteditable', '');
      canvas.setAttribute('spellcheck', 'false');
      canvas.setAttribute('tabindex', '0');
      canvas.setAttribute('role', 'textbox');
      canvas.setAttribute('aria-multiline', 'true');
      canvas.setAttribute('aria-label', 'Question content');
      canvas.setAttribute('aria-label', 'Question content');
      canvas.style.whiteSpace = 'pre-wrap';
      canvas.style.whiteSpace = 'break-spaces';
      // style, just for visibility in tests and such
      // canvas.style.cssText = 'display:block;border:1px solid #000000;padding:2px;width:auto;height:100%';
    });

    document.addEventListener('selectionchange', this._selectionChangedHandler.bind(this));
    this.rootCanvas.addEventListener('beforeinput', this._beforeInputHandler.bind(this));
    this.rootCanvas.addEventListener('keydown', this._keydownHandler.bind(this));
  }

  // private _mouseUpHandler(e: MouseEvent) {
  //   e.stopImmediatePropagation();
  //   const selection = window.getSelection();
  //   const range = selection.getRangeAt(0);
  //   const xmlRange = this._logger.xmlStore.getRangeXML(range);
  //   this._logger.xmlRange = xmlRange;

  //   if (selection.type === 'Range') {
  //     this.dispatchEvent(new CustomEvent('range-change', { composed: true, bubbles: true }));
  //   } else {
  //     this.dispatchEvent(new CustomEvent('no-range', { composed: true, bubbles: true, detail: { target: e.target } }));
  //   }
  // }

  /**
   * Listen for document selection changes and dispatch exactly one
   * 'canvas-selectionchange' event at the end, with detail=null if no
   * valid selection inside a canvas.
   */
  private _selectionChangedHandler(_: CustomEvent) {
    const selection = document.getSelection();
    let detail: any = null;

    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const focusNode = selection.focusNode;
      const targetCanvas = this.canvases.find(c => c.contains(focusNode!)) || null;

      if (targetCanvas) {
        // create XML logging range

        // figure out the element to style
        const ancestor = range.commonAncestorContainer;
        const element =
          ancestor.nodeType === Node.TEXT_NODE ? (ancestor.parentElement as HTMLElement) : (ancestor as HTMLElement);

        if (this.activeElement) {
          this.activeElement.removeAttribute('style');
        }
        this.activeElement = element;

        detail = {
          canvas: targetCanvas.closest('[contenteditable]'),
          range: range
        };
      }
    }

    // single dispatch, detail is either the populated object or null
    this.dispatchEvent(
      new CustomEvent('canvas-selectionchange', {
        detail,
        composed: true,
        bubbles: true
      })
    );
  }

  private _keydownHandler(event: KeyboardEvent) {
    if (event.key === 'z' && (event.ctrlKey || event.metaKey)) {
      // check if shift is pressed
      if (!event.shiftKey) {
        const eventUndo = new UndoEvent(this.rootCanvas);
        this.dispatchEvent(eventUndo);
        // const oldRange = this._logger.xmlStore.undo(this.rootCanvas);
        if (!eventUndo.range) return;
        this._restoreSelectionBaseOnRoute(
          eventUndo.range.startOffset,
          eventUndo.range.collapsed,
          eventUndo.range.endOffset,
          eventUndo.range.firstRoute,
          eventUndo.range.lastRoute
        );
      }
    }
    if ((event.key === 'y' && event.ctrlKey) || (event.metaKey && event.key === 'z' && event.shiftKey)) {
      const eventRedo = new RedoEvent(this.rootCanvas);
      this.dispatchEvent(eventRedo);
      // const oldRange = this._logger.xmlStore.undo(this.rootCanvas);
      if (!eventRedo.range) return;
      this._restoreSelectionBaseOnRoute(
        eventRedo.range.startOffset,
        eventRedo.range.collapsed,
        eventRedo.range.endOffset,
        eventRedo.range.firstRoute,
        eventRedo.range.lastRoute
      );
    }
  }

  // PK: intercept beforeInput events and do custom things on the XML here
  private async _beforeInputHandler(event: InputEvent) {
    event.preventDefault();

    // PK: extract inputEvent
    const { inputType } = event;
    if (inputType === 'insertCompositionText') return;

    const data = (event as any).dataTransfer || event.data || undefined; // PK: extract data ( ie, the character you typed, or something else)

    // PK: extract first range
    const ranges = event.getTargetRanges();
    let range;
    if (ranges.length === 0) {
      // console.warn('no cursor or selection in plain sight');
      range = new StaticRange(document.getSelection().getRangeAt(0));
    } else {
      range = ranges[0];
    }

    const MineEvent = new MyInputEvent(inputType, { range, inputType, data });
    this.dispatchEvent(MineEvent);

    const a = await MineEvent.range;
    if (a !== null) this._restoreSelection(a);
  }

  private _getHTMLNode(xmlNode: Element | Node): HTMLElement {
    const xPathXML = xPath(xmlNode).slice(1);
    const result = document.evaluate(xPathXML, this, null, XPathResult.ANY_TYPE, null).iterateNext() as HTMLElement;
    return result;
  }

  /**
   * Core routine: given containers, offsets, and collapsed flag,
   * build a DOM Range and apply it to our editor’s Selection.
   */
  private _applySelection(startNode: Node, startOffset: number, endNode: Node, endOffset: number, collapsed: boolean) {
    const range = new Range();
    range.setStart(startNode, Math.max(0, startOffset));
    range.setEnd(endNode, Math.max(0, collapsed ? startOffset : endOffset));

    // @ts-ignore Shadow-root selection is supported in Chrome/Edge
    const sel = this.getRootNode().getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  /**
   * Restore from a previously-saved StaticRange (with real DOM containers).
   */
  private _restoreSelection(r: StaticRange) {
    if (!r) return;

    const { startContainer, startOffset, endContainer, endOffset, collapsed } = r;

    const htmlStart = this._getHTMLNode(startContainer);
    if (!htmlStart) return;

    const htmlEnd = collapsed ? htmlStart : this._getHTMLNode(endContainer);
    if (!htmlEnd) return;

    this._applySelection(htmlStart, startOffset, htmlEnd, endOffset, collapsed);
  }

  /**
   * Restore from a “route + offsets” representation.
   */
  private _restoreSelectionBaseOnRoute(
    startOffset: number,
    collapsed: boolean,
    endOffset: number,
    firstRoute: number[],
    lastRoute: number[]
  ) {
    if (!firstRoute?.length || !lastRoute?.length) return;

    const startNode = this.getNodeByRoute(firstRoute);
    const endNode = collapsed ? startNode : this.getNodeByRoute(lastRoute);

    this._applySelection(startNode, startOffset, endNode, endOffset, collapsed);
  }

  private getNodeByRoute(route: number[]) {
    let nodeIndex;
    let node = this.rootCanvas;
    route = route.slice();
    while (route.length > 0) {
      nodeIndex = route.splice(0, 1)[0];
      node = (node.childNodes ? node.childNodes[nodeIndex] : undefined) as HTMLElement;
    }
    return node;
  }
}

export class UndoEvent extends Event {
  public range: {
    firstRoute: number[];
    lastRoute: number[];
    startOffset: number;
    endOffset: number;
    collapsed: boolean;
  } | null = null;
  public static eventName = 'undo';
  constructor(public canvas: HTMLElement) {
    super(UndoEvent.eventName, { bubbles: true, composed: true });
  }
}

export class RedoEvent extends Event {
  public range: {
    firstRoute: number[];
    lastRoute: number[];
    startOffset: number;
    endOffset: number;
    collapsed: boolean;
  } | null = null;
  public static eventName = 'redo';
  constructor(public canvas: HTMLElement) {
    super(RedoEvent.eventName, { bubbles: true, composed: true });
  }
}

export class PatchedEvent extends Event {
  public static eventName = 'patched';
  constructor() {
    super(PatchedEvent.eventName, { bubbles: true, composed: true });
  }
}

export class MyInputEvent extends Event {
  public range: StaticRange | null = null;
  public static eventName = 'input-event';
  constructor(
    public inputType: string,
    public data: { range: StaticRangeInit; inputType: string; data?: any }
  ) {
    super(MyInputEvent.eventName, { bubbles: true, composed: true });
  }
}

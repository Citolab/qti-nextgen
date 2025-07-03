import { consume } from '@lit/context';
import { DiffDOM } from 'diff-dom';
import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { EditContext, editContext } from '../../context/logger';
import { XmlSelection, xmlSelectionContext } from '../../context/selection';
import { Diff } from '../../src/types';
import * as InputEvents from './input-events';
import { xmlRootNodeName } from '../../elements/this-is-the-root-tag';
import { Signal } from '@lit-labs/signals';
import { signalCanvases, signalPatch } from '../web-content-editor';

@customElement('web-canvas')
export class WebCanvas extends LitElement {
  createRenderRoot = () => this; // disable shadowRoot for XPATH and styling

  public rootCanvas: HTMLElement;
  canvases: HTMLElement[] = [];

  private _diffDOM: DiffDOM = new DiffDOM({
    preDiffApply: info => info.diff.action === 'removeAttribute' && true
  });

  @consume({ context: editContext, subscribe: true })
  @property({ attribute: false })
  public _logger?: EditContext;

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);
    if (changedProperties.has('_logger')) {
      // console.log('_logger changed:', this._logger);
    }
  }

  @consume({ context: xmlSelectionContext, subscribe: true })
  @property({ attribute: false })
  public _selection?: XmlSelection;
  activeElement: HTMLElement;

  // ------------------ PUBLIC ------------------

  constructor() {
    super();
  }

  connectedCallback(): void {
    super.connectedCallback();

    this.rootCanvas = document.createElement(xmlRootNodeName);
    // this.rootNode = this.closest('web-content-editor').getRootNode() as Document | ShadowRoot;
    this.prepend(this.rootCanvas);

    const watcherPatch = new Signal.subtle.Watcher(async () => {
      await 0; // Notify callbacks are not allowed to access signals synchronously
      this.patch(signalPatch.get());
      watcherPatch.watch(); // Watchers have to be re-enabled after they run:
    });
    watcherPatch.watch(signalPatch);

    const watcherCanvases = new Signal.subtle.Watcher(async () => {
      await 0; // Notify callbacks are not allowed to access signals synchronously
      this.initializeCanvases(signalCanvases.get());
      watcherCanvases.watch(); // Watchers have to be re-enabled after they run:
    });
    watcherCanvases.watch(signalCanvases);
  }

  public printMessage(message: string): void {
    console.log(message);
  }

  private _initializeRoot() {
    document.addEventListener('selectionchange', this._selectionChangedHandler.bind(this));
    this.rootCanvas.addEventListener('beforeinput', this._beforeInputHandler.bind(this));
    this.rootCanvas.addEventListener('keydown', this._keydownHandler.bind(this));
  }

  public patch(diffs: Diff[]) {
    this._diffDOM.apply(this.rootCanvas, diffs);
  }

  // ------------------ PRIVATE ------------------

  public initializeCanvases(canvasesXML: Element[]) {
    this.canvases = canvasesXML.map((canvas: Element) => this._getHTMLNode(canvas));
    canvasesXML.forEach((canvas: Element) => canvas.setAttribute('contenteditable', ''));
    this.canvases.forEach((canvas: HTMLElement) => {
      canvas.setAttribute('part', 'canvas');
      canvas.setAttribute('contenteditable', '');
      // canvas.setAttribute('spellcheck', 'false');
      // canvas.setAttribute('tabindex', '0');
      // canvas.setAttribute('role', 'textbox');
      // canvas.setAttribute('aria-multiline', 'true');
      // canvas.setAttribute('aria-label', 'Question content');
      // canvas.setAttribute('aria-label', 'Question content');
      canvas.style.whiteSpace = 'pre-wrap';
      canvas.style.whiteSpace = 'break-spaces';
      // style, just for visibility in tests and such
      // canvas.style.cssText = 'display:block;border:1px solid #000000;padding:2px;width:auto;height:100%';
    });

    this._initializeRoot();
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

  private _selectionChangedHandler(_: CustomEvent) {
    // check if valid selection
    if (document.getSelection().rangeCount === 0) {
      this._dispatchCanvasSelectionChange(null);
      return;
    }

    const selection = document.getSelection(); // this.getRootNode().getSelection();
    const focusNode = selection.focusNode;
    const range = selection.getRangeAt(0);

    // check if selection is in canvas
    if (this.canvases.some(canvas => canvas.contains(focusNode))) {
      const xmlRange = this._logger.createRangeXML(range);
      this._logger.xmlRange = xmlRange;

      let node = range.commonAncestorContainer;
      let element = node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as HTMLElement);

      this.activeElement?.removeAttribute('style');
      this.activeElement = element;
      element.style.setProperty('--anchor-name', '--activeElement');

      this._dispatchCanvasSelectionChange({
        canvas: element.closest('[contenteditable]'),
        range: {
          startOffset: xmlRange.startOffset,
          endOffset: xmlRange.endOffset,
          startContainer: xmlRange.startContainer,
          endContainer: xmlRange.endContainer
        },

        collapsed: xmlRange.collapsed,
        element: xmlRange.commonAncestorContainer
      });
    } else {
      this._dispatchCanvasSelectionChange(null);
    }
  }

  private _dispatchCanvasSelectionChange(detail: any) {
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

    // Ensure the cursor is inside a paragraph
    // enforceParagraphStructure(range);

    const xmlRange = this._logger.createRangeXML(range);

    console.info(inputType, xmlRange, data);
    // This is where the magic happens, the hookInputEvents will call the hook implementation
    let selectionRange = await InputEvents[inputType](this._logger.elms, xmlRange, data);

    // Apply the XML changes to the HTML
    this._logger.apply();

    // if (ranges.length === 0) {
    //   selectionRange = new StaticRange(xmlRange);
    //   selectionRange.startContainer.normalize();
    // }

    // PK: restore the selection
    if (selectionRange !== null) this._restoreSelection(selectionRange);
  }

  private _getHTMLNode(xmlNode: Element | Node): HTMLElement {
    const xPathXML = this._logger.xpath(xmlNode).slice(1);
    const result = document.evaluate(xPathXML, this, null, XPathResult.ANY_TYPE, null).iterateNext() as HTMLElement;
    return result;
  }

  private _restoreSelection(r: StaticRange) {
    if (!r) return;
    const { startContainer, startOffset, endContainer, endOffset, collapsed } = r;
    const range = new Range();
    const htmlNode = this._getHTMLNode(startContainer);
    if (!htmlNode) return;
    range.setStart(htmlNode, Math.max(0, startOffset));
    range.setEnd(
      this._getHTMLNode(collapsed ? startContainer : endContainer),
      collapsed ? Math.max(0, startOffset) : Math.max(0, endOffset)
    );

    // @ts-ignore ignore the fact that this.getRootNode() is a shadowRoot, Chrome and Edge support this, Safari and Firefox don't
    const selection = this.getRootNode().getSelection();
    // const selection = this.closest('web-content-editor').getRootNode().getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
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

  private _restoreSelectionBaseOnRoute(
    startOffset: number,
    collapsed: boolean,
    endOffset: number,
    firstRoute: number[],
    lastRoute: number[]
  ) {
    if (!firstRoute?.length || !lastRoute?.length) return;
    const startContainer = this.getNodeByRoute(firstRoute);
    const endContainer = this.getNodeByRoute(lastRoute);
    const range = new Range();
    range.setStart(startContainer, Math.max(0, startOffset));
    range.setEnd(endContainer, collapsed ? Math.max(0, startOffset) : Math.max(0, endOffset));

    // @ts-ignore ignore the fact that this.getRootNode() is a shadowRoot, Chrome and Edge support this, Safari and Firefox don't
    const selection = this.getRootNode().getSelection();

    selection.removeAllRanges();
    selection.addRange(range);
  }
}

export class UndoEvent extends Event {
  public range: StaticRange | null = null;
  public static eventName = 'undo';
  constructor(public canvas: HTMLElement) {
    super(UndoEvent.eventName, { bubbles: true, composed: true });
  }
}

export class RedoEvent extends Event {
  public range: StaticRange | null = null;
  public static eventName = 'redo';
  constructor(public canvas: HTMLElement) {
    super(RedoEvent.eventName, { bubbles: true, composed: true });
  }
}

export class PatchEvent extends Event {
  constructor() {
    super('patch', { bubbles: true, composed: true });
  }
}

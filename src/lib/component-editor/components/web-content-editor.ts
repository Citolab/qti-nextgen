import { LitElement, nothing, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { provide } from '@lit/context';
import { editContext, EditContext } from '../context/logger';
import { ContentFunc, Diff, MyModuleInterface } from '../src/types';
import { XmlSelection, xmlSelectionContext } from '../context/selection';
import { RedoEvent, UndoEvent, WebCanvas } from './web-canvas/web-canvas';
import { DiffDOM } from 'diff-dom';

import { html, signal } from '@lit-labs/signals';
import { xmlRootNodeName } from '../elements/this-is-the-root-tag';
import {
  populateCanvases as normalizeCanvasElements,
  createEmptyPatchDocument,
  formatXml
} from './xml-store/xml-store.functions';
import { xPath } from './xml-store/libs/xpath/Xpath';
import { findElement, getUpperParent } from './utilities';

export const signalPatch = signal([] as Diff[]);
export const signalCanvases = signal([] as Element[]);
export const signalSelection = signal(null as StaticRange);

@customElement('web-content-editor')
export class WebContentEditor extends LitElement {
  // Providing contexts for logger and selection

  private _patchAgainstXMLDocument: XMLDocument;

  // ------------------ PRIVATE -----------------
  private _diffDOM: DiffDOM = new DiffDOM({});
  private _diffs: { diffs: Diff[]; collapsed: boolean; startOffset: number; endOffset: number }[] = [];
  private _redoDiffs: { diffs: Diff[]; collapsed: boolean; startOffset: number; endOffset: number }[] = [];

  // ------------------ PUBLIC ------------------
  public xmlDocument: XMLDocument;
  public xmlCanvasElements: Element[];
  activeElement: HTMLElement;

  // ------------------ REACTIVE PROPERTIES ------------------

  // you can specify a canvas-selector to select multiple canvasses
  canvasSelector: string = xmlRootNodeName; // default to the root node

  @provide({ context: editContext })
  @state()
  public logger: EditContext = this.createEditContext();

  @provide({ context: xmlSelectionContext })
  @state()
  public selection: XmlSelection = {
    canvas: null,
    range: null,
    type: 'caret',
    element: null
  };

  @property({ type: String, reflect: true, attribute: 'myxml' })
  public xml: string = '';

  // protected update(changedProperties: PropertyValues): void {
  //   super.update(changedProperties);
  //   // If xml changes, we need to update the XMLStore
  //   // if (changedProperties.has('xml')) {
  //   //   this.logger.xmlStore.initializeXML(this.xml);
  //   // }

  //   this.initializeXML(this.xml);

  //   // If canvasSelector changes, we need to update the XMLStore's canvasSelector
  //   // if (changedProperties.has('canvasSelector')) {
  //   //   this.logger.xmlStore.canvasSelector = this.canvasSelector;
  //   // }
  //   this.canvasSelector = this.canvasSelector || xmlRootNodeName; // Ensure canvasSelector is set
  // }

  private diffDOM = new DiffDOM({
    preDiffApply: info => info.diff.action === 'removeAttribute' && true
  });



  connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('selectionchange', this._selectionChangedHandler.bind(this));

  }

  // ------------------ PUBLIC ------------------

  constructor() {
    super();
    this.loadCustomElements();
    this.addEventListener('canvas-selectionchange', this.onCanvasSelectionChange);

    this.addEventListener(UndoEvent.eventName, (event: UndoEvent) => {
      const range = this.undo(event.canvas);
      event.range = range;
    });
    this.addEventListener(RedoEvent.eventName, (event: UndoEvent) => {
      const range = this.undo(event.canvas);
      event.range = range;
    });
  }

  private _observerMutations: any[];

  initializeXML(xml: string): void {
    const parser = new DOMParser();
    const filledDoc = parser.parseFromString(`<${xmlRootNodeName}>${xml}</${xmlRootNodeName}>`, 'text/xml');

    filledDoc.normalize();

    filledDoc.createElement = (tagName: string) => {
      // we need override the createElement to create elements without namespace
      return filledDoc.createElementNS(null, tagName.toLocaleLowerCase());
    };

    this.xmlDocument = filledDoc;

    this.xmlCanvasElements = Array.from(this.xmlDocument.querySelectorAll(this.canvasSelector));
    normalizeCanvasElements(this.xmlCanvasElements);

    this._patchAgainstXMLDocument = createEmptyPatchDocument(xmlRootNodeName);

    this.apply(false);

    // this.dispatchEvent(new CanvasesEvent(this.xmlCanvasElements));
    signalCanvases.set(this.xmlCanvasElements);

    this._observeXMLMutations();
  }

  public updateXML(contentFunc: ContentFunc, data?: string) {
    // @ts-ignore ignore the fact that this.getRootNode() is a shadowRoot, Chrome and Edge support this, Safari and Firefox don't
    const range = this.getRootNode().getSelection().getRangeAt(0); // kan ook renderroot zijn
    const xmlRange = this.createRangeXML(range);
    const xmlSelectionRange = contentFunc(xmlRange, data);
    this.apply();
    signalSelection.set(xmlSelectionRange);
  }

  public addNewContent(data?: string) {
    const xmlRange = this.createRangeXML(this.logger.xmlRange);

    //create new div
    const newContent = this.xmlDocument.createElement('div');
    newContent.innerHTML = data;

    const upperParentNode = getUpperParent(xmlRange);
    //place in new html tag after current position or replace when empty
    if (upperParentNode.textContent.trim()) {
      getUpperParent(xmlRange).after(newContent);
    } else {
      getUpperParent(xmlRange).replaceWith(newContent);
    }

    const xmlSelectionRange = {
      endContainer: newContent,
      endOffset: 0,
      collapsed: true,
      startContainer: newContent,
      startOffset: 0
    };

    this.apply();
    signalSelection.set(xmlSelectionRange);
  }

  public editContent(el: Element, value?: string) {
    const xmlRange = this.createRangeXML(this.logger.xmlRange);
    const xmlEl = findElement(xmlRange, el.nodeName);
    xmlEl.outerHTML = value;

    const xmlSelectionRange = {
      endContainer: xmlEl,
      endOffset: 0,
      collapsed: true,
      startContainer: xmlEl,
      startOffset: 0
    };

    this.apply();
    signalSelection.set(xmlSelectionRange);
  }

  changeSelection(range: StaticRange) {
    const rangeXML = this.createRangeXML(range);
    this.logger.xmlRange = rangeXML;
    signalSelection.set(range);
  }

  public findXMLNode(node: Node): Node | Element | null {
    const regexa = new RegExp(`(${xmlRootNodeName}.*)`);
    const match = xPath(node).match(regexa);
    const xPathAbsolute = match ? `/${match[1]}` : ``;

    const xmlNodesFromCaret = this.xmlDocument.evaluate(
      xPathAbsolute,
      this.xmlDocument,
      null,
      XPathResult.ANY_TYPE,
      null
    );
    const result = xmlNodesFromCaret.iterateNext(); // https://jsfiddle.net/wnsybga9/
    if (!result) throw `XML Node not found on: "${result}"`;
    return result;
  }

  public undo(_: Element) {
    if (this._diffs.length === 0) return null;
    const df = this._diffs.pop()!;
    this._redoDiffs.push(df);
    this._diffDOM.undo(this.xmlDocument.documentElement, df.diffs);

    this.apply(false);
    return {
      firstRoute: df.diffs.length > 0 ? df.diffs[0].route : [],
      lastRoute: df.diffs.length > 0 ? df.diffs[df.diffs.length - 1].route : [],
      collapsed: df.collapsed,
      startOffset: df.startOffset,
      endOffset: df.endOffset
    };
  }

  public redo(_: Element) {
    if (this._redoDiffs.length === 0) return null;
    const df = this._redoDiffs.pop()!;
    this._diffs.push(df);
    this._diffDOM.undo(this.xmlDocument.documentElement, df.diffs);
    this.apply(false);
    return {
      firstRoute: df.diffs.length > 0 ? df.diffs[0].route : [],
      lastRoute: df.diffs.length > 0 ? df.diffs[df.diffs.length - 1].route : [],
      startOffset: df.startOffset,
      collapsed: df.collapsed,
      endOffset: df.endOffset
    };
  }

  public determineXpathNode(el: Element | Node): string {
    return xPath(el);
  }

  public createRangeXML(range: StaticRangeInit): Range {
    const { startContainer, startOffset, endContainer, endOffset } = range;

    const scXML = this.findXMLNode(startContainer);
    const ecXML = this.findXMLNode(endContainer);

    const rangeXML = this.xmlDocument.createRange();
    rangeXML.setStart(scXML, startOffset);
    rangeXML.setEnd(ecXML, endOffset);

    return rangeXML as unknown as Range;
  }

  public apply(store = true): void {
    // @ts-ignore ignore the fact that this.getRootNode() is a shadowRoot, Chrome and Edge support this, Safari and Firefox don't
    const selection = document.getSelection() as unknown as {
      collapsed: boolean;
      baseOffset: number;
      extentOffset: number;
    };

    const diffs = this._diffDOM.diff(
      this._patchAgainstXMLDocument.documentElement,
      this.xmlDocument.documentElement
    ) as Diff[];
    this._patchAgainstXMLDocument = this.xmlDocument.cloneNode(true) as XMLDocument;

    if (store) {
      this._redoDiffs = [];
      this._diffs.push({
        diffs,
        collapsed: selection.collapsed,
        startOffset: Math.min(selection.baseOffset, selection.extentOffset),
        endOffset: Math.max(selection.baseOffset, selection.extentOffset)
      });
    }
    // this.dispatchEvent(new PatchEvent(diffs));
    signalPatch.set(diffs);
  }

  private _observeXMLMutations(): void {
    const config = { attributes: false, childList: true, subtree: true, characterData: true };
    const callback = (mutations: MutationRecord[], observer: MutationObserver): void => {
      this._observerMutations = [this._observerMutations, ...mutations];

      mutations.forEach(mutation => {
        this.dispatchEvent(
          new XmlUpdateEvent({
            mutation: mutation,
            xml: formatXml(this.xmlDocument.documentElement.firstElementChild)
          })
        );
      });
    };
    const observer = new MutationObserver(callback);
    observer.observe(this.xmlDocument, config);
  }

  /**
   * Renders the editor's content. If there are supported elements, it renders the slot.
   */
  render() {
    return html`${this.logger.elms.size ? html`<slot></slot>` : nothing}`;
  }

  // ------------------ PRIVATE ------------------

  /**
   * Creates a logger with a variety of utility functions for managing elements, ranges, and content in XML.
   */
  private createEditContext(): EditContext {
    // const xmlStore = new XMLStore();
    // xmlStore.addEventListener(PatchEvent.eventName, (event: PatchEvent) => {
    //   signalPatch.set(event.diffs);
    // });
    // xmlStore.addEventListener(XmlUpdateEvent.eventName, (event: XmlUpdateEvent) => {
    //   this.dispatchEvent(new CustomEvent('xml-store-xml', { detail: event.xml, bubbles: true, composed: true }));
    // });
    // xmlStore.addEventListener(CanvasesEvent.eventName, (event: CanvasesEvent) => {
    //   signalCanvases.set(event.canvases);
    // });

    return {
      elms: new Map<string, MyModuleInterface>(),
      // web-canvas functions
      updateXML: (fn: (xmlRange: Range) => StaticRange) => this.updateXML(fn),

      // info-canvas functions
      applyDiffs: (docEl, diffs: Diff[]) => this.diffDOM.apply(docEl, diffs),
      xpath: (node: Node) => this.determineXpathNode(node),

      // for download
      doc: () => this.xmlDocument,

      // co-pilot ( add text when tab is pressed)
      xmlNode: (node: Node) => this.findXMLNode(node),

      // ai functions, add new content, edit content, change selection
      canvases: () => this.xmlCanvasElements,
      addNewContent: value => this.addNewContent(value),
      editContent: (el, value) => this.editContent(el, value),
      // changeSelection: range => this.webCanvas.changeSelection(range),

      createRangeXML: (range: StaticRangeInit) => this.createRangeXML(range),
      apply: () => this.apply(),

      xmlRange: null
    };
  }

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
    if (signalCanvases.get().some(canvas => canvas.contains(focusNode))) {
      const xmlRange = this.createRangeXML(range);
      this.logger.xmlRange = xmlRange;

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

  /**
   * Loads custom elements dynamically based on the `supported-elements` attribute.
   * Imported modules are added to the `elms` map in `logger`, and styles are applied if provided.
   */
  private async loadCustomElements() {
    const elementNames = this.getAttribute('supported-elements')?.split(' ') || [];
    const elementPromises = elementNames.map(el => import(`../elements/${el}.ts`).catch(e => e));

    const loadedModules = await Promise.all(elementPromises);
    const validModules = loadedModules.filter(module => !(module instanceof Error));
    const elms = new Map<string, MyModuleInterface>();

    validModules.forEach((module: MyModuleInterface) => {
      elms.set(module.identifier, module);
      if (module.style) this.applyStyleSheet(module.style);
    });

    this.logger = { ...this.logger, elms };
  }

  /**
   * Handles `canvas-selectionchange` events to update the selection state.
   * @param event - The custom event containing the new selection data.
   */
  private onCanvasSelectionChange(event: CustomEvent<XmlSelection>) {
    this.selection = event.detail;
  }

  /**
   * Applies a CSS stylesheet to the document, supporting modular styles from custom elements.
   * @param styleContent - The CSS content to apply.
   */
  private applyStyleSheet(styleContent: string) {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(styleContent);
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  }
}

export class XmlUpdateEvent extends Event {
  static readonly eventName = 'xml-store-xml';
  constructor(public xml: { mutation: MutationRecord; xml: string }) {
    super(XmlUpdateEvent.eventName, { bubbles: true, composed: true });
  }
}

export class CanvasesEvent extends Event {
  static readonly eventName = 'canvases';
  constructor(public canvases: Element[]) {
    super(CanvasesEvent.eventName, { bubbles: true, composed: true });
  }
}

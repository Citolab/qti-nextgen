import { html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { createContext, provide } from '@lit/context';
import { editContext, EditContext } from '../context/logger';
import { ContentFunc, Diff, MyModuleInterface } from '../src/types';
import { XmlSelection, xmlSelectionContext } from '../context/selection';
import { MyInputEvent, RedoEvent, UndoEvent } from './web-canvas/web-canvas';

import * as InputEvents from './web-canvas/input-events';

import { DiffDOM } from 'diff-dom';

import { xmlRootNodeName } from '../elements/this-is-the-root-tag';
import {
  populateCanvases as normalizeCanvasElements,
  createEmptyPatchDocument,
  formatXml
} from './xml-store/xml-store.functions';
import { xPath } from './xml-store/libs/xpath/Xpath';
import { findElement, getUpperParent } from './utilities';

export const patchContext = createContext<Diff[]>('signalPatch');
export const canvasesContext = createContext<Element[]>('signalCanvases');
export const selectionContext = createContext<StaticRange>('signalSelection');
@customElement('web-content-editor')
export class WebContentEditor extends LitElement {
  private _patchAgainstXMLDocument: XMLDocument;

  private _diffDOM: DiffDOM = new DiffDOM({});
  private _diffs: { diffs: Diff[]; collapsed: boolean; startOffset: number; endOffset: number }[] = [];
  private _redoDiffs: { diffs: Diff[]; collapsed: boolean; startOffset: number; endOffset: number }[] = [];

  public xmlDocument: XMLDocument;
  public xmlCanvasElements: Element[];
  activeElement: HTMLElement;

  @property({ type: String, reflect: true, attribute: 'canvas-selector' })
  canvasSelector: string = xmlRootNodeName; // default to the root node

  @provide({ context: patchContext })
  public signalPatch = [] as Diff[];

  @provide({ context: canvasesContext })
  public signalCanvases = [] as Element[];

  @provide({ context: selectionContext })
  public signalSelection = null as StaticRange;

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

  private diffDOM = new DiffDOM({
    preDiffApply: info => info.diff.action === 'removeAttribute' && true
  });

  constructor() {
    super();
    // Restore API_KEY from localStorage if available
    const storedKey = localStorage.getItem('API_KEY');
    if (storedKey) {
      this.logger = { ...this.logger, API_KEY: storedKey };
    }
    this.addEventListener('canvas-selectionchange', this.onCanvasSelectionChange.bind(this));
    this.addEventListener(MyInputEvent.eventName, this.InputEventHandler.bind(this));
    this.addEventListener(UndoEvent.eventName, this.undo.bind(this));
    this.addEventListener(RedoEvent.eventName, this.redo.bind(this));
  }

  async connectedCallback(): Promise<void> {
    super.connectedCallback();
    await this.updateComplete; // wait for the element to be fully initialized
    this.dispatchEvent(
      new Event('web-content-editor-initialized', {
        bubbles: true,
        composed: true
      })
    );
  }

  initialize(xml: string, options: { supportedElements?: string; canvasSelector?: string }) {
    this.canvasSelector = options.canvasSelector || xmlRootNodeName;
    this.loadCustomElements(
      options.supportedElements?.split(' ') || ['p', 'h1', 'this-is-the-root-tag', 'em', 'strong', 'ul', 'li']
    );
    this.initializeXML(xml);
  }

  public async InputEventHandler(event: MyInputEvent): Promise<void> {
    const { inputType, range, data } = event.data;
    const xmlRange = this.createRangeXML(range);

    this.dispatchEvent(new BeforeInputEvent({ inputType, xmlRange, data }));

    let selectionRange = InputEvents[inputType](this.logger.elms, xmlRange, data);

    event.range = selectionRange;

    this.apply();
  }

  private _observerMutations: any[];

  initializeXML(xml: string): void {
    const parser = new DOMParser();

// in the xml strip all whitespace and newlines between elements
    const filledDoc = parser.parseFromString(`<${xmlRootNodeName}>${xml}</${xmlRootNodeName}>`, 'text/xml');
    filledDoc.normalize();
    filledDoc.createElement = (tagName: string) => {
      // we need override the createElement to create elements without namespace
      return filledDoc.createElementNS(null, tagName.toLocaleLowerCase());
    };

    this.xmlDocument = filledDoc;

    this.xmlCanvasElements = Array.from(this.xmlDocument.querySelectorAll(this.canvasSelector));
    this._observeXMLMutations();
    normalizeCanvasElements(this.xmlCanvasElements);

    this._patchAgainstXMLDocument = createEmptyPatchDocument(xmlRootNodeName);

    this.apply(false);

    // this.dispatchEvent(new CanvasesEvent(this.xmlCanvasElements));
    this.signalCanvases = this.xmlCanvasElements;
  }

  public updateXML(contentFunc: ContentFunc, data?: string) {
    // @ts-ignore ignore the fact that this.getRootNode() is a shadowRoot, Chrome and Edge support this, Safari and Firefox don't
    const range = this.getRootNode().getSelection().getRangeAt(0); // kan ook renderroot zijn
    const xmlRange = this.createRangeXML(range);
    const xmlSelectionRange = contentFunc(xmlRange, data);
    this.apply();
    this.signalSelection = xmlSelectionRange;
  }

  public addNewContent(data?: string) {
    const xmlRange = this.createRangeXML(this.logger.xmlRange);

    //create new div
    const newContent = this.xmlDocument.createElement('div');
    newContent.innerHTML = data;

    const upperParentNode = getUpperParent(xmlRange, this.xmlCanvasElements);
    //place in new html tag after current position or replace when empty
    if (upperParentNode.textContent.trim()) {
      getUpperParent(xmlRange, this.xmlCanvasElements).after(newContent);
    } else {
      getUpperParent(xmlRange, this.xmlCanvasElements).replaceWith(newContent);
    }

    const xmlSelectionRange = {
      endContainer: newContent,
      endOffset: 0,
      collapsed: true,
      startContainer: newContent,
      startOffset: 0
    };

    this.apply();
    this.signalSelection = xmlSelectionRange;
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
    this.signalSelection = xmlSelectionRange;
  }

  changeSelection(range: StaticRange) {
    const rangeXML = this.createRangeXML(range);
    this.logger.xmlRange = rangeXML;
    this.signalSelection = range;
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

  public undo(event: UndoEvent) {
    if (this._diffs.length === 0) return null;
    const df = this._diffs.pop()!;
    this._redoDiffs.push(df);
    this._diffDOM.undo(this.xmlDocument.documentElement, df.diffs);

    this.apply(false);
    event.range = {
      firstRoute: df.diffs.length > 0 ? df.diffs[0].route : [],
      lastRoute: df.diffs.length > 0 ? df.diffs[df.diffs.length - 1].route : [],
      collapsed: df.collapsed,
      startOffset: df.startOffset,
      endOffset: df.endOffset
    };
  }

  public redo(event: UndoEvent) {
    if (this._redoDiffs.length === 0) return null;
    const df = this._redoDiffs.pop()!;
    this._diffs.push(df);
    this._diffDOM.undo(this.xmlDocument.documentElement, df.diffs);
    this.apply(false);
    event.range = {
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
    // signalPatch.set(diffs);
    this.signalPatch = diffs;
  }

  private _observeXMLMutations(): void {
    const config = { attributes: false, childList: true, subtree: true, characterData: true };
    const callback = (mutations: MutationRecord[], observer: MutationObserver): void => {
      this._observerMutations = [this._observerMutations, ...mutations];

      mutations.forEach(mutation => {
        this.dispatchEvent(
          new XmlUpdateEvent({
            mutation: mutation,
            xml: formatXml(this.xmlDocument.documentElement)
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
    return html`
      <input
        type="text"
        .value="${this.logger.API_KEY ?? ''}"
        @input="${(e: Event) => this._onApiKeyInput(e)}"
        placeholder="Enter API Key"
        style="position: absolute; top: 0; left: 0; width: 100%; z-index: 1000; background: white; border: 1px solid #ccc; padding: 8px;"
      />
      ${this.logger.elms.size ? html`<slot></slot>` : nothing}
    `;
  }

  private _onApiKeyInput(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    this.logger = { ...this.logger, API_KEY: value };
    localStorage.setItem('API_KEY', value);
  }

  // ------------------ PRIVATE ------------------

  /**
   * Creates a logger with a variety of utility functions for managing elements, ranges, and content in XML.
   */
  private createEditContext(): EditContext {
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
      changeSelection: range => this.changeSelection(range),

      createRangeXML: (range: StaticRangeInit) => this.createRangeXML(range),
      apply: () => this.apply(),
      API_KEY: '',

      xmlRange: null
    };
  }

  /**
   * Loads custom elements dynamically based on the `supported-elements` attribute.
   * Imported modules are added to the `elms` map in `logger`, and styles are applied if provided.
   */
  private async loadCustomElements(supportedElements: string[] = []): Promise<void> {
    const elementNames = supportedElements;
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
    if (event.detail == null) return;
    const xmlRange = this.createRangeXML(event.detail.range);
    this.logger.xmlRange = xmlRange;

    const adetail = {
      type: event.detail.type,
      canvas: event.detail.canvas,
      range: {
        startOffset: xmlRange.startOffset,
        endOffset: xmlRange.endOffset,
        startContainer: xmlRange.startContainer,
        endContainer: xmlRange.endContainer,
        collapsed: xmlRange.collapsed
      },
      element: xmlRange.commonAncestorContainer
    };

    this.selection = adetail;
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

export class BeforeInputEvent extends Event {
  static readonly eventName = 'before-input';
  constructor(public data: { inputType: string; xmlRange: StaticRange; data: string }) {
    super(BeforeInputEvent.eventName, { bubbles: true, composed: true });
  }
}
declare global {
  interface HTMLElementEventMap {
    [XmlUpdateEvent.eventName]: XmlUpdateEvent;
    [CanvasesEvent.eventName]: CanvasesEvent;
    [BeforeInputEvent.eventName]: BeforeInputEvent;
  }
}

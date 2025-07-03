import { DiffDOM } from 'diff-dom';
import { Diff } from '../../src/types';
import { xPath } from './libs/xpath/Xpath';
import {
  populateCanvases as normalizeCanvasElements,
  createEmptyPatchDocument,
  formatXml
} from './xml-store.functions';
import { xmlRootNodeName } from '../../elements/this-is-the-root-tag';

export declare class XMLInterface {
  xmlDocument: XMLDocument;
  xmlCanvasElements: Element[];
  canvasSelector: string;
  xml: string;
  findXMLNode(node: Node): Node | Element | null;
  undo(
    el: Element
  ): { firstRoute: number[]; lastRoute: number[]; collapsed: boolean; startOffset: number; endOffset: number } | null;
  redo(
    el: Element
  ): { firstRoute: number[]; lastRoute: number[]; startOffset: number; collapsed: boolean; endOffset: number } | null;
  determineXpathNode(el: Element | Node): string;
  createRangeXML(range: StaticRangeInit): Range;
  apply(store?: boolean): void;
}

export class XMLStore extends EventTarget {
  private _patchAgainstXMLDocument: XMLDocument;

  // ------------------ PRIVATE -----------------
  private _diffDOM: DiffDOM = new DiffDOM({});
  private _diffs: { diffs: Diff[]; collapsed: boolean; startOffset: number; endOffset: number }[] = [];
  private _redoDiffs: { diffs: Diff[]; collapsed: boolean; startOffset: number; endOffset: number }[] = [];

  // ------------------ PUBLIC ------------------
  public xmlDocument: XMLDocument;
  public xmlCanvasElements: Element[];

  // ------------------ REACTIVE PROPERTIES ------------------

  // you can specify a canvas-selector to select multiple canvasses
  canvasSelector: string = xmlRootNodeName; // default to the root node

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

    this.dispatchEvent(new CanvasesEvent(this.xmlCanvasElements));
    this._observeXMLMutations();
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
    this.dispatchEvent(new PatchEvent(diffs));
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
}

export class PatchEvent extends Event {
  constructor(public diffs: Diff[]) {
    super('patched', { bubbles: true, composed: true });
  }
}

export class XmlUpdateEvent extends Event {
  constructor(public xml: { mutation: MutationRecord; xml: string }) {
    super('xml-store-xml', { bubbles: true, composed: true });
  }
}

export class CanvasesEvent extends Event {
  constructor(public canvases: Element[]) {
    super('canvases', { bubbles: true, composed: true });
  }
}

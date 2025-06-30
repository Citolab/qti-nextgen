import { DiffDOM } from 'diff-dom';
import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Diff } from '../../src/types';
import { xPath } from './libs/xpath/Xpath';
import { populateCanvases as normalizeCanvasElements, createEmptyPatchDocument } from './xml-store.functions';
import { xmlRootNodeName } from '../../elements/this-is-the-root-tag';

@customElement('xml-store')
export class XmlStore extends LitElement {
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
  @property({ type: String, attribute: 'canvas-selector' })
  canvasSelector: string = xmlRootNodeName; // default to the root node

  @property({ type: String, attribute: 'xml' })
  xml: string = '';
  _observerMutations: any[];
  // like watch, but better..
  updated(changedProperties: Map<string, unknown>) {
    changedProperties.has('xml') && this.xml !== '' && this._initializeXML();
  }

  _initializeXML() {
    // this.xmlDocument = document.implementation.createDocument('', '', null);
    
    const parser = new DOMParser()
    const filledDoc = parser.parseFromString(`<${xmlRootNodeName}>${this.xml}</${xmlRootNodeName}>`, 'text/xml');
    
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
    
    this.dispatchEvent(new CustomEvent('canvases', { detail: this.xmlCanvasElements, composed: true, bubbles: true }));
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
    const selection = this.closest('web-content-editor').getRootNode().getSelection() as unknown as {
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
    this.dispatchEvent(new CustomEvent('patched', { detail: diffs, composed: true, bubbles: true }));
  }

  // this.dispatchEvent(
  //   new CustomEvent('xml-store-xml', {
  //     detail: {
  //       xml: formatXml(this.xmlDocument.documentElement)
  //     },
  //     bubbles: true
  //   })
  // );

  private _observeXMLMutations(): void {
    const config = { attributes: false, childList: true, subtree: true, characterData: true };
    const callback = (mutations: MutationRecord[], observer: MutationObserver): void => {
      this._observerMutations = [this._observerMutations, ...mutations];
      
      // console.log('mutations', mutations);
      // const div = document.querySelector('#observedMutationClone');
      // applyMutationsToTarget(mutations, div);

      mutations.forEach(mutation => {
        this.dispatchEvent(
          new CustomEvent('xml-store-xml', {
            detail: {
              mutation: mutation,
              xml: formatXml(this.xmlDocument.documentElement.firstElementChild)
            },
            bubbles: true
          })
        );
      });
    };
    const observer = new MutationObserver(callback);
    observer.observe(this.xmlDocument, config);
  }
}

function formatXml(xmlDoc: Element) {
  const xsltProcessor = new XSLTProcessor();
  const xsltDoc = new DOMParser().parseFromString(
    [
      '<?xml version="1.0"?>',
      '<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">',
      '<xsl:output method="xml" indent="yes"/>',
      '  <xsl:template match="@*|node()">',
      '    <xsl:copy>',
      '      <xsl:apply-templates select="node()|@*"/>',
      '    </xsl:copy>',
      '  </xsl:template>',
      '</xsl:stylesheet>'
    ].join('\n'),
    'application/xml'
  );

  xsltProcessor.importStylesheet(xsltDoc);
  const resultDoc = xsltProcessor.transformToDocument(xmlDoc);
  const resultXml = new XMLSerializer().serializeToString(resultDoc);

  return resultXml;
}

// function findEquivalentNode(sourceNode: Node, targetRoot: Node): Node | null {
//   const path = getNodePath(sourceNode);
//   return getNodeByPath(targetRoot, path);
// }

// function getNodePath(node: Node): number[] {
//   const path: number[] = [];
//   while (node.parentNode) {
//     const siblings = Array.from(node.parentNode.childNodes);
//     path.unshift(siblings.indexOf(node));
//     node = node.parentNode;
//   }
//   return path;
// }

// function getNodeByPath(root: Node, path: number[]): Node | null {
//   let current: Node | null = root;
//   for (const index of path) {
//     if (!current || !current.childNodes || current.childNodes.length <= index) {
//       return null;
//     }
//     current = current.childNodes[index];
//   }
//   return current;
// }

// function applyMutationsToTarget(mutations: MutationRecord[], targetNode: Node): void {
//   mutations.forEach(mutation => {
//     switch (mutation.type) {
//       case 'childList':
//         // Handle added nodes
//         mutation.addedNodes.forEach(node => {
//           const clone = node.cloneNode(true);
//           const refNode = mutation.nextSibling || null;
//           const parent = findEquivalentNode(mutation.target, targetNode);
//           if (parent) parent.insertBefore(clone, refNode);
//         });

//         // Handle removed nodes
//         mutation.removedNodes.forEach(node => {
//           const parent = findEquivalentNode(mutation.target, targetNode);
//           const matching = Array.from(parent?.childNodes || []).find(n => n.isEqualNode(node));
//           if (parent && matching) parent.removeChild(matching);
//         });
//         break;

//       case 'characterData':
//         const targetTextNode = findEquivalentNode(mutation.target, targetNode);
//         if (targetTextNode && targetTextNode.nodeType === Node.TEXT_NODE) {
//           targetTextNode.textContent = mutation.target.textContent;
//         }
//         break;

//       case 'attributes':
//         const targetElem = findEquivalentNode(mutation.target, targetNode) as Element;
//         const sourceElem = mutation.target as Element;
//         if (targetElem && sourceElem) {
//           const attrName = mutation.attributeName!;
//           const attrValue = sourceElem.getAttribute(attrName);
//           if (attrValue === null) {
//             targetElem.removeAttribute(attrName);
//           } else {
//             targetElem.setAttribute(attrName, attrValue);
//           }
//         }
//         break;
//     }
//   });
// }

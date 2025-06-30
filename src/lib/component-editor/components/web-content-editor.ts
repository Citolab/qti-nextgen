import { LitElement, nothing, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { XmlStore } from './xml-store/xml-store';
import { provide } from '@lit/context';
import { editContext, EditContext } from '../context/logger';
import { Diff, MyModuleInterface } from '../src/types';
import { XmlSelection, xmlSelectionContext } from '../context/selection';
import { WebCanvas } from './web-canvas/web-canvas';
import { DiffDOM } from 'diff-dom';

@customElement('web-content-editor')
export class WebContentEditor extends LitElement {
  
  // Providing contexts for logger and selection
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

  xmlStore: XmlStore;
  webCanvas: WebCanvas;

  connectedCallback(): void {
    super.connectedCallback();
    this.xmlStore = this.querySelector('xml-store') as XmlStore;
    this.webCanvas = this.querySelector('web-canvas') as WebCanvas;
  }

  // ------------------ PUBLIC ------------------

  constructor() {
    super();
    this.loadCustomElements();
    this.addEventListener('canvas-selectionchange', this.onCanvasSelectionChange);
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
    return {
      elms: new Map<string, MyModuleInterface>(),
      // web-canvas functions
      updateXML: (fn: (xmlRange: Range) => StaticRange) => this.webCanvas.updateXML(fn),

      // info-canvas functions
      applyDiffs: (docEl, diffs: Diff[]) => this.diffDOM.apply(docEl, diffs),
      xpath: (node: Node) => this.xmlStore.determineXpathNode(node),

      // for download
      doc: () => this.xmlStore.xmlDocument,

      // co-pilot ( add text when tab is pressed)
      xmlNode: (node: Node) => this.xmlStore.findXMLNode(node),

      // ai functions, add new content, edit content, change selection
      canvases: () => this.xmlStore.xmlCanvasElements,
      addNewContent: value => this.webCanvas.addNewContent(value),
      editContent: (el, value) => this.webCanvas.editContent(el, value),
      changeSelection: range => this.webCanvas.changeSelection(range),
      
      xmlRange: null
    };
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

import { insertText } from '../web-canvas/input-events';
import { RangeXML } from '../../src/RangeXML';
import { XmlStore } from './xml-store';

describe('XmlStore', () => {
  it('undo - add text', () => {
    const content = `<div>
                    <p>hoi</p>
                </div>`;

    const xmlStore = new XmlStore();
    xmlStore.xml = content;
    xmlStore['_initializeXML'](); // private function, hence the bracket notation

    const clonedDoc = new DOMParser().parseFromString(content, 'text/html');

    const fakedHtml = clonedDoc.documentElement.firstElementChild;
    const p = xmlStore.xmlDocument.querySelector('p') as HTMLElement;

    const range = {
      startContainer: p.firstChild,
      startOffset: 0,
      endContainer: p.firstChild,
      endOffset: 0
    } as StaticRangeInit;

    const staticRange: StaticRange = new StaticRange(range);

    const rangeXML = new RangeXML(range);
    const result = insertText([], rangeXML, 'a');
    xmlStore.apply();
    expect(p.innerHTML).toBe('ahoi');
    xmlStore.undo(fakedHtml);
    expect(p.innerHTML).toBe('hoi');
  });

  // it('undo - merge paragraph', () => {
  //   const content = `<div>
  //                   <h1>hoi</h1>
  //                   <p>tekst</p>
  //               </div>`;

  //   const xmlStore = new XmlStore();
  //   xmlStore.xml = content;
  //   xmlStore.initializeXML();

  //   // clone docNode
  //   const clonedDoc = xmlStore.doc.cloneNode(true) as Document;
  //   const fakedHtml = clonedDoc.documentElement.firstElementChild;

  //   const p = xmlStore.doc.querySelector('p') as HTMLElement;
  //   const h1 = xmlStore.doc.querySelector('h1') as HTMLElement;
  //   const range = {
  //     startContainer: h1.firstChild,
  //     startOffset: h1.firstChild.textContent.length,
  //     endContainer: p,
  //     endOffset: 0
  //   } as StaticRangeInit;
  //   const rangeXML = new RangeXML(range);
  //   deleteContentBackward([], rangeXML);

  //   const staticRange: StaticRange = new StaticRange(range);
  //   xmlStore.apply();
  //   xmlStore.undo(fakedHtml);
  //   expect(xmlStore.doc.firstElementChild.innerHTML).not.toContain('xmlns');
  // });

  it('redo - add text', () => {
    const content = `<div>
                    <p>hoi</p>
                </div>`;

    const xmlStore = new XmlStore();
    xmlStore.xml = content;
    xmlStore['_initializeXML'](); // private function, hence the bracket notation

    // clone docNode
    const clonedDoc = xmlStore.xmlDocument.cloneNode(true) as Document;
    const fakedHtml = clonedDoc.firstElementChild;
    const p = xmlStore.xmlDocument.querySelector('p') as HTMLElement;

    // create xmlDocument from content
    // const parser = new DOMParser();
    // const xmlDocument = parser.parseFromString(content, 'application/xml');
    // const p = xmlDocument.querySelector('p') as HTMLElement;
    const range = {
      startContainer: p.firstChild,
      startOffset: 0,
      endContainer: p.firstChild,
      endOffset: 0
    } as StaticRangeInit;

    const staticRange: StaticRange = new StaticRange(range);

    const rangeXML = new RangeXML(range);
    const result = insertText([], rangeXML, 'a');
    xmlStore.apply();
    expect(p.innerHTML).toBe('ahoi');
    xmlStore.undo(fakedHtml);
    expect(p.innerHTML).toBe('hoi');
    xmlStore.redo(fakedHtml);
    expect(p.innerHTML).toBe('ahoi');
  });

  it('redo - cannot work after typing', () => {
    const content = `<div>
                    <p>hoi</p>
                </div>`;

    const xmlStore = new XmlStore();
    xmlStore.xml = content;
    xmlStore['_initializeXML'](); // private function, hence the bracket notation

    // clone docNode
    const clonedDoc = xmlStore.xmlDocument.cloneNode(true) as Document;
    const fakedHtml = clonedDoc.firstElementChild;
    const p = xmlStore.xmlDocument.querySelector('p') as HTMLElement;

    const range = {
      startContainer: p.firstChild,
      startOffset: 0,
      endContainer: p.firstChild,
      endOffset: 0
    } as StaticRangeInit;

    const staticRange: StaticRange = new StaticRange(range);

    const rangeXML = new RangeXML(range);
    insertText([], rangeXML, 'a');
    xmlStore.apply();
    expect(p.innerHTML).toBe('ahoi');
    xmlStore.undo(fakedHtml);
    expect(p.innerHTML).toBe('hoi');
    insertText([], rangeXML, 'b');
    xmlStore.apply();
    xmlStore.redo(fakedHtml); // redo should not work
    expect(p.innerHTML).toBe('bhoi');
  });
});

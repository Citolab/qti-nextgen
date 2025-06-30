import { RangeXML } from '../../../src/RangeXML';
import { deleteContentForward } from './deleteContentForward';
import * as pModule from '../../../elements/p';
import { MyModuleInterface } from '../../../src/types';

const map = new Map<string, MyModuleInterface>([["p", pModule]])


describe('DeleteContentForward', () => {
  it('remove text - end', async () => {
    const content = `<content-item-body>
                    <p>hoi</p>
                </content-item-body>`;

    // create xmlDocument from content
    const parser = new DOMParser();
    const xmlDocument = parser.parseFromString(content, 'application/xml');
    const p = xmlDocument.querySelector('p') as HTMLElement;
    const range = {
      startContainer: p.firstChild,
      startOffset: (p?.firstChild?.textContent?.length || 0) - 1,
      endContainer: p.firstChild,
      endOffset: p?.firstChild?.textContent?.length || 0
    } as StaticRangeInit;

    const rangeXML = new RangeXML(range);
    await deleteContentForward(map, rangeXML);
    expect(p.firstChild?.textContent).toBe('ho');
  });

  it('remove text - merge h1', async () => {
    const content = `<content-item-body>
                    <h1>hoi</h1>
                    <p>tekst</p>
                </content-item-body>`;

    // create xmlDocument from content
    const parser = new DOMParser();
    const xmlDocument = parser.parseFromString(content, 'application/xml');
    const p = xmlDocument.querySelector('p') as HTMLElement;
    const h1 = xmlDocument.querySelector('h1') as HTMLElement;
    const range = {
      startContainer: h1.firstChild,
      startOffset: h1.firstChild?.textContent?.length || 0,
      endContainer: p,
      endOffset: 0
    } as StaticRangeInit;

    const rangeXML = new RangeXML(range);
    const newRange = await deleteContentForward(map, rangeXML);
    const h1Clone = xmlDocument.querySelector('h1') as HTMLElement;
    expect(h1Clone.firstChild?.textContent).toBe('hoitekst');
    expect(newRange.endOffset).toBe(3);
    expect(newRange.startOffset).toBe(3);
  });

  it('remove text - remove entire p content', async () => {
    const content = `<content-item-body>
                    <h1>hoi</h1>
                    <p>tekst</p>
                </content-item-body>`;

    // create xmlDocument from content
    const parser = new DOMParser();
    const xmlDocument = parser.parseFromString(content, 'application/xml');
    const p = xmlDocument.querySelector('p') as HTMLElement;
    const h1 = xmlDocument.querySelector('h1') as HTMLElement;
    const range = {
      startContainer: p.firstChild,
      startOffset: 0,
      endContainer: p.firstChild,
      endOffset: p.firstChild?.textContent?.length || 0
    } as StaticRangeInit;

    const rangeXML = new RangeXML(range);
    await deleteContentForward(map, rangeXML);
    expect(h1?.firstChild?.textContent).toBe('hoi');
    // expect(p?.firstChild as Element).toBeNull();
  });
});

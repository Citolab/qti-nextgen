import { RangeXML } from '../../../src/RangeXML';
import { deleteContentBackward } from './deleteContentBackward';
import { insertCursorsIntoContent, parseContentWithCursors } from '../../../../utilities/xmlwithcursorparser';
import * as pModule from '../../../elements/p';
import * as thisIsTheRootTagModule from '../../../elements/this-is-the-root-tag';
import '../../../../utilities/xmlMatcher';


import { MyModuleInterface } from '../../../src/types';
import { xmlRootNodeName } from '../../../elements/this-is-the-root-tag';

const xml = String.raw;

const map = new Map<string, MyModuleInterface>([
  ["p", pModule],
  [xmlRootNodeName, thisIsTheRootTagModule]
])

describe('DeleteContentBackward', () => {

  it('remove text with nested cursor positions and commonAncestor', async () => {  
      const input = xml`<p>h!¡oi</p>`;
      const assert = xml`<p>!¡oi</p>`;

      const { xmlDocument, range } = parseContentWithCursors(input);  
      const newCursorPosition = await deleteContentBackward(map, range);
      const output = insertCursorsIntoContent(xmlDocument, newCursorPosition)
  
      expect(output).toMatchXml(assert);
  });
  

  it('remove text - merge h1', async () => {
    const input = xml`
      <h1>hoi!</h1>
      <p>¡tekst</p>`;
    const output = xml`<h1>hoi!¡tekst</h1>`;

    const { xmlDocument, range: range } = parseContentWithCursors(input);
    
    const newCursorPosition = await deleteContentBackward(map, range);

    expect(insertCursorsIntoContent(xmlDocument, newCursorPosition)).toMatchXml(output);
  });

  it('remove text - remove entire p content', async () => {
    const content = xml`<${xmlRootNodeName}>
                    <h1>hoi</h1>
                    <p>tekst</p>
                </${xmlRootNodeName}>`;

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
    await deleteContentBackward(map, rangeXML);
    expect(h1.firstChild?.textContent).toBe('hoi');
    // expect(p.firstChild as Element).toBeNull();
  });
});

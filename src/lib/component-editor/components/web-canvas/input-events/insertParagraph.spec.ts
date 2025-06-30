import { RangeXML } from '../../../src/RangeXML';

import { insertParagraph } from './insertParagraph';
import * as pModule from '../../../elements/p';


import '../../../../utilities/xmlMatcher';
import { parseContentWithCursors, insertCursorsIntoContent } from '../../../../utilities/xmlwithcursorparser';
import { MyModuleInterface } from '../../../src/types';
import { xmlRootNodeName } from '../../../elements/this-is-the-root-tag';

const xml = String.raw;

const map = new Map<string, MyModuleInterface>([['p', pModule]]);

describe('InsertParagraph', () => {
  const content = xml`<${xmlRootNodeName}>
    <p>hoi</p>
  </${xmlRootNodeName}>`;
  const getXmlDocument = () => {
    const parser = new DOMParser();
    return parser.parseFromString(content, 'application/xml');
  };
  test('add paragraph - start', async () => {
    const { xmlDocument, range: range } = parseContentWithCursors(xml`
      <${xmlRootNodeName}>
        <p>hoi!¡</p>
      </${xmlRootNodeName}>`);

    const newCursorPosition = await insertParagraph(map, new RangeXML(range) as unknown as Range, '');
    expect(insertCursorsIntoContent(xmlDocument, newCursorPosition)).toMatchXml(xml`
      <${xmlRootNodeName}>
        <p>hoi</p><p>!¡</p>
      </${xmlRootNodeName}>`);
  });

  test('add another paragraph - start', async () => {
    const startXML = xml`<${xmlRootNodeName}>
      <p>hoi</p><p>!¡</p>
    </${xmlRootNodeName}>`;
    const { xmlDocument, range: range } = parseContentWithCursors(startXML);

    const newCursorPosition = await insertParagraph(map, new RangeXML(range) as unknown as Range, '');

    const endXML = xml`
    <${xmlRootNodeName}>
    <p>hoi</p><p /><p>!¡</p>
    </${xmlRootNodeName}>`;
    expect(insertCursorsIntoContent(xmlDocument, newCursorPosition)).toMatchXml(endXML);
  });

  test('add another before paragraph - start', async () => {
    const xmlDocument = getXmlDocument();
    const p = xmlDocument.querySelector('p') as HTMLElement;
    let range = {
      startContainer: p.firstChild,
      startOffset: 0,
      endContainer: p.firstChild,
      endOffset: 0
    } as StaticRangeInit;
    let rangeXML = new RangeXML(range);
    range = await insertParagraph(map, rangeXML as unknown as Range, '');
    rangeXML = new RangeXML(range);
    const result2 = await insertParagraph(map, rangeXML as unknown as Range, '');
    expect(xmlDocument.documentElement.innerHTML.trim()).toBe('<p>hoi</p><p>hoi</p><p>hoi</p>');
  });
});

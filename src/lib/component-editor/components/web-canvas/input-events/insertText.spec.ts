import { insertText } from './insertText';
import * as pModule from '../../../elements/p';
import * as strongModule from '../../../elements/strong';
import { parseContentWithCursors, insertCursorsIntoContent } from './utilities/xmlwithcursorparser';
import './utilities/xmlMatcher';
import { MyModuleInterface } from '../../../src/types';

const xml = String.raw;

const map = new Map<string, MyModuleInterface>();
map.set('p', pModule);
map.set('strong', strongModule);

describe('InsertText', () => {
  it('remove text with nested cursor positions and commonAncestor', async () => {
    const input = xml`<p>!¡hoi</p>`;
    const insert = 'a';
    const output = xml`<p>a!¡hoi</p>`;

    const { xmlDocument, range: range } = parseContentWithCursors(input);

    const newCursorPosition = await insertText(map, range, insert);

    expect(insertCursorsIntoContent(xmlDocument, newCursorPosition)).toMatchXml(output);
  });
  // Test inserting text in the middle of a paragraph
  it('insert text in the middle of content', async () => {
    const input = xml`<p>ho!¡i</p>`;
    const insert = 'l';
    const output = xml`<p>hol!¡i</p>`;

    const { xmlDocument, range } = parseContentWithCursors(input);

    const newCursorPosition = await insertText(map, range, insert);

    expect(insertCursorsIntoContent(xmlDocument, newCursorPosition)).toMatchXml(output);
  });

  // Test inserting text at the end of a paragraph
  it('insert text at the end of content', async () => {
    const input = xml`<p>hoi!¡</p>`;
    const insert = '!';
    const output = xml`<p>hoi!!¡</p>`;

    const { xmlDocument, range } = parseContentWithCursors(input);

    const newCursorPosition = await insertText(map, range, insert);

    expect(insertCursorsIntoContent(xmlDocument, newCursorPosition)).toMatchXml(output);
  });

  // Test inserting text with a selected range (text replacement)
  it('replace selected text with inserted text', async () => {
    const input = xml`<p>h!oi¡</p>`;
    const insert = 'ell';
    const output = xml`<p>hell!¡</p>`;

    const { xmlDocument, range } = parseContentWithCursors(input);

    const newCursorPosition = await insertText(map, range, insert);

    expect(insertCursorsIntoContent(xmlDocument, newCursorPosition)).toMatchXml(output);
  });

  // Test inserting text with multiple elements
  it('insert text with nested elements', async () => {
    const input = xml`<div><p>hello</p><p>w!¡orld</p></div>`;
    const insert = 'o';
    const output = xml`<div><p>hello</p><p>wo!¡orld</p></div>`;

    const { xmlDocument, range } = parseContentWithCursors(input);

    const newCursorPosition = await insertText(map, range, insert);

    expect(insertCursorsIntoContent(xmlDocument, newCursorPosition)).toMatchXml(output);
  });

  // Test inserting text into a complex structure with inline elements
  it('insert text with inline elements', async () => {
    const input = xml`<p>hello <strong>w!¡orld</strong></p>`;
    const insert = 'o';
    const output = xml`<p>hello <strong>wo!¡orld</strong></p>`;

    const { xmlDocument, range } = parseContentWithCursors(input);

    const newCursorPosition = await insertText(map, range, insert);

    expect(insertCursorsIntoContent(xmlDocument, newCursorPosition)).toMatchXml(output);
  });

  // Test inserting text at element boundary
  it('insert text at element boundary', async () => {
    const input = xml`<p>hello!¡ <strong>world</strong></p>`;
    const insert = '!';
    const output = xml`<p>hello!!¡ <strong>world</strong></p>`;

    const { xmlDocument, range } = parseContentWithCursors(input);

    const newCursorPosition = await insertText(map, range, insert);

    expect(insertCursorsIntoContent(xmlDocument, newCursorPosition)).toMatchXml(output);
  });

  // Test inserting multi-character text
  it('insert multiple characters', async () => {
    const input = xml`<p>h!¡i</p>`;
    const insert = 'ello';
    const output = xml`<p>hello!¡i</p>`;

    const { xmlDocument, range } = parseContentWithCursors(input);

    const newCursorPosition = await insertText(map, range, insert);

    expect(insertCursorsIntoContent(xmlDocument, newCursorPosition)).toMatchXml(output);
  });

  // Test inserting text in an empty element
  it('insert text in empty element', async () => {
    const input = xml`<p>!¡</p>`;
    const insert = 'hello';
    const output = xml`<p>hello!¡</p>`;

    const { xmlDocument, range } = parseContentWithCursors(input);

    const newCursorPosition = await insertText(map, range, insert);

    expect(insertCursorsIntoContent(xmlDocument, newCursorPosition)).toMatchXml(output);
  });

});


import '../../../../utilities/xmlMatcher';
import { expect } from 'vitest';
import { userEvent } from '@vitest/browser/context';
import { WebContentEditor } from '../../web-content-editor';
import '../../../index';

function setupEditor(xml: string) {
  document.body.innerHTML = `<web-content-editor><web-canvas></web-canvas></web-content-editor>`;
  const wce = document.body.querySelector<WebContentEditor>('web-content-editor');
  wce.initialize(xml, {});
  return wce;
}

async function setSelectionAndBackspace(wce: WebContentEditor, selection: any) {
  await userEvent.click(wce);
  wce.signalSelection = selection;
  await userEvent.keyboard('{Backspace}');
}


it('should merge the paragraph with the heading', async () => {
  const wce = setupEditor('<h1>Hello</h1><p>World</p>');
  await setSelectionAndBackspace(wce, {
    startContainer: wce.xmlDocument.documentElement.lastElementChild.firstChild as Text,
    startOffset: 0,
    endContainer: wce.xmlDocument.documentElement.lastElementChild.firstChild as Text,
    endOffset: 0,
    collapsed: true,
  });
  expect(wce.xmlDocument.documentElement.innerHTML).toBe('<h1>HelloWorld</h1>');
});


it('should update the display text when user types in the input', async () => {
  const wce = setupEditor('<p>Hello</p>');
  await setSelectionAndBackspace(wce, {
    startContainer: wce.xmlDocument.documentElement.firstElementChild.firstChild as Text,
    startOffset: 4,
    endContainer: wce.xmlDocument.documentElement.firstElementChild.firstChild as Text,
    endOffset: 4,
    collapsed: true,
  });
  expect(wce.xmlDocument.documentElement.innerHTML).toBe('<p>Helo</p>');
});


it('should merge the paragraph with the strong element', async () => {
  const wce = setupEditor('<p>Hello</p><p>World <strong>woei</strong></p>');
  await setSelectionAndBackspace(wce, {
    startContainer: wce.xmlDocument.documentElement.lastElementChild.firstChild as Text,
    startOffset: 0,
    endContainer: wce.xmlDocument.documentElement.lastElementChild.firstChild as Text,
    endOffset: 0,
    collapsed: true,
  });
  expect(wce.xmlDocument.documentElement.innerHTML).toBe('<p>HelloWorld<strong>woei</strong></p>');
});
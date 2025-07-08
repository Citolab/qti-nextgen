import './index';

import { test, expect } from 'vitest';
import { userEvent } from '@vitest/browser/context';
import { xmlRootNodeName } from './elements/this-is-the-root-tag';
import { WebContentEditor } from './index';

test('should update the display text when user types in the input', async () => {
  // Set up the DOM with some HTML
  document.body.innerHTML = `
      <web-content-editor supported-elements="p"><web-canvas></web-canvas></web-content-editor>
    `;

  const root = document.body.querySelector<HTMLElement>(xmlRootNodeName);
  const wce = document.body.querySelector<WebContentEditor>('web-content-editor');
  // Set default content
  wce.initialize('<p>Hello World</p>', {});

  await userEvent.click(root); // Focus the root element
  const paragraph = root.querySelector<HTMLParagraphElement>('p');
  await userEvent.fill(paragraph, 'Hello Vitest');
  expect(wce.xmlDocument.documentElement.innerHTML).toBe('<p>Hello Vitest</p>');
  await userEvent.keyboard('{Backspace}{Backspace}');
  expect(wce.xmlDocument.documentElement.innerHTML).toBe('<p>Hello Vite</p>');
  await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
  await userEvent.keyboard('{enter}');
  expect(wce.xmlDocument.documentElement.innerHTML).toBe('<p>Hello Vi</p><p>te</p>');
  await userEvent.keyboard('{enter}');
  expect(wce.xmlDocument.documentElement.innerHTML).toBe('<p>Hello Vi</p><p></p><p>te</p>');
  await userEvent.keyboard('{Backspace}{ArrowRight}{ArrowRight}{ArrowRight}{Backspace}');
  expect(wce.xmlDocument.documentElement.innerHTML).toBe('<p>Hello Vit</p><p></p>');
});

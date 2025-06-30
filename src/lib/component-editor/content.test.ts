import './index';

import { test, expect } from 'vitest';
import { userEvent } from '@vitest/browser/context';
import { XmlStore } from './index';
import { xmlRootNodeName } from './elements/this-is-the-root-tag';

test('should update the display text when user types in the input', async () => {
  // Set up the DOM with some HTML
  document.body.innerHTML = `
      <web-content-editor supported-elements="p">
        <web-canvas>
          <xml-store></xml-store>
        </web-canvas>
      </web-content-editor>
    `;

  const root = document.body.querySelector<HTMLElement>(xmlRootNodeName);
  const xmlStore = document.body.querySelector<XmlStore>('xml-store');

  // Set default content
  xmlStore.xml = `<p></p>`;

  await userEvent.click(root); // Focus the root element
  const paragraph = root.querySelector<HTMLParagraphElement>('p');
  await userEvent.fill(paragraph, 'Hello Vitest');
  expect(root.innerHTML).toBe('<p>Hello Vitest</p>');
  await userEvent.keyboard('{Backspace}{Backspace}');
  expect(root.innerHTML).toBe('<p>Hello Vite</p>');
  await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
  await userEvent.keyboard('{enter}');
  expect(root.innerHTML).toBe('<p>Hello Vi</p><p>te</p>');
  await userEvent.keyboard('{enter}');
  expect(root.innerHTML).toBe('<p>Hello Vi</p><p><br></p><p>te</p>');
});

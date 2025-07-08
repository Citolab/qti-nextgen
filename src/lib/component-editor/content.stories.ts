import { html } from 'lit';
import { createRef, ref } from 'lit-html/directives/ref.js';
import { within, userEvent, expect } from 'storybook/test';

import './index';
import './style.css';

import './components/selection-logger';

import { Meta, StoryObj } from '@storybook/web-components-vite';
import { xmlRootNodeName } from './elements/this-is-the-root-tag';
import { WebContentEditor, XmlUpdateEvent } from './index';

const meta: Meta = {
  title: 'Core',
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'light' }
  }
};
export default meta;
type Story = StoryObj;

export const Core: Story = {
  render: () => {
    const xmlString = createRef<HTMLPreElement>();

    // called whenever the web-content-editor is initialized
    function initialize(el: WebContentEditor) {
      if (!el) { return }
      el.initialize(`<h1></h1>`, {});
      el.addEventListener('xml-store-xml', (e: XmlUpdateEvent) => {
        xmlString.value.innerText = e.xml.xml;
      });
    }

    return html`
      <web-content-editor class="container mx-auto mt-12 block" ref>
        <web-canvas class="block prose min-h-60 bg-white p-8"></web-canvas>

        <selection-logger></selection-logger>
      </web-content-editor>

      <pre class="block overflow-x-auto border p-4 text-xs text-gray-600" ${ref(xmlString)}></pre>

      <button @click=${() => initialize(document.querySelector('web-content-editor'))}>load XML</button>
    `;
  }
};
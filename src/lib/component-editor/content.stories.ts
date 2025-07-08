import { html } from 'lit';
import { createRef, ref } from 'lit-html/directives/ref.js';

import './index';
import './style.css';
import example from './example.xml?raw';

import './components/selection-logger';

import { Meta, StoryObj } from '@storybook/web-components-vite';

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
      if (!el) return;
      el.addEventListener('web-content-editor-initialized', () => {
        // This is a good place to do any setup that requires the editor to be initialized

        el.initialize(example, {});
        el.addEventListener('xml-store-xml', (e: XmlUpdateEvent) => {
          xmlString.value.innerText = e.xml.xml;
        });
      });
    }

    return html`
      <web-content-editor class="container mx-auto mt-12 grid grid-cols-2" ref=${ref(initialize)}>
        <web-canvas class="prose block min-h-60 bg-white p-8"></web-canvas>
        <pre class="block overflow-x-auto border p-4 text-xs text-gray-600" ${ref(xmlString)}></pre>
        <selection-logger></selection-logger>
      </web-content-editor>

      
    `;
  }
};

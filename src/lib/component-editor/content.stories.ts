import { html } from 'lit';
import { createRef, ref } from 'lit-html/directives/ref.js';

import './index';
// import '../style.css';
import example from './example.xml?raw';

import './components/selection-logger';

import { Meta, StoryObj } from '@storybook/web-components-vite';

import { BeforeInputEvent, WebContentEditor, XmlUpdateEvent } from './index';
import { formatNode } from './components/selection-logger';

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
    const inputEventString = createRef<HTMLPreElement>();

    // called whenever the web-content-editor is initialized
    function initialize(el: WebContentEditor) {
      if (!el) return;
      el.addEventListener(BeforeInputEvent.eventName, (e: BeforeInputEvent) => {
        const { inputType, xmlRange, data } = e.data;
        const { startContainer, startOffset, endContainer, endOffset } = xmlRange;
        inputEventString.value.innerText = `\n${inputType} [${formatNode(startContainer, startOffset)} - ${formatNode(endContainer, endOffset)}] ${data}` + inputEventString.value.innerText;
      });
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
        <selection-logger class="col-span-2 whitespace-nowrap text-sm text-gray-500"></selection-logger>

        <pre class="col-span-2 border p-4 text-xs text-gray-600" ${ref(inputEventString)}></pre>

      </web-content-editor>

      
    `;
  }
};

import { html } from 'lit';
import { createRef, ref } from 'lit-html/directives/ref.js';

import example from './example.xml?raw';
import './index';
// import '../style.css';

import { WebCanvas } from '../component-editor/components/web-canvas/web-canvas';
import { BeforeInputEvent, WebContentEditor, XmlUpdateEvent } from '../component-editor/components/web-content-editor';
import { Meta, StoryObj } from '@storybook/web-components-vite';
import { formatNode } from '../component-editor/components/selection-logger';

const meta = {
  title: 'Addons',
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'light' }
  }
} satisfies Meta<typeof WebContentEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Addons: Story = {
  render: () => {
    const xmlString = createRef<HTMLPreElement>();
    const inputEventString = createRef<HTMLPreElement>();

    function initialize(el: WebContentEditor) {
      if (!el) return;
      el.addEventListener(BeforeInputEvent.eventName, (e: BeforeInputEvent) => {
        const { inputType, xmlRange, data } = e.data;
        const { startContainer, startOffset, endContainer, endOffset } = xmlRange;
        inputEventString.value.innerText =
          `\n${inputType} [${formatNode(startContainer, startOffset)} - ${formatNode(endContainer, endOffset)}] ${data}` +
          inputEventString.value.innerText;
      });
      el.addEventListener('web-content-editor-initialized', () => {
        // This is a good place to do any setup that requires the editor to be initialized
        el.initialize(example, {
          supportedElements: 'p this-is-the-root-tag qti-simple-choice ul li qti-choice-interaction',
          canvasSelector: '.content'
        });
        el.addEventListener('xml-store-xml', (e: XmlUpdateEvent) => {
          xmlString.value.innerText = e.xml.xml;
        });
      });
    }

    return html`
      <web-content-editor ref=${ref(initialize)} class="container mx-auto mt-12 block flex flex-col gap-x-2">
        <error-canvas
          .forbiddenWords=${['nooit', 'altijd']}
          style="position: absolute;
        pointer-events: none;
        z-index: 1000;
      top: anchor(--target top);
      left: anchor(--target left);
      right: anchor(--target right);
      bottom: anchor(--target bottom);"
        ></error-canvas>
        <pilot-canvas
          style="position: absolute;
      top: anchor(--target top);
      left: anchor(--target left);
      right: anchor(--target right);
      bottom: anchor(--target bottom);"
        ></pilot-canvas>
        <empty-canvas
          style="position: absolute;
      top: anchor(--target top);
      left: anchor(--target left);
      right: anchor(--target right);
      bottom: anchor(--target bottom);"
        ></empty-canvas>

        <info-canvas
          class="pointer-events-none fixed right-4 bottom-4 z-[2000] origin-bottom-right scale-[0.3] bg-white p-8 shadow-lg"
        ></info-canvas>

        <download-doc class="part-[btn]:p-2 mt-2 cursor-pointer text-sm text-gray-400"></download-doc>

        <button-bar
          class="z-20 mb-6 flex divide-x divide-solid divide-slate-200 rounded-md bg-white p-2 shadow shadow-slate-300"
        >
          <naar-kop class="part-[btn]:cursor-pointer part-[btn]:p-1 border-y-0 px-2"> vet </naar-kop>
          <naar-paragraaf class="part-[btn]:cursor-pointer part-[btn]:p-1 border-y-0 px-2"> normaal </naar-paragraaf>
        </button-bar>

        <element-modifier class="z-[5000] flex flex-col rounded bg-white shadow">
          <insert-paragraph class="part-[btn]:cursor-pointer part-[btn]:p-2 inline-block text-sm hover:bg-gray-100"
            >verwijder</insert-paragraph
          >
          <naar-kop class="part-[btn]:cursor-pointer part-[btn]:p-2 inline-block text-sm hover:bg-gray-100">
            vet
          </naar-kop>
          <naar-paragraaf class="part-[btn]:cursor-pointer part-[btn]:p-2 inline-block text-sm hover:bg-gray-100">
            normaal
          </naar-paragraaf>
        </element-modifier>

        <text-selection class="z-[1000] flex gap-2 rounded border-slate-200 bg-white shadow-lg">
          <wrap-strong class="part-[btn]:cursor-pointer part-[btn]:p-2 inline-block p-4 text-sm hover:bg-gray-100">
            vet
          </wrap-strong>
        </text-selection>

        <web-canvas
          class="relative block h-auto w-full bg-white text-gray-800 p-8"
          style="anchor-name: --target"
        ></web-canvas>

        <pre class="block overflow-x-auto border p-4 text-xs text-gray-600" ${ref(xmlString)}></pre>
        <selection-logger class="col-span-2 text-sm whitespace-nowrap text-gray-500"></selection-logger>
        <pre class="col-span-2 border p-4 text-xs text-gray-600" ${ref(inputEventString)}></pre>
      </web-content-editor>
    `;
  }
};

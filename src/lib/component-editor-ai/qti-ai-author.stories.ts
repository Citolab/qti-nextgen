import { html } from 'lit';
import { createRef, ref } from 'lit-html/directives/ref.js';

import example from './example.xml?raw';
// import '../style.css';

import '@editor/content';
import '@editor/content-addons';

import '@citolab/qti-components/qti-components';

import xmlFormat from 'xml-formatter';
import './actions/meerKeuze';
import './components/ai';
import './components/panels/panel-handler';

import { BeforeInputEvent, type WebCanvas, type WebContentEditor, type XmlUpdateEvent } from '@editor/content';
import { formatNode } from '../component-editor/components/selection-logger';

export default {
  title: 'NextGen',

  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'light' }
  }
};

export const NextGen = {
  render: () => {
    const webCanvas = createRef<WebCanvas>();
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
          canvasSelector: '[class*="qti-layout-col"]'
        });
        el.addEventListener('xml-store-xml', (e: XmlUpdateEvent) => {
          xmlString.value.innerText = xmlFormat(e.xml.xml);
        });
      });
    }

    return html`
      <web-content-editor
        ref=${ref(initialize)}
        class="container mx-auto mt-12 flex flex-col gap-x-2"
        class="container mx-auto mt-12 block"
      >
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
          class="prose pointer-events-none fixed right-4 bottom-4 z-[2000] origin-bottom-right scale-[0.3] bg-white p-8 shadow-lg"
        ></info-canvas>

        <button-bar
          class="z-20 mb-6 flex divide-x divide-solid divide-slate-200 rounded-md bg-white p-2 shadow shadow-slate-300"
        >
          <naar-kop class="part-[btn]:cursor-pointer part-[btn]:p-1 border-y-0 px-2"> vet </naar-kop>
          <naar-paragraaf class="part-[btn]:cursor-pointer part-[btn]:p-1 border-y-0 px-2"> normaal </naar-paragraaf>
        </button-bar>

        <!-- <element-modifier class="z-20 flex flex-col rounded bg-white shadow">
          <insert-paragraph class="part-[btn]:cursor-pointer part-[btn]:p-2 inline-block text-sm hover:bg-gray-100"
            >verwijder</insert-paragraph
          >
          <meer-keuze class="part-[btn]:cursor-pointer part-[btn]:p-2 inline-block text-sm hover:bg-gray-100">
            meerkeuze
          </meer-keuze>
        </element-modifier> -->

        <panel-handler class="relative">
          <ai-actions
            class="select:rounded-xl part-[btn-gray]:float-right part-[prop]:flex part-[input]:min-w-[150px] part-[prop]:justify-between part-[prop]:gap-4 part-[btn-gray]:bg-gray-100 part-[btn-gray]:p-1 part-[btn]:p-1 part-[input]:p-1 part-[prop]:p-1 focus:part-[btn]:bg-blue-400 absolute top-0 left-0 z-40 flex max-w-[600px] flex-col gap-2 rounded-lg bg-white p-2 text-sm shadow-2xl"
          >
          </ai-actions>

          <web-canvas class="relative block h-auto w-full bg-white p-8 text-gray-800"
                    style="anchor-name: --target"
> </web-canvas>
        </panel-handler>
        <download-doc class="part-[btn]:p-2 right-0 bottom-0 mt-2 cursor-pointer text-violet-100"></download-doc>
        <pre class="block overflow-x-auto border p-4 text-xs text-gray-600" ${ref(xmlString)}></pre>
        <selection-logger class="col-span-2 text-sm whitespace-nowrap text-gray-500"></selection-logger>
        <pre class="col-span-2 border p-4 text-xs text-gray-600" ${ref(inputEventString)}></pre>
      </web-content-editor>
    `;
  }
};

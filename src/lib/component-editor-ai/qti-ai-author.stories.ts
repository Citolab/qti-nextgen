import { html } from 'lit';
import { createRef, ref } from 'lit-html/directives/ref.js';

import example from './example.xml?raw';
import './style.css';

import '@editor/content';
import '@editor/content-addons';

import '@citolab/qti-components/qti-components';

import xmlFormat from 'xml-formatter';
import './actions/meerKeuze';
import './components/ai';
import './components/panels/panel-handler';

import type { WebCanvas, WebContentEditor, XMLStore,  } from '@editor/content';
import type { InfoCanvas } from '@editor/content-addons';

export default {
  title: 'NextGen',

  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'light' }
  }
};

export const NextGen = {
  render: () => {
    const webContentEditor = createRef<WebContentEditor>();
    const webCanvas = createRef<WebCanvas>();
    const infoCanvas = createRef<InfoCanvas>();
    const xmlString = createRef<HTMLPreElement>();
    
    return html`
        <web-content-editor
          ${ref(webContentEditor)}
          @xml-store-xml=${e =>
            (xmlString.value.textContent = xmlFormat(e.detail.xml, {
              indentation: '  ',
              filter: node => node.type !== 'Comment',
              collapseContent: true,
              lineSeparator: '\n'
            }))}
          supported-elements="p h1 strong em qti-assessment-item qti-item-body div qti-choice-interaction qti-simple-choice"
          class="mx-auto flex flex-col pt-8"
        >
          <error-canvas .forbiddenWords=${['nooit', 'altijd']}></error-canvas>
          <pilot-canvas></pilot-canvas>
          <empty-canvas></empty-canvas>

          <ai-key-entry></ai-key-entry>

          <button-bar
            class="z-20 mb-6 flex divide-x divide-solid divide-slate-200 rounded-md bg-white p-2 shadow shadow-slate-300"
          >
            <naar-kop class="border-y-0 px-2 part-[btn]:cursor-pointer part-[btn]:p-1"> vet </naar-kop>
            <naar-paragraaf class="border-y-0 px-2 part-[btn]:cursor-pointer part-[btn]:p-1"> normaal </naar-paragraaf>
          </button-bar>

          <element-modifier class="z-20 flex flex-col rounded bg-white shadow">
            <insert-paragraph class="inline-block text-sm hover:bg-gray-100 part-[btn]:cursor-pointer part-[btn]:p-2"
              >verwijder</insert-paragraph
            >
            <meer-keuze class="inline-block text-sm hover:bg-gray-100 part-[btn]:cursor-pointer part-[btn]:p-2">
              meerkeuze
            </meer-keuze>
          </element-modifier>

          <panel-handler>
            <ai-actions
              class="select:rounded-xl absolute left-0 top-0 z-40 flex max-w-[600px] flex-col gap-2 rounded-lg bg-white p-2 text-sm shadow-2xl part-[btn-gray]:float-right part-[prop]:flex part-[input]:min-w-[150px] part-[prop]:justify-between part-[prop]:gap-4 part-[btn-gray]:bg-gray-100 part-[btn-gray]:p-1 part-[btn]:p-1 part-[input]:p-1 part-[prop]:p-1 focus:part-[btn]:bg-blue-400"
            >
            </ai-actions>
            <div class="relative h-[768px] w-[1024px] rounded bg-white p-4 shadow-md">
              <info-canvas class="relative block aspect-video text-transparent" ${ref(infoCanvas)}>
                <web-canvas class="splitline absolute inset-0 text-gray-800" ${ref(webCanvas)}>
                  <xml-store canvas-selector=${`[class*="qti-layout-col"]`} xml=${example}></xml-store>
                </web-canvas>
              </info-canvas>
            </div>
          </panel-handler>
          <download-doc class="bottom-0 right-0 mt-2 cursor-pointer text-violet-100 part-[btn]:p-2"></download-doc>
          <selection-logger></selection-logger>
        </web-content-editor>
        <pre class="block overflow-x-auto border p-4 text-xs text-gray-600" ${ref(xmlString)}></pre>

    `;
  }
};

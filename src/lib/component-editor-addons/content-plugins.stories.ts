import { html } from 'lit';
import { createRef, ref } from 'lit-html/directives/ref.js';

import example from './example.xml?raw';
import './index';
import './style.css';

import { InfoCanvas } from './components/info-canvas';
import { WebCanvas } from '../component-editor/components/web-canvas/web-canvas';
import { WebContentEditor } from '../component-editor/components/web-content-editor';
import { XmlStore } from '../component-editor/components/xml-store/xml-store';

export default {
  // decorators: [story => withShadowRoot(story, a)],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'light' }
  }
};

export const Plugins = {
  render: () => {
    const webContentEditor = createRef<WebContentEditor>();
    const xmlStore = createRef<XmlStore>();
    const webCanvas = createRef<WebCanvas>();
    const infoCanvas = createRef<InfoCanvas>();

    // useEffect(() => {}, [webContentEditor, xmlStore, webCanvas]);
    // clone em p strong ul li h1
    return html`
      <div class="w-screen">
        <web-content-editor
          ${ref(webContentEditor)}
          supported-elements="p h1 strong em  div "
          class="mx-auto mt-12 block w-[92ch]"
        >
          <error-canvas .forbiddenWords=${['nooit', 'altijd']}></error-canvas>
          <pilot-canvas></pilot-canvas>
          <empty-canvas></empty-canvas>

          <download-doc class="mt-2 cursor-pointer text-sm text-gray-400 part-[btn]:p-2"></download-doc>

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
            <naar-kop class="inline-block text-sm hover:bg-gray-100 part-[btn]:cursor-pointer part-[btn]:p-2">
              vet
            </naar-kop>
            <naar-paragraaf class="inline-block text-sm hover:bg-gray-100 part-[btn]:cursor-pointer part-[btn]:p-2">
              normaal
            </naar-paragraaf>
          </element-modifier>
          <text-selection class="z-[1000] flex gap-2 rounded bg-white shadow-lg">
            <wrap-strong class="inline-block text-sm hover:bg-gray-100 part-[btn]:cursor-pointer part-[btn]:p-2">
              vet
            </wrap-strong>
          </text-selection>

          <div class="relative min-h-[36rem] rounded border-solid border-slate-200 bg-white p-12">
            <info-canvas class="relative block text-transparent" ${ref(infoCanvas)}>
              <web-canvas class="splitline absolute inset-0 text-gray-800" ${ref(webCanvas)}>
                <xml-store canvas-selector=${`[class*="content"]`} xml=${example}></xml-store>
              </web-canvas>
            </info-canvas>
          </div>
        </web-content-editor>
      </div>
    `;
  }
};

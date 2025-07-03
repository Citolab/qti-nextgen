import { html } from 'lit';
import { createRef, ref } from 'lit-html/directives/ref.js';

import example from './example.xml?raw';
import './index';
import './style.css';

import { WebCanvas } from '../component-editor/components/web-canvas/web-canvas';
import { WebContentEditor } from '../component-editor/components/web-content-editor';
import { Meta, StoryObj } from '@storybook/web-components-vite';

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
    const webContentEditor = createRef<WebContentEditor>();
    const webCanvas = createRef<WebCanvas>();

    return html`
      <web-content-editor
        canvas-selector=${`[class*="content"]`}
        .xml=${example}
        ${ref(webContentEditor)}
        supported-elements="p h1 strong em div"
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
          class="pointer-events-none fixed right-4 bottom-4 z-[2000] origin-bottom-right scale-[0.3] bg-white shadow-lg"
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
        <text-selection class="z-[1000] flex gap-2 rounded bg-white  border-slate-200 shadow-lg">
          <wrap-strong class="part-[btn]:cursor-pointer part-[btn]:p-2 inline-block text-sm p-4 hover:bg-gray-100">
            vet
          </wrap-strong>
        </text-selection>

        <!-- <div class="relative h-auto rounded border-solid border-slate-200 bg-white p-12"> -->
          <web-canvas class="relative bg-white h-auto splitline text-gray-800" ${ref(webCanvas)} style="anchor-name: --target"></web-canvas>
        <!-- </div> -->
      </web-content-editor>
    `;
  }
};

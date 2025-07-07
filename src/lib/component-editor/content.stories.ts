import { html } from 'lit';
import { createRef, ref } from 'lit-html/directives/ref.js';
import { within, userEvent, expect } from 'storybook/test';

import './index';
import './style.css'; 

import './components/selection-logger';

import { Meta, StoryObj } from '@storybook/web-components-vite';
import { xmlRootNodeName } from './elements/this-is-the-root-tag';
import { WebContentEditor } from './index';

const meta: Meta = {
  title: 'Core',
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'light' }
  },
};
export default meta;
type Story = StoryObj;

export const Core: Story = {
  render: args => {
    const webContentEditor = createRef<WebContentEditor>();
    const xmlString = createRef<HTMLPreElement>();

    const loadXML = () => {
      webContentEditor.value.initializeXML(args.xml);
    };

    return html`
      <web-content-editor
        ${ref(webContentEditor)}
        @xml-store-xml=${e => (xmlString.value.textContent = e.xml.xml)}
        supported-elements="p this-is-the-root-tag"
        class="container mx-auto mt-12 block"
        xml="<p></p>"
      >
        <web-canvas style="background-color: white!"
          class="block bg-white aspect-video text-gray-800 p-8"
        ></web-canvas>
        
        
        <selection-logger></selection-logger>
        
      </web-content-editor>

      <pre class="block overflow-x-auto border p-4 text-xs text-gray-600" ${ref(xmlString)}></pre>

    `;
  },
  args: {
    xml: `<p></p>`
  }
};

export const DefaultPlay: Story = {
  render: Core.render,
  args: {
    xml: `<p></p>`
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    const thisIsTheRootTag = canvasElement.querySelector(xmlRootNodeName) as HTMLElement;
    const submitButton = canvas.getByRole('button');
    await user.click(submitButton);
    thisIsTheRootTag.focus();
    await user.keyboard('hallo');
    expect(thisIsTheRootTag.innerHTML).toMatch('<p>hallo</p>');
    await user.keyboard('{enter}');
    expect(thisIsTheRootTag.innerHTML).toMatch('<p>hallo</p><p><br></p>');
    await user.keyboard('{backspace}');
    expect(thisIsTheRootTag.innerHTML).toMatch('<p>hallo</p>');
    await user.keyboard('doei');
    expect(thisIsTheRootTag.innerHTML).toMatch('<p>hallo</p><p>doei</p>');
  }
};

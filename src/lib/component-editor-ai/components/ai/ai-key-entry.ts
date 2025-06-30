import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('ai-key-entry')
export class AiKeyEntry extends LitElement {
    static styles = css`
        :host {
            display: block;
            max-width: 400px;
            margin: 1rem auto;
            font-family: Arial, sans-serif;
        }
        label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: bold;
        }
        input[type="text"] {
            width: 100%;
            padding: 0.5rem;
            font-size: 1rem;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-sizing: border-box;
        }
    `;

    @state()
    private aiKey: string = '';

    private onInput(e: Event) {
        const target = e.target as HTMLInputElement;
        this.aiKey = target.value;
        this.dispatchEvent(new CustomEvent('ai-key-changed', {
            detail: { key: this.aiKey },
            bubbles: true,
            composed: true,
        }));
    }

    render() {
        return html`
            <label part="label" for="ai-key-input">OpenAI API Key</label>
            <input
                part="input"
                id="ai-key-input"
                type="text"
                placeholder="Paste your OpenAI API key here"
                .value=${this.aiKey}
                @input=${this.onInput}
                autocomplete="off"
            />
        `;
    }
}
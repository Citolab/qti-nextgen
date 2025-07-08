/* eslint-disable lit-a11y/click-events-have-key-events */
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import type { EditContext } from '@editor/content';
import { editContext } from '@editor/content';
import { consume } from '@lit/context';
import type { AIActionState, Action, Message, Prompt } from '../../model';
import { actions } from './actions';

import { PanelMixin } from '../panels/panel-canvas.mixin';
import { decode, getAIChatCompletionReader, getAIImage } from './ai-helper';
import { findElement } from '../../../component-editor/components/utilities';

@customElement('ai-actions')
export class AIActions extends PanelMixin(LitElement) {
  @consume({ context: editContext, subscribe: true })
  @property({ attribute: false })
  public logger?: EditContext;

  state: AIActionState = 'selectPrompt';

  aiActions: Action[] = actions.filter(a => a.actionType !== 'edit');
  currentSuggestion: string = '';
  currentAction: Action = null;
  messages: Message[] = [];
  textProps: any = {};
  errorText: string = null;

  constructor() {
    super();
    this.addEventListener('panel-shown', this.updateActions.bind(this));
    this.addEventListener('panel-hidden', this.resetPanel.bind(this));
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.dispatchEvent(
      new CustomEvent('register-panel', {
        detail: { appear: 'onslash', el: this },
        composed: true,
        bubbles: true
      })
    );
  }

  static get styles() {
    return [
      css`
        button {
          all: unset;
        }
      `
    ];
  }

  private async setStateAsync(state: AIActionState) {
    return new Promise<void>(resolve => {
      this.state = state;
      this.requestUpdate();
      this.updateComplete.then(() => resolve());
    });
  }

  public async actionSelected(action: Action) {
    this.currentAction = action;

    if (action.followUpActions) {
      this.aiActions = action.followUpActions;
      this.requestUpdate();
      super.getFirstFocusableElement();
    } else if (action.prompt?.textProps) {
      await this.setStateAsync('editPrompt');
      super.getFirstFocusableElement();
    } else {
      await this.initialSuggestion(action);
    }
  }

  public async initialSuggestion(action: Action) {
    const prompt = action.prompt;

    let sourceText = '';
    this.logger.canvases().forEach(canvas => {
      sourceText += canvas.innerHTML;
    });

    const editEl = action.actionType === 'edit' ? findElement(this.logger.xmlRange, action.editEl) : null;

    
    const initialMessages = [
      {
        role: 'system',
        content: "Don't include any explanations in your responses. Don't include the question in your response. Just give what i am asking"
      },
      { role: 'user', content: prompt.text({ ...this.textProps, sourceText, editValue: editEl?.outerHTML }) }
    ] as Message[];

    if (action.prompt.promptType === 'image') {
      this.setStateAsync('loading');
      const image = await getAIImage(prompt, initialMessages, this.logger.API_KEY);
      this.currentSuggestion = image;
      this.setStateAsync('editSuggestion');
    } else {
      await this.setStreamResponse(prompt, initialMessages);
    }
  }

  public async editSuggestion(prompt: Prompt) {
    const newMessages = [
      ...this.messages,
      { role: 'assistant', content: this.currentSuggestion },
      { role: 'user', content: prompt.text({}) }
    ] as Message[];

    this.setStreamResponse(prompt, newMessages);
  }

  private async setStreamResponse(prompt: Prompt, messages: Message[]) {
    await this.setStateAsync('loading');
    this.currentSuggestion = '';

    await getAIChatCompletionReader(prompt, messages, this.logger.API_KEY)
      .then(async reader => {
        await this.setStateAsync('loadingSuggestion');

        let doneStreaming = false;

        while (!doneStreaming) {
          const { done, value } = await reader.read();
          const decodedValue = decode(value);
          if (decodedValue) {
            this.currentSuggestion = this.currentSuggestion + decodedValue;
          }

          this.requestUpdate();
          doneStreaming = done;
        }

        this.messages = messages;

        await this.setStateAsync('editSuggestion');
      })
      .catch(async e => {
        const errorMessage = e?.response?.data?.error?.message;
        this.errorText = errorMessage;
        await this.setStateAsync('error');
      });
  }

  private updateActions() {
    this.aiActions = actions.filter(a => this.filterActions(a));
    this.requestUpdate();
  }

  private filterActions(action: Action) {
    if (action.actionType !== 'edit') return true;
    const el = findElement(this.logger.xmlRange,action.editEl);
    return el !== null;
  }

  public async addSuggestion() {
    if (this.currentAction.actionType === 'edit') {
      const editEl = findElement(this.logger.xmlRange,this.currentAction.editEl);
      this.logger.editContent(editEl, this.currentSuggestion);
    } else {
      this.logger.addNewContent(this.currentSuggestion);
    }

    this.resetPanel();
    super.hide();
  }

  public createTemplateFromHTML(htmlString) {
    const template = document.createElement('template');
    template.innerHTML = htmlString;
    return html`${template.content}`;
  }

  private handleInputChange(event: Event) {
    const inputEl = event.target as HTMLInputElement;
    this.textProps[inputEl.id] = inputEl.value;
  }

  private handleSelectChange(event: Event) {
    const inputEl = event.target as HTMLSelectElement;
    this.textProps[inputEl.id] = inputEl.value;
  }

  async resetPanel() {
    this.setStateAsync('selectPrompt');
    this.currentAction = null;
    this.currentSuggestion = '';
    this.messages = [];
    this.textProps = {};
    this.errorText = null;
    this.aiActions = actions.filter(a => a.actionType !== 'edit');
    this.requestUpdate();
  }

  render() {
    return html`
      <slot></slot>
      ${this.state === 'loading' ? html`<img src="/spinner.svg" alt="loading" />` : ''}
      ${this.state === 'selectPrompt'
        ? this.aiActions.map(a => html`<button part="btn" @click="${async () => await this.actionSelected(a)}">${a.title}</button>`)
        : ''}
      ${this.state === 'editSuggestion' || this.state === 'loadingSuggestion'
        ? html`<div>
            <div @click="${async () => await this.addSuggestion()}">${this.createTemplateFromHTML(this.currentSuggestion)}</div>
            ${this.currentAction && this.currentAction.followUpPrompts && this.state === 'editSuggestion'
              ? this.currentAction.followUpPrompts.map(
                  prompt => html`<button part="btn-gray" @click="${async () => await this.editSuggestion(prompt)}">${prompt.title}</button>`
                )
              : ''}
          </div>`
        : ''}
      ${this.state === 'editPrompt'
        ? html`${this.currentAction.prompt.textProps.map(
              prop =>
                html`<div part="prop">
                  ${prop.type === 'dropdown'
                    ? html`${prop.title}<select part="input" name="${prop.id}" id="${prop.id}" @change="${this.handleSelectChange}">
                          <option value=""></option>
                          ${prop.values.map(val => html`<option value="${val}">${val}</option>`)}
                        </select> `
                    : prop.type === 'text'
                      ? html`${prop.title}<input
                            type="text"
                            part="input"
                            id="${prop.id}"
                            placeholder="${prop.placeholder}"
                            @keydown="${(e: Event) => e.stopImmediatePropagation()}"
                            @change="${this.handleInputChange}"
                          />`
                      : prop.type === 'textarea'
                        ? html`<div>${prop.title}</div>
                            <textarea
                              type="text"
                              id="${prop.id}"
                              rows="6"
                              part="input"
                              placeholder="${prop.placeholder}"
                              @keydown="${(e: Event) => e.stopImmediatePropagation()}"
                              @change="${this.handleInputChange}"
                            ></textarea> `
                        : html``}
                </div>`
            )} <button part="btn-gray" @click="${async () => await this.initialSuggestion(this.currentAction)}">Bevestig</button>`
        : ''}
      ${this.state === 'error'
        ? html`<div>
            <div>Er ging iets mis</div>
            <div>${this.errorText}</div>
            <button part="btn-gray" @click="${this.resetPanel}">OK</button>
          </div>`
        : ''}
    `;
  }
}

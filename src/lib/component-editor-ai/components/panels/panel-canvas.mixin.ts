import type { LitElement} from 'lit';
import { CSSResultGroup, css, html } from 'lit';
import { AIActions } from '../ai/ai-actions.panel';

type Constructor<T> = new (...args: any[]) => T;

export declare class PanelInterface {
  show(): void;
  hide(): void;
  getFirstFocusableElement(): void;
}

export const PanelMixin = <T extends Constructor<LitElement>>(superClass: T) => {
  class PanelElement extends superClass {
    private mhp = this._onMouseHidePanel.bind(this);
    private khp = this._onKeyHidePanel.bind(this);
    previouslyFocusedElement: HTMLElement = null;

    constructor(...args: any[]) {
      super();
      this.hide();
    }

    show() {
      this.style.removeProperty('display');
      document.addEventListener('no-range', this.mhp);
      document.addEventListener('keydown', this.khp);

      this.getFirstFocusableElement();
      this.dispatchEvent(new CustomEvent('panel-shown'));
    }

    hide() {
      this.style.display = 'none';
      document.removeEventListener('no-range', this.mhp);
      document.removeEventListener('keydown', this.khp);

      this.dispatchEvent(new CustomEvent('panel-hidden'));
    }

    private _onMouseHidePanel(e: CustomEvent) {
      if (!this.contains(e.detail.target as Node)) {
        this.hide();
      }
    }

    private _onKeyHidePanel(e: KeyboardEvent) {
      // if you press escape, hide the panel
      if (e.key === 'Escape') {
        this.hide();
      } 
      else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {   
        e.preventDefault();
        if (this.previouslyFocusedElement) {          
          const nextFocusableElement = this.getNextFocusableElement(this.previouslyFocusedElement, e.key === 'ArrowDown' ? 'down' : 'up');

          if (nextFocusableElement) {
            nextFocusableElement.focus();
            this.previouslyFocusedElement = nextFocusableElement ;
          }
        }
      }
    }

    getFirstFocusableElement(): HTMLElement {            
      let firstElement = this.shadowRoot.querySelector('*') as HTMLElement

      if (firstElement.tabIndex < 0){
        firstElement = this.getNextFocusableElement(firstElement, 'down');
      }

      if (firstElement) {        
        firstElement.focus();
        this.previouslyFocusedElement = firstElement;
      }
      return firstElement;
    }

    // Method to find the next focusable element in the DOM
    private getNextFocusableElement(currentElement: HTMLElement, direction: 'up' | 'down'): HTMLElement {
      let nextElement = direction === 'down' ? currentElement.nextElementSibling : currentElement.previousElementSibling;

      while (nextElement) {        
        if (nextElement instanceof HTMLElement && nextElement.tabIndex >= 0) {
          // If the element is focusable (tabIndex >= 0), return it
          return nextElement;
        }

        // Check the next sibling
        nextElement = direction === 'down' ? nextElement.hasChildNodes ? nextElement.firstElementChild : nextElement.nextElementSibling : nextElement.previousElementSibling;
      }

      // If no next sibling is focusable, check the parent's next sibling
      if (currentElement.parentElement) {
        return this.getNextFocusableElement(currentElement.parentElement, direction);
      }

      // If no next focusable element is found, return null
      return null;
    }

    render() {
      return html`<slot></slot>`;
    }
  }
  return PanelElement as Constructor<PanelInterface> & T;
};

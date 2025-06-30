import { customElement, property } from 'lit/decorators.js';
import { LitElement, css, html } from 'lit';
import { consume } from '@lit/context';
import { EditContext, editContext } from '../../../component-editor';
import xmlFormat from 'xml-formatter';

@customElement('download-doc')
export class DownloadDoc extends LitElement {
  @consume({ context: editContext })
  @property({ attribute: false })
  public logger?: EditContext;

  static styles = css`
    a {
      all: unset;
      display: inline-block;
    }
    :host {
      display: inline-block;
    }
  `;

  private _createAndOpenFile(e) {
    const serializer = new XMLSerializer();
    const xmlStr = serializer.serializeToString(this.logger.doc().documentElement.firstElementChild);
    const xmlSerialized = xmlFormat(xmlStr);

    const anchor = e.target;
    const bb = new Blob([xmlSerialized], { type: 'text/plain' });
    anchor.setAttribute('href', window.URL.createObjectURL(bb));
    anchor.dataset.downloadurl = ['text/plain', anchor.download, anchor.href].join(':');
  }

  render = () => html` <a href="#" part="btn" @click=${this._createAndOpenFile} download="file.xml"> download </a> `;
}

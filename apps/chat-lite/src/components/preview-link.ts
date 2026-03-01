import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

export interface PreviewLinkData {
  url: string;
  icon: string;
  label: string;
  artifactKind: string;
  documentId: string;
  documentTitle: string;
}

@customElement("chatlite-preview-link")
export class PreviewLink extends LitElement {
  static styles = css`
    :host {
      display: block;
      margin: 12px 0;
    }

    .preview-card {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 10px;
      color: white;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
    }

    .preview-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .preview-card:active {
      transform: translateY(0);
    }

    .icon {
      font-size: 18px;
    }

    .label {
      white-space: nowrap;
    }
  `;

  @property({ type: Object })
  data: PreviewLinkData | null = null;

  @property({ type: Function })
  onClick?: (data: PreviewLinkData) => void;

  render() {
    if (!this.data) return html``;

    return html`
      <div 
        class="preview-card" 
        @click=${this._handleClick}
      >
        <span class="icon">${this.data.icon}</span>
        <span class="label">${this.data.label}</span>
      </div>
    `;
  }

  private _handleClick() {
    if (this.onClick) {
      this.onClick(this.data!);
    }
    
    // 同时打开新窗口预览
    window.open(this.data!.url, '_blank');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "chatlite-preview-link": PreviewLink;
  }
}

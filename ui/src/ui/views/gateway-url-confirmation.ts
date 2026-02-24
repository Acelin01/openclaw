import { html, nothing } from "lit";
import type { AppViewState } from "../app-view-state.ts";
import { t } from "../../i18n.ts";

export function renderGatewayUrlConfirmation(state: AppViewState) {
  const { pendingGatewayUrl } = state;
  if (!pendingGatewayUrl) {
    return nothing;
  }

  return html`
    <div class="exec-approval-overlay" role="dialog" aria-modal="true" aria-live="polite">
      <div class="exec-approval-card">
        <div class="exec-approval-header">
          <div>
            <div class="exec-approval-title">${t("gateway_confirm.title", "Change Gateway URL")}</div>
            <div class="exec-approval-sub">${t("gateway_confirm.subtitle", "This will reconnect to a different gateway server")}</div>
          </div>
        </div>
        <div class="exec-approval-command mono">${pendingGatewayUrl}</div>
        <div class="callout danger" style="margin-top: 12px;">
          ${t("gateway_confirm.warning", "Only confirm if you trust this URL. Malicious URLs can compromise your system.")}
        </div>
        <div class="exec-approval-actions">
          <button
            class="btn primary"
            @click=${() => state.handleGatewayUrlConfirm()}
          >
            ${t("gateway_confirm.action.confirm", "Confirm")}
          </button>
          <button
            class="btn"
            @click=${() => state.handleGatewayUrlCancel()}
          >
            ${t("gateway_confirm.action.cancel", "Cancel")}
          </button>
        </div>
      </div>
    </div>
  `;
}

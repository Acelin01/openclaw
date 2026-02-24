import { html, nothing } from "lit";
import type { WhatsAppStatus } from "../types.ts";
import type { ChannelsProps } from "./channels.types.ts";
import { t } from "../../i18n.ts";
import { formatAgo } from "../format.ts";
import { renderChannelConfigSection } from "./channels.config.ts";
import { formatDuration } from "./channels.shared.ts";

export function renderWhatsAppCard(params: {
  props: ChannelsProps;
  whatsapp?: WhatsAppStatus;
  accountCountLabel: unknown;
}) {
  const { props, whatsapp, accountCountLabel } = params;

  return html`
    <div class="card">
      <div class="card-title">${t("channels.whatsapp.title", "WhatsApp")}</div>
      <div class="card-sub">${t("channels.whatsapp.subtitle", "Link WhatsApp Web and monitor connection health.")}</div>
      ${accountCountLabel}

      <div class="status-list" style="margin-top: 16px;">
        <div>
          <span class="label">${t("channels.whatsapp.configured", "Configured")}</span>
          <span>${whatsapp?.configured ? t("channels.whatsapp.yes", "Yes") : t("channels.whatsapp.no", "No")}</span>
        </div>
        <div>
          <span class="label">${t("channels.whatsapp.linked", "Linked")}</span>
          <span>${whatsapp?.linked ? t("channels.whatsapp.yes", "Yes") : t("channels.whatsapp.no", "No")}</span>
        </div>
        <div>
          <span class="label">${t("channels.whatsapp.running", "Running")}</span>
          <span>${whatsapp?.running ? t("channels.whatsapp.yes", "Yes") : t("channels.whatsapp.no", "No")}</span>
        </div>
        <div>
          <span class="label">${t("channels.whatsapp.connected", "Connected")}</span>
          <span>${whatsapp?.connected ? t("channels.whatsapp.yes", "Yes") : t("channels.whatsapp.no", "No")}</span>
        </div>
        <div>
          <span class="label">${t("channels.whatsapp.last_connect", "Last connect")}</span>
          <span>
            ${whatsapp?.lastConnectedAt ? formatAgo(whatsapp.lastConnectedAt) : t("channels.whatsapp.na", "n/a")}
          </span>
        </div>
        <div>
          <span class="label">${t("channels.whatsapp.last_message", "Last message")}</span>
          <span>
            ${whatsapp?.lastMessageAt ? formatAgo(whatsapp.lastMessageAt) : t("channels.whatsapp.na", "n/a")}
          </span>
        </div>
        <div>
          <span class="label">${t("channels.whatsapp.auth_age", "Auth age")}</span>
          <span>
            ${whatsapp?.authAgeMs != null ? formatDuration(whatsapp.authAgeMs) : t("channels.whatsapp.na", "n/a")}
          </span>
        </div>
      </div>

      ${
        whatsapp?.lastError
          ? html`<div class="callout danger" style="margin-top: 12px;">
            ${whatsapp.lastError}
          </div>`
          : nothing
      }

      ${
        props.whatsappMessage
          ? html`<div class="callout" style="margin-top: 12px;">
            ${props.whatsappMessage}
          </div>`
          : nothing
      }

      ${
        props.whatsappQrDataUrl
          ? html`<div class="qr-wrap">
            <img src=${props.whatsappQrDataUrl} alt="WhatsApp QR" />
          </div>`
          : nothing
      }

      <div class="row" style="margin-top: 14px; flex-wrap: wrap;">
        <button
          class="btn primary"
          ?disabled=${props.whatsappBusy}
          @click=${() => props.onWhatsAppStart(false)}
        >
          ${props.whatsappBusy ? t("channels.whatsapp.working", "Working…") : t("channels.whatsapp.show_qr", "Show QR")}
        </button>
        <button
          class="btn"
          ?disabled=${props.whatsappBusy}
          @click=${() => props.onWhatsAppStart(true)}
        >
          ${t("channels.whatsapp.relink", "Relink")}
        </button>
        <button
          class="btn"
          ?disabled=${props.whatsappBusy}
          @click=${() => props.onWhatsAppWait()}
        >
          ${t("channels.whatsapp.wait_scan", "Wait for scan")}
        </button>
        <button
          class="btn danger"
          ?disabled=${props.whatsappBusy}
          @click=${() => props.onWhatsAppLogout()}
        >
          ${t("channels.whatsapp.logout", "Logout")}
        </button>
        <button class="btn" @click=${() => props.onRefresh(true)}>
          ${t("channels.whatsapp.refresh", "Refresh")}
        </button>
      </div>

      ${renderChannelConfigSection({ channelId: "whatsapp", props })}
    </div>
  `;
}

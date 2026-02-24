import { html, nothing } from "lit";
import type { GoogleChatStatus } from "../types.ts";
import type { ChannelsProps } from "./channels.types.ts";
import { t } from "../../i18n.ts";
import { formatAgo } from "../format.ts";
import { renderChannelConfigSection } from "./channels.config.ts";

export function renderGoogleChatCard(params: {
  props: ChannelsProps;
  googleChat?: GoogleChatStatus | null;
  accountCountLabel: unknown;
}) {
  const { props, googleChat, accountCountLabel } = params;

  const summaryLastError = googleChat?.lastError;
  const summaryLastStartAt = googleChat?.lastStartAt;
  const summaryLastProbeAt = googleChat?.lastProbeAt;
  const summaryCredential = googleChat?.credentialSource ?? t("channels.common.na", "n/a");
  const summaryAudience = googleChat?.audienceType
    ? `${googleChat.audienceType}${googleChat.audience ? ` · ${googleChat.audience}` : ""}`
    : t("channels.common.na", "n/a");

  return html`
    <div class="card">
      <div class="card-title">${t("channels.googlechat.title", "Google Chat")}</div>
      <div class="card-sub">${t("channels.googlechat.subtitle", "Chat API webhook status and channel configuration.")}</div>
      ${accountCountLabel}

      <div class="status-list" style="margin-top: 16px;">
        <div>
          <span class="label">${t("channels.common.configured", "Configured")}</span>
          <span>${googleChat ? (googleChat.configured ? t("channels.common.yes", "Yes") : t("channels.common.no", "No")) : t("channels.common.na", "n/a")}</span>
        </div>
        <div>
          <span class="label">${t("channels.common.running", "Running")}</span>
          <span>${googleChat ? (googleChat.running ? t("channels.common.yes", "Yes") : t("channels.common.no", "No")) : t("channels.common.na", "n/a")}</span>
        </div>
        <div>
          <span class="label">${t("channels.googlechat.credential", "Credential")}</span>
          <span class="monospace">${summaryCredential}</span>
        </div>
        <div>
          <span class="label">${t("channels.googlechat.audience", "Audience")}</span>
          <span class="monospace">${summaryAudience}</span>
        </div>
        <div>
          <span class="label">${t("channels.googlechat.last_start", "Last start")}</span>
          <span>${summaryLastStartAt ? formatAgo(summaryLastStartAt) : t("channels.common.na", "n/a")}</span>
        </div>
        <div>
          <span class="label">${t("channels.googlechat.last_probe", "Last probe")}</span>
          <span>${summaryLastProbeAt ? formatAgo(summaryLastProbeAt) : t("channels.common.na", "n/a")}</span>
        </div>
      </div>

      ${
        summaryLastError
          ? html`<div class="callout danger" style="margin-top: 12px;">${summaryLastError}</div>`
          : nothing
      }

      ${
        googleChat?.probe
          ? html`<div class="callout" style="margin-top: 12px;">
            ${googleChat.probe.ok ? t("channels.common.probe_ok", "Probe ok") : t("channels.common.probe_failed", "Probe failed")} ·
            ${googleChat.probe.status ?? ""} ${googleChat.probe.error ?? ""}
          </div>`
          : nothing
      }

      ${renderChannelConfigSection({ channelId: "googlechat", props })}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${() => props.onRefresh(true)}>${t("channels.common.probe", "Probe")}</button>
      </div>
    </div>
  `;
}

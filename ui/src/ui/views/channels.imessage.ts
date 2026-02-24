import { html, nothing } from "lit";
import type { IMessageStatus } from "../types.ts";
import type { ChannelsProps } from "./channels.types.ts";
import { t } from "../../i18n.ts";
import { formatAgo } from "../format.ts";
import { renderChannelConfigSection } from "./channels.config.ts";

export function renderIMessageCard(params: {
  props: ChannelsProps;
  imessage?: IMessageStatus | null;
  accountCountLabel: unknown;
}) {
  const { props, imessage, accountCountLabel } = params;

  return html`
    <div class="card">
      <div class="card-title">${t("channels.imessage.title", "iMessage")}</div>
      <div class="card-sub">${t("channels.imessage.subtitle", "macOS bridge status and channel configuration.")}</div>
      ${accountCountLabel}

      <div class="status-list" style="margin-top: 16px;">
        <div>
          <span class="label">${t("channels.common.configured", "Configured")}</span>
          <span>${imessage ? (imessage.configured ? t("channels.common.yes", "Yes") : t("channels.common.no", "No")) : t("channels.common.na", "n/a")}</span>
        </div>
        <div>
          <span class="label">${t("channels.common.running", "Running")}</span>
          <span>${imessage ? (imessage.running ? t("channels.common.yes", "Yes") : t("channels.common.no", "No")) : t("channels.common.na", "n/a")}</span>
        </div>
        <div>
          <span class="label">${t("channels.imessage.last_start", "Last start")}</span>
          <span>${imessage?.lastStartAt ? formatAgo(imessage.lastStartAt) : t("channels.common.na", "n/a")}</span>
        </div>
        <div>
          <span class="label">${t("channels.imessage.last_probe", "Last probe")}</span>
          <span>${imessage?.lastProbeAt ? formatAgo(imessage.lastProbeAt) : t("channels.common.na", "n/a")}</span>
        </div>
      </div>

      ${
        imessage?.lastError
          ? html`<div class="callout danger" style="margin-top: 12px;">
            ${imessage.lastError}
          </div>`
          : nothing
      }

      ${
        imessage?.probe
          ? html`<div class="callout" style="margin-top: 12px;">
            ${imessage.probe.ok ? t("channels.common.probe_ok", "Probe ok") : t("channels.common.probe_failed", "Probe failed")} ·
            ${imessage.probe.error ?? ""}
          </div>`
          : nothing
      }

      ${renderChannelConfigSection({ channelId: "imessage", props })}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${() => props.onRefresh(true)}>
          ${t("channels.common.probe", "Probe")}
        </button>
      </div>
    </div>
  `;
}

import { html, nothing } from "lit";
import type { SlackStatus } from "../types.ts";
import type { ChannelsProps } from "./channels.types.ts";
import { t } from "../../i18n.ts";
import { formatAgo } from "../format.ts";
import { renderChannelConfigSection } from "./channels.config.ts";

export function renderSlackCard(params: {
  props: ChannelsProps;
  slack?: SlackStatus | null;
  accountCountLabel: unknown;
}) {
  const { props, slack, accountCountLabel } = params;

  return html`
    <div class="card">
      <div class="card-title">${t("channels.slack.title", "Slack")}</div>
      <div class="card-sub">${t("channels.slack.subtitle", "Socket mode status and channel configuration.")}</div>
      ${accountCountLabel}

      <div class="status-list" style="margin-top: 16px;">
        <div>
          <span class="label">${t("channels.common.configured", "Configured")}</span>
          <span>${slack ? (slack.configured ? t("channels.common.yes", "Yes") : t("channels.common.no", "No")) : t("channels.common.na", "n/a")}</span>
        </div>
        <div>
          <span class="label">${t("channels.common.running", "Running")}</span>
          <span>${slack ? (slack.running ? t("channels.common.yes", "Yes") : t("channels.common.no", "No")) : t("channels.common.na", "n/a")}</span>
        </div>
        <div>
          <span class="label">${t("channels.slack.last_start", "Last start")}</span>
          <span>${slack?.lastStartAt ? formatAgo(slack.lastStartAt) : t("channels.common.na", "n/a")}</span>
        </div>
        <div>
          <span class="label">${t("channels.slack.last_probe", "Last probe")}</span>
          <span>${slack?.lastProbeAt ? formatAgo(slack.lastProbeAt) : t("channels.common.na", "n/a")}</span>
        </div>
      </div>

      ${
        slack?.lastError
          ? html`<div class="callout danger" style="margin-top: 12px;">
            ${slack.lastError}
          </div>`
          : nothing
      }

      ${
        slack?.probe
          ? html`<div class="callout" style="margin-top: 12px;">
            ${slack.probe.ok ? t("channels.common.probe_ok", "Probe ok") : t("channels.common.probe_failed", "Probe failed")} ·
            ${slack.probe.status ?? ""} ${slack.probe.error ?? ""}
          </div>`
          : nothing
      }

      ${renderChannelConfigSection({ channelId: "slack", props })}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${() => props.onRefresh(true)}>
          ${t("channels.common.probe", "Probe")}
        </button>
      </div>
    </div>
  `;
}

import { html, nothing } from "lit";
import type { SignalStatus } from "../types.ts";
import type { ChannelsProps } from "./channels.types.ts";
import { t } from "../../i18n.ts";
import { formatAgo } from "../format.ts";
import { renderChannelConfigSection } from "./channels.config.ts";

export function renderSignalCard(params: {
  props: ChannelsProps;
  signal?: SignalStatus | null;
  accountCountLabel: unknown;
}) {
  const { props, signal, accountCountLabel } = params;

  return html`
    <div class="card">
      <div class="card-title">${t("channels.signal.title", "Signal")}</div>
      <div class="card-sub">${t("channels.signal.subtitle", "signal-cli status and channel configuration.")}</div>
      ${accountCountLabel}

      <div class="status-list" style="margin-top: 16px;">
        <div>
          <span class="label">${t("channels.common.configured", "Configured")}</span>
          <span>${signal ? (signal.configured ? t("channels.common.yes", "Yes") : t("channels.common.no", "No")) : t("channels.common.na", "n/a")}</span>
        </div>
        <div>
          <span class="label">${t("channels.common.running", "Running")}</span>
          <span>${signal ? (signal.running ? t("channels.common.yes", "Yes") : t("channels.common.no", "No")) : t("channels.common.na", "n/a")}</span>
        </div>
        <div>
          <span class="label">${t("channels.signal.base_url", "Base URL")}</span>
          <span class="monospace">${signal?.baseUrl ?? t("channels.common.na", "n/a")}</span>
        </div>
        <div>
          <span class="label">${t("channels.signal.last_start", "Last start")}</span>
          <span>${signal?.lastStartAt ? formatAgo(signal.lastStartAt) : t("channels.common.na", "n/a")}</span>
        </div>
        <div>
          <span class="label">${t("channels.signal.last_probe", "Last probe")}</span>
          <span>${signal?.lastProbeAt ? formatAgo(signal.lastProbeAt) : t("channels.common.na", "n/a")}</span>
        </div>
      </div>

      ${
        signal?.lastError
          ? html`<div class="callout danger" style="margin-top: 12px;">
            ${signal.lastError}
          </div>`
          : nothing
      }

      ${
        signal?.probe
          ? html`<div class="callout" style="margin-top: 12px;">
            ${signal.probe.ok ? t("channels.common.probe_ok", "Probe ok") : t("channels.common.probe_failed", "Probe failed")} ·
            ${signal.probe.status ?? ""} ${signal.probe.error ?? ""}
          </div>`
          : nothing
      }

      ${renderChannelConfigSection({ channelId: "signal", props })}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${() => props.onRefresh(true)}>
          ${t("channels.common.probe", "Probe")}
        </button>
      </div>
    </div>
  `;
}

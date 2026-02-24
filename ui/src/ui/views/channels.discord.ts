import { html, nothing } from "lit";
import type { DiscordStatus } from "../types.ts";
import type { ChannelsProps } from "./channels.types.ts";
import { t } from "../../i18n.ts";
import { formatAgo } from "../format.ts";
import { renderChannelConfigSection } from "./channels.config.ts";

export function renderDiscordCard(params: {
  props: ChannelsProps;
  discord?: DiscordStatus | null;
  accountCountLabel: unknown;
}) {
  const { props, discord, accountCountLabel } = params;

  return html`
    <div class="card">
      <div class="card-title">${t("channels.discord.title", "Discord")}</div>
      <div class="card-sub">${t("channels.discord.subtitle", "Bot status and channel configuration.")}</div>
      ${accountCountLabel}

      <div class="status-list" style="margin-top: 16px;">
        <div>
          <span class="label">Configured</span>
          <span>${discord?.configured ? t("channels.common.yes", "Yes") : t("channels.common.no", "No")}</span>
        </div>
        <div>
          <span class="label">${t("channels.common.running", "Running")}</span>
          <span>${discord?.running ? t("channels.common.yes", "Yes") : t("channels.common.no", "No")}</span>
        </div>
        <div>
          <span class="label">${t("channels.discord.last_start", "Last start")}</span>
          <span>${discord?.lastStartAt ? formatAgo(discord.lastStartAt) : t("channels.common.na", "n/a")}</span>
        </div>
        <div>
          <span class="label">${t("channels.discord.last_probe", "Last probe")}</span>
          <span>${discord?.lastProbeAt ? formatAgo(discord.lastProbeAt) : t("channels.common.na", "n/a")}</span>
        </div>
      </div>

      ${
        discord?.lastError
          ? html`<div class="callout danger" style="margin-top: 12px;">
            ${discord.lastError}
          </div>`
          : nothing
      }

      ${
        discord?.probe
          ? html`<div class="callout" style="margin-top: 12px;">
            ${discord.probe.ok ? t("channels.common.probe_ok", "Probe ok") : t("channels.common.probe_failed", "Probe failed")} ·
            ${discord.probe.status ?? ""} ${discord.probe.error ?? ""}
          </div>`
          : nothing
      }

      ${renderChannelConfigSection({ channelId: "discord", props })}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${() => props.onRefresh(true)}>
          ${t("channels.common.probe", "Probe")}
        </button>
      </div>
    </div>
  `;
}

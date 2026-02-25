import type { Command } from "commander";
import { loadConfig } from "../config/config.js";
import { createIdentityBindCode, listIdentityLinks } from "../identity/identity-store.js";
import { defaultRuntime } from "../runtime.js";
import { renderTable } from "../terminal/table.js";
import { theme } from "../terminal/theme.js";

export function registerIdentityCli(program: Command) {
  const identity = program.command("identity").description("Identity binding helpers");

  identity
    .command("code")
    .description("Create a bind code")
    .argument("<userKey>", "Canonical user key")
    .option("--ttl-minutes <minutes>", "TTL in minutes", (value: string) => Number(value))
    .option("--json", "Print JSON", false)
    .action(async (userKey: string, opts) => {
      const cfg = loadConfig();
      const ttlMinutes = Number.isFinite(opts.ttlMinutes) ? Number(opts.ttlMinutes) : undefined;
      const ttlMs = ttlMinutes && ttlMinutes > 0 ? ttlMinutes * 60 * 1000 : undefined;
      const result = await createIdentityBindCode({
        userKey: String(userKey),
        ttlMs,
        cfg,
      });
      if (!result.code) {
        throw new Error("Failed to create bind code.");
      }
      if (opts.json) {
        defaultRuntime.log(JSON.stringify(result, null, 2));
        return;
      }
      defaultRuntime.log(
        `${theme.success("Bind code")} ${theme.command(result.code)} ${theme.muted(`(expires ${result.expiresAt})`)}`,
      );
    });

  identity
    .command("links")
    .description("List identity links")
    .option("--json", "Print JSON", false)
    .action(async (opts) => {
      const cfg = loadConfig();
      const links = await listIdentityLinks({ cfg });
      const entries = Object.entries(links);
      if (opts.json) {
        defaultRuntime.log(JSON.stringify({ links }, null, 2));
        return;
      }
      if (entries.length === 0) {
        defaultRuntime.log(theme.muted("No identity links."));
        return;
      }
      const rows = entries.map(([userKey, identities]) => ({
        userKey,
        identities: identities.join(", "),
      }));
      const tableWidth = Math.max(60, (process.stdout.columns ?? 120) - 1);
      defaultRuntime.log(
        renderTable({
          columns: [
            { key: "userKey", header: "userKey", minWidth: 12 },
            { key: "identities", header: "identities", flex: true },
          ],
          rows,
          width: tableWidth,
          border: "none",
        }),
      );
    });
}

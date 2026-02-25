import type { CommandHandler } from "./commands-types.js";
import { logVerbose } from "../../globals.js";
import { redeemIdentityBindCode } from "../../identity/identity-store.js";
import { addChannelAllowFromStoreEntry } from "../../pairing/pairing-store.js";

const COMMAND = "/bind";

type ParsedBindCommand = { ok: true; code: string } | { ok: false; error: string };

function parseBindCommand(raw: string): ParsedBindCommand | null {
  const trimmed = raw.trim();
  if (!trimmed.toLowerCase().startsWith(COMMAND)) {
    return null;
  }
  const rest = trimmed.slice(COMMAND.length).trim();
  if (!rest) {
    return { ok: false, error: "Usage: /bind <code>" };
  }
  const code = rest.split(/\s+/)[0]?.trim() ?? "";
  if (!code) {
    return { ok: false, error: "Usage: /bind <code>" };
  }
  return { ok: true, code };
}

export const handleBindCommand: CommandHandler = async (params, allowTextCommands) => {
  if (!allowTextCommands) {
    return null;
  }
  const parsed = parseBindCommand(params.command.commandBodyNormalized);
  if (!parsed) {
    return null;
  }
  if (params.command.channel !== "telegram") {
    return {
      shouldContinue: false,
      reply: { text: "⚠️ /bind is only supported on Telegram." },
    };
  }
  if (params.isGroup) {
    return {
      shouldContinue: false,
      reply: { text: "Please DM me and send: /bind <code>" },
    };
  }
  if (!parsed.ok) {
    return { shouldContinue: false, reply: { text: parsed.error } };
  }
  const senderId = params.ctx.SenderId ?? params.command.senderId ?? "";
  if (!senderId) {
    logVerbose("Skipping /bind without sender id.");
    return {
      shouldContinue: false,
      reply: { text: "⚠️ Missing sender id. Please try again." },
    };
  }
  const identity = `telegram:${senderId}`;
  const result = await redeemIdentityBindCode({
    code: parsed.code,
    identity,
    meta: {
      username: params.ctx.SenderUsername,
      name: params.ctx.SenderName,
    },
  });
  if (!result) {
    return {
      shouldContinue: false,
      reply: { text: "⚠️ Invalid or expired bind code." },
    };
  }
  await addChannelAllowFromStoreEntry({ channel: "telegram", entry: senderId });
  return {
    shouldContinue: false,
    reply: { text: "✅ Telegram account linked. You can now DM me." },
  };
};

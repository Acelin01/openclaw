import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import lockfile from "proper-lockfile";
import type { OpenClawConfig } from "../config/config.js";
import { resolveStateDir } from "../config/paths.js";
import { loadJsonFile } from "../infra/json-file.js";

const IDENTITY_STORE_VERSION = 1;
const CODE_LENGTH = 8;
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_TTL_MS = 30 * 60 * 1000;
const STORE_LOCK_OPTIONS = {
  retries: {
    retries: 10,
    factor: 2,
    minTimeout: 100,
    maxTimeout: 10_000,
    randomize: true,
  },
  stale: 30_000,
} as const;

export type IdentityBindCode = {
  code: string;
  userKey: string;
  createdAt: string;
  expiresAt: string;
  usedAt?: string;
  identity?: string;
  meta?: Record<string, string>;
};

export type IdentityStore = {
  version: 1;
  links: Record<string, string[]>;
  codes: IdentityBindCode[];
};

export function resolveIdentityStorePath(params?: {
  cfg?: OpenClawConfig;
  env?: NodeJS.ProcessEnv;
  storePath?: string;
}): string {
  const env = params?.env ?? process.env;
  const configured = params?.storePath ?? params?.cfg?.session?.identityLinksStore;
  const stateDir = resolveStateDir(env, os.homedir);
  if (configured) {
    const trimmed = configured.trim();
    if (!trimmed) {
      return path.join(stateDir, "identity", "identity-links.json");
    }
    return path.isAbsolute(trimmed) ? trimmed : path.join(stateDir, trimmed);
  }
  return path.join(stateDir, "identity", "identity-links.json");
}

function normalizeIdentityKey(value: string | undefined | null): string {
  return (value ?? "").trim();
}

function normalizeIdentityId(value: string | undefined | null): string {
  return (value ?? "").trim().toLowerCase();
}

function normalizeIdentityLinks(
  raw: Record<string, string[]> | undefined,
): Record<string, string[]> {
  if (!raw || typeof raw !== "object") {
    return {};
  }
  const next: Record<string, string[]> = {};
  for (const [key, ids] of Object.entries(raw)) {
    const canonical = normalizeIdentityKey(key);
    if (!canonical || !Array.isArray(ids)) {
      continue;
    }
    const normalized = Array.from(
      new Set(ids.map((id) => normalizeIdentityId(id)).filter((id) => Boolean(id))),
    );
    if (normalized.length > 0) {
      next[canonical] = normalized;
    }
  }
  return next;
}

function mergeIdentityLinks(
  base: Record<string, string[]> | undefined,
  extra: Record<string, string[]> | undefined,
): Record<string, string[]> {
  const normalizedBase = normalizeIdentityLinks(base);
  const normalizedExtra = normalizeIdentityLinks(extra);
  const merged: Record<string, string[]> = { ...normalizedBase };
  for (const [key, ids] of Object.entries(normalizedExtra)) {
    const existing = merged[key] ?? [];
    const next = Array.from(new Set([...existing, ...ids]));
    if (next.length > 0) {
      merged[key] = next;
    }
  }
  return merged;
}

let cachedLinks:
  | {
      path: string;
      mtimeMs: number;
      links: Record<string, string[]>;
    }
  | undefined;

export function loadIdentityLinksFromStore(params?: {
  storePath?: string;
  cfg?: OpenClawConfig;
  env?: NodeJS.ProcessEnv;
}): Record<string, string[]> {
  const storePath = resolveIdentityStorePath({
    cfg: params?.cfg,
    env: params?.env,
    storePath: params?.storePath,
  });
  try {
    const stat = fs.statSync(storePath);
    if (cachedLinks && cachedLinks.path === storePath && cachedLinks.mtimeMs === stat.mtimeMs) {
      return cachedLinks.links;
    }
    const raw = loadJsonFile(storePath);
    if (!raw || typeof raw !== "object") {
      cachedLinks = { path: storePath, mtimeMs: stat.mtimeMs, links: {} };
      return cachedLinks.links;
    }
    const parsed = raw as Partial<IdentityStore>;
    const links = normalizeIdentityLinks(
      parsed.version === IDENTITY_STORE_VERSION ? parsed.links : undefined,
    );
    cachedLinks = { path: storePath, mtimeMs: stat.mtimeMs, links };
    return links;
  } catch {
    return {};
  }
}

export function resolveIdentityLinksForConfig(
  cfg: OpenClawConfig,
  env: NodeJS.ProcessEnv = process.env,
): Record<string, string[]> | undefined {
  const configured = cfg.session?.identityLinks;
  const storePath = cfg.session?.identityLinksStore;
  if (!storePath) {
    const normalized = normalizeIdentityLinks(configured);
    return Object.keys(normalized).length > 0 ? normalized : undefined;
  }
  const stored = loadIdentityLinksFromStore({ storePath, env });
  const merged = mergeIdentityLinks(configured, stored);
  return Object.keys(merged).length > 0 ? merged : undefined;
}

export function resolveLinkedIdentity(params: {
  identityLinks?: Record<string, string[]>;
  channel: string;
  peerId: string;
}): string | null {
  const identityLinks = params.identityLinks;
  if (!identityLinks) {
    return null;
  }
  const peerId = params.peerId.trim();
  if (!peerId) {
    return null;
  }
  const candidates = new Set<string>();
  const rawCandidate = normalizeIdentityId(peerId);
  if (rawCandidate) {
    candidates.add(rawCandidate);
  }
  const channel = normalizeIdentityId(params.channel);
  if (channel) {
    const scopedCandidate = normalizeIdentityId(`${channel}:${peerId}`);
    if (scopedCandidate) {
      candidates.add(scopedCandidate);
    }
  }
  if (candidates.size === 0) {
    return null;
  }
  for (const [canonical, ids] of Object.entries(identityLinks)) {
    const canonicalName = canonical.trim();
    if (!canonicalName || !Array.isArray(ids)) {
      continue;
    }
    for (const id of ids) {
      const normalized = normalizeIdentityId(id);
      if (normalized && candidates.has(normalized)) {
        return canonicalName;
      }
    }
  }
  return null;
}

async function readIdentityStore(filePath: string): Promise<IdentityStore> {
  try {
    const raw = await fs.promises.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw) as IdentityStore;
    if (parsed?.version !== IDENTITY_STORE_VERSION) {
      return { version: IDENTITY_STORE_VERSION, links: {}, codes: [] };
    }
    const links = normalizeIdentityLinks(parsed.links);
    const codes = Array.isArray(parsed.codes) ? parsed.codes : [];
    return { version: IDENTITY_STORE_VERSION, links, codes };
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "ENOENT") {
      return { version: IDENTITY_STORE_VERSION, links: {}, codes: [] };
    }
    return { version: IDENTITY_STORE_VERSION, links: {}, codes: [] };
  }
}

async function writeIdentityStore(filePath: string, store: IdentityStore): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.promises.mkdir(dir, { recursive: true, mode: 0o700 });
  const tmp = path.join(dir, `${path.basename(filePath)}.${crypto.randomUUID()}.tmp`);
  await fs.promises.writeFile(tmp, `${JSON.stringify(store, null, 2)}\n`, {
    encoding: "utf-8",
  });
  await fs.promises.chmod(tmp, 0o600);
  await fs.promises.rename(tmp, filePath);
}

async function withStoreLock<T>(filePath: string, fn: () => Promise<T>): Promise<T> {
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true, mode: 0o700 });
  try {
    await fs.promises.access(filePath);
  } catch {
    await writeIdentityStore(filePath, {
      version: IDENTITY_STORE_VERSION,
      links: {},
      codes: [],
    });
  }
  let release: (() => Promise<void>) | undefined;
  try {
    release = await lockfile.lock(filePath, STORE_LOCK_OPTIONS);
    return await fn();
  } finally {
    if (release) {
      try {
        await release();
      } catch {}
    }
  }
}

function generateCode(exists: Set<string>): string {
  for (let i = 0; i < 1000; i += 1) {
    let code = "";
    for (let j = 0; j < CODE_LENGTH; j += 1) {
      const index = crypto.randomInt(0, CODE_ALPHABET.length);
      code += CODE_ALPHABET[index];
    }
    if (!exists.has(code)) {
      return code;
    }
  }
  return crypto.randomUUID().slice(0, CODE_LENGTH).toUpperCase();
}

function normalizeMeta(meta: Record<string, string | undefined | null> | undefined) {
  if (!meta || typeof meta !== "object") {
    return undefined;
  }
  const normalized = Object.fromEntries(
    Object.entries(meta)
      .map(([key, value]) => [key, String(value ?? "").trim()] as const)
      .filter(([_, value]) => Boolean(value)),
  );
  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

function pruneExpiredCodes(codes: IdentityBindCode[], nowMs: number): IdentityBindCode[] {
  return codes.filter((entry) => {
    const expires = Date.parse(entry.expiresAt);
    if (Number.isNaN(expires)) {
      return false;
    }
    if (entry.usedAt) {
      return false;
    }
    return expires > nowMs;
  });
}

export async function listIdentityLinks(params?: {
  cfg?: OpenClawConfig;
  env?: NodeJS.ProcessEnv;
  storePath?: string;
}): Promise<Record<string, string[]>> {
  const filePath = resolveIdentityStorePath(params);
  return await withStoreLock(filePath, async () => {
    const store = await readIdentityStore(filePath);
    return store.links;
  });
}

export async function addIdentityLink(params: {
  canonical: string;
  identity: string;
  cfg?: OpenClawConfig;
  env?: NodeJS.ProcessEnv;
  storePath?: string;
}): Promise<Record<string, string[]>> {
  const filePath = resolveIdentityStorePath(params);
  return await withStoreLock(filePath, async () => {
    const store = await readIdentityStore(filePath);
    const canonical = normalizeIdentityKey(params.canonical);
    const identity = normalizeIdentityId(params.identity);
    if (!canonical || !identity) {
      return store.links;
    }
    const existing = store.links[canonical] ?? [];
    const next = Array.from(new Set([...existing, identity]));
    store.links[canonical] = next;
    await writeIdentityStore(filePath, store);
    cachedLinks = undefined;
    return store.links;
  });
}

export async function removeIdentityLink(params: {
  canonical: string;
  identity?: string;
  cfg?: OpenClawConfig;
  env?: NodeJS.ProcessEnv;
  storePath?: string;
}): Promise<Record<string, string[]>> {
  const filePath = resolveIdentityStorePath(params);
  return await withStoreLock(filePath, async () => {
    const store = await readIdentityStore(filePath);
    const canonical = normalizeIdentityKey(params.canonical);
    if (!canonical) {
      return store.links;
    }
    if (!params.identity) {
      delete store.links[canonical];
      await writeIdentityStore(filePath, store);
      cachedLinks = undefined;
      return store.links;
    }
    const identity = normalizeIdentityId(params.identity);
    const existing = store.links[canonical] ?? [];
    const next = existing.filter((entry) => entry !== identity);
    if (next.length === 0) {
      delete store.links[canonical];
    } else {
      store.links[canonical] = next;
    }
    await writeIdentityStore(filePath, store);
    cachedLinks = undefined;
    return store.links;
  });
}

export async function createIdentityBindCode(params: {
  userKey: string;
  ttlMs?: number;
  meta?: Record<string, string | undefined | null>;
  cfg?: OpenClawConfig;
  env?: NodeJS.ProcessEnv;
  storePath?: string;
}): Promise<{ code: string; expiresAt: string }> {
  const filePath = resolveIdentityStorePath(params);
  return await withStoreLock(filePath, async () => {
    const store = await readIdentityStore(filePath);
    const now = new Date();
    const nowMs = now.getTime();
    const ttl = params.ttlMs && params.ttlMs > 0 ? params.ttlMs : CODE_TTL_MS;
    const expiresAt = new Date(nowMs + ttl).toISOString();
    const cleanedCodes = pruneExpiredCodes(store.codes, nowMs);
    const existing = new Set(cleanedCodes.map((entry) => entry.code));
    const code = generateCode(existing);
    const userKey = normalizeIdentityKey(params.userKey);
    if (!userKey) {
      return { code: "", expiresAt };
    }
    const nextEntry: IdentityBindCode = {
      code,
      userKey,
      createdAt: now.toISOString(),
      expiresAt,
      meta: normalizeMeta(params.meta),
    };
    store.codes = [...cleanedCodes, nextEntry];
    await writeIdentityStore(filePath, store);
    return { code, expiresAt };
  });
}

export async function redeemIdentityBindCode(params: {
  code: string;
  identity: string;
  meta?: Record<string, string | undefined | null>;
  cfg?: OpenClawConfig;
  env?: NodeJS.ProcessEnv;
  storePath?: string;
}): Promise<{ userKey: string } | null> {
  const filePath = resolveIdentityStorePath(params);
  return await withStoreLock(filePath, async () => {
    const store = await readIdentityStore(filePath);
    const nowMs = Date.now();
    const code = params.code.trim().toUpperCase();
    if (!code) {
      return null;
    }
    const cleanedCodes = pruneExpiredCodes(store.codes, nowMs);
    const idx = cleanedCodes.findIndex((entry) => entry.code === code);
    if (idx < 0) {
      store.codes = cleanedCodes;
      await writeIdentityStore(filePath, store);
      return null;
    }
    const entry = cleanedCodes[idx];
    if (!entry) {
      return null;
    }
    cleanedCodes.splice(idx, 1);
    const userKey = normalizeIdentityKey(entry.userKey);
    const identity = normalizeIdentityId(params.identity);
    if (userKey && identity) {
      const existing = store.links[userKey] ?? [];
      const next = Array.from(new Set([...existing, identity]));
      store.links[userKey] = next;
    }
    store.codes = cleanedCodes;
    const meta = normalizeMeta(params.meta);
    if (meta) {
      entry.meta = { ...entry.meta, ...meta };
    }
    entry.usedAt = new Date(nowMs).toISOString();
    entry.identity = identity;
    store.codes = cleanedCodes;
    await writeIdentityStore(filePath, store);
    cachedLinks = undefined;
    return userKey ? { userKey } : null;
  });
}

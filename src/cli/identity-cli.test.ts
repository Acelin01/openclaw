import { Command } from "commander";
import { describe, expect, it, vi } from "vitest";

const createIdentityBindCode = vi.fn();
const listIdentityLinks = vi.fn();

vi.mock("../identity/identity-store.js", () => ({
  createIdentityBindCode,
  listIdentityLinks,
}));

vi.mock("../config/config.js", () => ({
  loadConfig: vi.fn().mockReturnValue({}),
}));

describe("identity cli", () => {
  it("creates bind codes", async () => {
    const { registerIdentityCli } = await import("./identity-cli.js");
    createIdentityBindCode.mockResolvedValueOnce({
      code: "ABC123",
      expiresAt: "2026-01-08T00:00:00Z",
    });

    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const program = new Command();
    program.name("test");
    registerIdentityCli(program);
    await program.parseAsync(["identity", "code", "user-1"], { from: "user" });

    expect(createIdentityBindCode).toHaveBeenCalledWith({
      userKey: "user-1",
      ttlMs: undefined,
      cfg: {},
    });
    const output = log.mock.calls.map((call) => call.join(" ")).join("\n");
    expect(output).toContain("ABC123");
  });

  it("lists identity links", async () => {
    const { registerIdentityCli } = await import("./identity-cli.js");
    listIdentityLinks.mockResolvedValueOnce({
      "user-1": ["telegram:123"],
    });

    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const program = new Command();
    program.name("test");
    registerIdentityCli(program);
    await program.parseAsync(["identity", "links"], { from: "user" });

    const output = log.mock.calls.map((call) => call.join(" ")).join("\n");
    expect(output).toContain("user-1");
    expect(output).toContain("telegram:123");
  });
});

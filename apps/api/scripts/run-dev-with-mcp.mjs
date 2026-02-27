import { spawn } from "node:child_process";

const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

const runs = [
  { name: "api", args: ["--dir", "apps/api", "dev"] },
  { name: "mcp", args: ["--dir", "apps/api", "mcp:sse"] },
];

const children = new Map();

const stopAll = () => {
  for (const child of children.values()) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }
};

process.on("SIGINT", () => {
  stopAll();
  process.exit(0);
});
process.on("SIGTERM", () => {
  stopAll();
  process.exit(0);
});

for (const run of runs) {
  const child = spawn(pnpm, run.args, {
    stdio: "inherit",
    env: process.env,
  });
  children.set(run.name, child);
  child.on("exit", (code) => {
    if (code && code !== 0) {
      process.exitCode = code;
      stopAll();
    }
  });
}

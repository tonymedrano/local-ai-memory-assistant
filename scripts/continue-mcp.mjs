#!/usr/bin/env node

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptUrl = new URL("../src/mcp/continue-launcher.ts", import.meta.url);
const child = spawn(process.execPath, ["--import", "tsx", fileURLToPath(scriptUrl)], {
  cwd: fileURLToPath(new URL("..", import.meta.url)),
  env: process.env,
  stdio: "inherit",
});

child.once("error", (error) => {
  console.error("[global-memory] failed to start Continue MCP:", error.message);
  process.exitCode = 1;
});

child.once("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exitCode = code ?? 1;
});

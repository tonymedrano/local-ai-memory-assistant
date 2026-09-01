import { config as loadEnvironment } from "dotenv";

loadEnvironment();

const { createContinueMemoryJwt } = await import("./continue-auth.js");

// This value exists only in the MCP child process and is never written to disk
// or emitted to stdout/stderr.
process.env.MEMORY_SERVICE_JWT = createContinueMemoryJwt();

const { runGlobalMemoryMcpServer } = await import("./server.js");
await runGlobalMemoryMcpServer();

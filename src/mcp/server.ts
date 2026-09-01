import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { pathToFileURL } from "node:url";
import { z } from "zod";

interface ConnectableMcpServer {
  connect(transport: unknown): Promise<void>;
  close(): Promise<void>;
}

export interface GlobalMemoryMcpConnection {
  close(): Promise<void>;
}

export interface GlobalMemoryMcpDependencies {
  createServer(): ConnectableMcpServer;
  createTransport(): unknown;
  logReady(): void;
}

export function createGlobalMemoryMcpServer(): McpServer {
  const server = new McpServer({
    name: "global-memory",
    version: "1.0.0",
  });

  server.tool(
    "search_memory",
    "Search global project memory",
    {
      query: z.string(),
    },
    async ({ query }) => {
      console.error("MCP search_memory:", query);

      const response = await fetch("http://localhost:3000/context", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      console.error("memory-service status:", response.status);

      const data = await response.json();

      if (!response.ok) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Memory service error: ${response.status}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: data.content ?? "",
          },
        ],
      };
    },
  );

  return server;
}

function defaultDependencies(): GlobalMemoryMcpDependencies {
  return {
    createServer: createGlobalMemoryMcpServer,
    createTransport: () => new StdioServerTransport(),
    logReady: () => {
      console.error("[global-memory] MCP READY - tools:", ["search_memory"]);
    },
  };
}

/**
 * Owns exactly one Protocol/transport pair. Calling this function again creates
 * an independent pair rather than reconnecting a previously connected Protocol.
 */
export async function startGlobalMemoryMcpServer(
  dependencies = defaultDependencies(),
): Promise<GlobalMemoryMcpConnection> {
  const server = dependencies.createServer();
  const transport = dependencies.createTransport();

  await server.connect(transport);
  dependencies.logReady();

  let closePromise: Promise<void> | undefined;

  return {
    close: () => {
      closePromise ??= server.close();
      return closePromise;
    },
  };
}

export async function runGlobalMemoryMcpServer(): Promise<void> {
  const connection = await startGlobalMemoryMcpServer();

  const shutdown = () => {
    void connection.close().catch((error: unknown) => {
      console.error("[global-memory] MCP shutdown failed:", error);
    });
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await runGlobalMemoryMcpServer();
}

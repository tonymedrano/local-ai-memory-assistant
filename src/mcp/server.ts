import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { pathToFileURL } from "node:url";
import { z } from "zod";

const MEMORY_SERVICE_URL =
  process.env.MEMORY_SERVICE_URL ?? "http://localhost:3000";
const MEMORY_SERVICE_JWT = process.env.MEMORY_SERVICE_JWT;

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

interface MemoryServiceResponse {
  ok: boolean;
  status: number;
  text(): Promise<string>;
}

type MemoryServiceFetch = (
  input: string,
  init: RequestInit,
) => Promise<MemoryServiceResponse>;

export interface SearchMemoryHandlerDependencies {
  memoryServiceUrl?: string;
  memoryServiceJwt?: string;
  fetchImpl?: MemoryServiceFetch;
  logError?: (message: string, ...args: unknown[]) => void;
}

export function createSearchMemoryHandler(
  dependencies: SearchMemoryHandlerDependencies = {},
) {
  const memoryServiceUrl = dependencies.memoryServiceUrl ?? MEMORY_SERVICE_URL;
  const memoryServiceJwt = dependencies.memoryServiceJwt ?? MEMORY_SERVICE_JWT;
  const fetchImpl =
    dependencies.fetchImpl ?? (fetch as unknown as MemoryServiceFetch);
  const logError = dependencies.logError ?? console.error;

  return async ({ query }: { query: string }) => {
    if (!memoryServiceJwt) {
      logError("[global-memory] MEMORY_SERVICE_JWT is missing");

      return {
        content: [
          {
            type: "text" as const,
            text: "Memory service authentication is not configured",
          },
        ],
      };
    }

    logError("MCP search_memory:", query);

    let response: MemoryServiceResponse;
    try {
      response = await fetchImpl(`${memoryServiceUrl}/context`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${memoryServiceJwt}`,
        },
        body: JSON.stringify({ query }),
      });
    } catch {
      logError("[global-memory] memory-service request failed");
      return {
        content: [
          {
            type: "text" as const,
            text: "Memory service is unavailable",
          },
        ],
      };
    }

    logError("memory-service status:", response.status);

    const raw = await response.text();
    let data: { content?: string } = {};

    if (raw) {
      try {
        data = JSON.parse(raw) as { content?: string };
      } catch {
        // Keep the response empty when a backend error is not JSON.
      }
    }

    if (!response.ok) {
      const message =
        response.status === 401
          ? "Memory service authentication failed"
          : response.status === 403
            ? "Memory service authorization failed"
            : response.status >= 500
              ? "Memory service is unavailable"
              : `Memory service error: ${response.status}`;

      return {
        content: [
          {
            type: "text" as const,
            text: message,
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
  };
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
    createSearchMemoryHandler(),
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

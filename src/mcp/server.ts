import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "global-memory-test",
  version: "1.0.1",
});

server.tool(
  "search_memory",
  "Search global project memory",
  {
    query: z.string()
  },
  async ({ query }) => {

    console.error("MCP search_memory:", query);

    const response = await fetch(
      "http://localhost:3000/context",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query
        })
      }
    );

    console.error("memory-service status:", response.status);

    const data = await response.json();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data)
        }
      ]
    };
  }
);

const transport = new StdioServerTransport();

await server.connect(transport);

console.error("Global Memory MCP ready");

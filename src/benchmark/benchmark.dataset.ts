import type { BenchmarkCase } from "./benchmark.types.js";

export const benchmarkDataset: BenchmarkCase[] = [
  {
    query: "Angular Native Federation",
    expectedTexts: [
      "Angular Native Federation usa un shell llamado sp-shell",
      "Continue conecta con memory-service mediante MCP",
    ],
  },

  {
    query: "Qdrant vector database",
    expectedTexts: [
      "Usamos Qdrant como base vectorial local",
      "Qdrant almacena embeddings",
    ],
  },

  {
    query: "Angular TypeScript",
    expectedTexts: [
      "Angular uses TypeScript for frontend development",
      "Angular requires TypeScript",
    ],
  },

  {
    query: "Node.js TypeScript",
    expectedTexts: [
      "Node.js requires TypeScript",
      "TypeScript requires Node.js",
    ],
  },
];

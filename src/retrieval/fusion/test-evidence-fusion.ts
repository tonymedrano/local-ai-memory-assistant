import { EvidenceFusion } from "./evidence.fusion.js";

const fusion = new EvidenceFusion();

const results = fusion.fuse(
  [
    {
      memory: {
        id: "1",
        text: "Node.js requires TypeScript",
        confidence: 0.9,
        metadata: {
          type: "inference",
        },
      },
      score: 0.018,
      source: "graph-evidence",
      originalSources: ["graph-evidence"],
    },
    {
      memory: {
        id: "2",
        text: "Angular uses TypeScript",
        confidence: 0.8,
      },
      score: 0.016,
      source: "graph",
      originalSources: ["graph"],
    },
  ],
  [
    {
      term: "Node.js",
      weight: 1,
      source: "entity",
    },
    {
      term: "TypeScript",
      weight: 1,
      source: "entity",
    },
  ],
);

console.table(
  results.map((r) => ({
    text: r.memory.text,
    score: r.score.toFixed(3),
    signals: r.signals,
  })),
);
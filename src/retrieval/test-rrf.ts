import { ReciprocalRankFusion } from "./hybrid/rrf.js";
import type { RetrievalResult } from "./types.js";
import { MemoryType } from "../memory/memory.types.js";

const rrf = new ReciprocalRankFusion();

const vector: RetrievalResult[] = [
  {
    memory: {
      id: "A",
      text: "Angular",
      type: MemoryType.FACT,
    },
    score: 0.95,
    source: "vector",
  },
  {
    memory: {
      id: "B",
      text: "TypeScript",
      type: MemoryType.FACT,
    },
    score: 0.82,
    source: "vector",
  },
  {
    memory: {
      id: "C",
      text: "Python",
      type: MemoryType.FACT,
    },
    score: 0.71,
    source: "vector",
  },
];

const keyword: RetrievalResult[] = [
  {
    memory: {
      id: "B",
      text: "TypeScript",
      type: MemoryType.FACT,
    },
    score: 3.2,
    source: "keyword",
  },
  {
    memory: {
      id: "A",
      text: "Angular",
      type: MemoryType.FACT,
    },
    score: 2.7,
    source: "keyword",
  },
  {
    memory: {
      id: "D",
      text: "Node.js",
      type: MemoryType.FACT,
    },
    score: 1.4,
    source: "keyword",
  },
];

console.table(
  rrf.fuse(vector, keyword).map(result => ({
    id: result.memory.id,
    text: result.memory.text,
    score: result.score,
    source: result.source,
  }))
);

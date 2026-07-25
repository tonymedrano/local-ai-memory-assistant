import { rankMemories } from "../memory/memory-ranking.service.js";
import { MemoryType } from "../memory/memory.types.js";


const memories = [
  {
    score: 0.9,
    payload: {
      text: "Usamos Qdrant como base vectorial local",
      type: MemoryType.DECISION,
      confidence: 0.85,
      importance: 0.5,
      accessCount: 2,
      createdAt: "2026-07-25T20:22:02.822Z",
    },
  },
  {
    score: 0.7,
    payload: {
      text: "El proyecto usa Docker",
      type: MemoryType.DECISION,
      confidence: 0.7,
      importance: 0.4,
      accessCount: 1,
    },
  },
];


const result = rankMemories(memories);

console.log(JSON.stringify(result, null, 2));
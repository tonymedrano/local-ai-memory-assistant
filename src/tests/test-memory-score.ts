import { calculateMemoryScore } from "../memory/memory-score.service.js";
import { MemoryType, type Memory } from "../memory/memory.types.js";

const memory: Memory = {
  text: "Usamos Qdrant como base vectorial local",

  type: MemoryType.DECISION,

  confidence: 0.85,

  importance: 0.5,

  accessCount: 2,

  createdAt: new Date().toISOString(),
};

const score = calculateMemoryScore(memory);

console.log({
  memory,
  score,
});

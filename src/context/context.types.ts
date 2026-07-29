import type { Memory } from "../memory/memory.types.js";
import type { KnowledgeItem } from "../knowledge/knowledge.types.js";
import type { DerivedKnowledge } from "../knowledge/inference/inference.types.js";
import type { Explanation } from "../knowledge/inference/explanation.types.js";

export interface ContextResult {
  memories: Memory[];

  knowledge: KnowledgeItem[];

  inference: DerivedKnowledge[];

  explanations: Explanation[];
}
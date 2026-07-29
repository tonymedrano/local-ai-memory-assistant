import type { Memory } from "../memory/memory.types.js";
import type { KnowledgeItem } from "../knowledge/knowledge.types.js";
import type { Explanation } from "../knowledge/inference/explanation.types.js";
import type { DerivedKnowledge } from "../knowledge/inference/inference.types.js";

export interface RankedContext<T> {
  item: T;
  score: number;
}

export interface ContextResult {
  memories: RankedContext<Memory>[];

  knowledge: RankedContext<KnowledgeItem>[];

  inference: RankedContext<DerivedKnowledge>[];

  explanations: Explanation[];
}

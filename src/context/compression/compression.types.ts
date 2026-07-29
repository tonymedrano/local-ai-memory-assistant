import type { Memory } from "../../memory/memory.types.js";
import type { KnowledgeItem } from "../../knowledge/knowledge.types.js";
import type { Explanation } from "../../knowledge/inference/explanation.types.js";

export interface CompressedContext {
  summary: string;
  memories: Memory[];
  knowledge: KnowledgeItem[];
  derived: Explanation[];
}

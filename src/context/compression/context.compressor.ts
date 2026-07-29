import type { CompressedContext } from "./compression.types.js";

import type { Memory } from "../../memory/memory.types.js";
import type { KnowledgeItem } from "../../knowledge/knowledge.types.js";
import type { Explanation } from "../../knowledge/inference/explanation.types.js";

export class ContextCompressor {
  compress(
    memories: Memory[],
    knowledge: KnowledgeItem[],
    explanations: Explanation[],
  ): CompressedContext {
    const uniqueMemories = this.removeDuplicateMemories(memories);

    const topMemories = uniqueMemories
      .sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0))
      .slice(0, 5);

    const summary = this.buildSummary(topMemories, knowledge, explanations);

    return {
      summary,
      memories: topMemories,
      knowledge,
      derived: explanations,
    };
  }

  private removeDuplicateMemories(memories: Memory[]): Memory[] {
    const seen = new Set<string>();

    return memories.filter((memory) => {
      const key = memory.text.trim().toLowerCase();

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);

      return true;
    });
  }

  private buildSummary(
    memories: Memory[],
    knowledge: KnowledgeItem[],
    explanations: Explanation[],
  ): string {
    const parts: string[] = [];

    for (const memory of memories) {
      parts.push(memory.text.trim());
    }

    for (const item of knowledge) {
      parts.push(`${item.subject}: ${item.content}`);
    }

    for (const explanation of explanations) {
      parts.push(explanation.conclusion);
    }

    return parts.join("\n");
  }
}

import type { Memory } from "../../memory/memory.types.js";
import { tokenize } from "./tokenizer.js";

export class KeywordIndex {
  private index = new Map<string, Set<string>>();

  add(memory: Memory) {
    const tokens = tokenize(memory.text);

    console.log(
        "INDEX ADD",
        memory.id,
        memory.text
    );

    if (!memory.id) {
        return;
    }

    for (const token of tokens) {
      if (!this.index.has(token)) {
        this.index.set(token, new Set());
      }

      this.index.get(token)!.add(memory.id);
    }
  }

  search(query: string): string[] {
    const tokens = tokenize(query);

    console.log(
        "INDEX SEARCH",
        query,
        this.index
    );

    const results = new Set<string>();

    for (const token of tokens) {
      const memories = this.index.get(token);

      if (!memories) continue;

      memories.forEach((id) => results.add(id));
    }

    return [...results];
  }
}

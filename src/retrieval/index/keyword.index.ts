import type { Memory } from "../../memory/memory.types.js";
import { tokenize } from "./tokenizer.js";

export interface Posting {
  memoryId: string;
  termFrequency: number;
}

export interface TermIndex {
  documentFrequency: number;
  postings: Map<string, Posting>;
}

export class KeywordIndex {
  private index = new Map<string, TermIndex>();

  private documentLengths = new Map<string, number>();

  private documentCount = 0;

  add(memory: Memory) {
    console.log("INDEX ADD", memory.id, memory.text);

    const tokens = tokenize(memory.text);

    const frequencies = new Map<string, number>();

    for (const token of tokens) {
      frequencies.set(token, (frequencies.get(token) ?? 0) + 1);
    }

    if (!memory.id) {
      throw new Error("Memory id is required");
    }

    if (!this.documentLengths.has(memory.id)) {
      this.documentCount++;
    }

    this.documentLengths.set(memory.id, tokens.length);

    for (const [token, termFrequency] of frequencies) {
      let term = this.index.get(token);

      if (!term) {
        term = {
          documentFrequency: 0,
          postings: new Map(),
        };

        this.index.set(token, term);
      }

      if (!term.postings.has(memory.id)) {
        term.documentFrequency++;
      }

      term.postings.set(memory.id, {
        memoryId: memory.id,
        termFrequency,
      });
    }
  }

  search(query: string): string[] {
    console.log("[KeywordIndex] SEARCH:", query);

    const results = new Set<string>();

    for (const token of tokenize(query)) {
      const term = this.index.get(token);

      if (!term) {
        continue;
      }

      for (const memoryId of term.postings.keys()) {
        results.add(memoryId);
      }
    }

    return [...results];
  }

  getTerm(token: string): TermIndex | undefined {
    return this.index.get(token);
  }

  getDocumentLength(memoryId: string): number {
    return this.documentLengths.get(memoryId) ?? 0;
  }

  getDocumentCount(): number {
    return this.documentCount;
  }

  getAverageDocumentLength(): number {
    if (this.documentCount === 0) {
      return 0;
    }

    let total = 0;

    for (const length of this.documentLengths.values()) {
      total += length;
    }

    return total / this.documentCount;
  }
}

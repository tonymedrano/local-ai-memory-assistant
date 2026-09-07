import { tokenize } from "../index/tokenizer.js";
import { KeywordIndex } from "../index/keyword.index.js";
import type { Memory } from "../../memory/memory.types.js";

export class BM25Ranker {
  private readonly k1 = 1.5;
  private readonly b = 0.75;

  constructor(private readonly index: KeywordIndex) {}

  score(query: string, memory: Memory): number {
    if (!memory.id) {
      return 0;
    }

    const queryTokens = tokenize(query);

    const documentLength = this.index.getDocumentLength(memory.id);

    if (documentLength === 0) {
      return 0;
    }

    const averageDocumentLength = this.index.getAverageDocumentLength();

    const documentCount = this.index.getDocumentCount();

    let score = 0;

    for (const token of queryTokens) {
      const term = this.index.getTerm(token);

      if (!term) {
        continue;
      }

      const posting = term.postings.get(memory.id);

      if (!posting) {
        continue;
      }

      const tf = posting.termFrequency;

      const df = term.documentFrequency;

      const idf = Math.log(1 + (documentCount - df + 0.5) / (df + 0.5));

      const numerator = tf * (this.k1 + 1);

      const denominator =
        tf +
        this.k1 *
          (1 - this.b + this.b * (documentLength / averageDocumentLength));

      score += idf * (numerator / denominator);
    }

    return score;
  }
}

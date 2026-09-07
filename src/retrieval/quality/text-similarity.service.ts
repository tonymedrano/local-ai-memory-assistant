import type { SimilarityProvider } from "./similarity.types.js";

export class TextSimilarityService implements SimilarityProvider {
  async similarity(a: string, b: string): Promise<number> {
    const wordsA = new Set(this.normalize(a));

    const wordsB = new Set(this.normalize(b));

    const intersection = [...wordsA].filter((word) => wordsB.has(word)).length;

    const union = new Set([...wordsA, ...wordsB]).size;

    if (union === 0) return 0;

    return intersection / union;
  }

  private normalize(text: string) {
    return text.toLowerCase().split(/\s+/).filter(Boolean);
  }
}

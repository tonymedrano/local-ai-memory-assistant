const STOPWORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "for",
  "to",
  "of",
  "in",
  "on",
  "with",
  "is",
  "are",
  "uses",
  "using",
]);

export class EntityExtractor {
  extract(query: string): string[] {
    return [
      ...new Set(
        query
          .toLowerCase()
          .replace(/[^\w.\- ]/g, " ")
          .split(/\s+/)
          .map((token) => token.trim())
          .filter((token) => token.length > 1)
          .filter((token) => !STOPWORDS.has(token)),
      ),
    ];
  }
}

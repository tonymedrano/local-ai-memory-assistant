export interface QueryProfile {
  query: string;

  tokenCount: number;

  specificity: number;
  complexity: number;

  semanticIntent: number;
  keywordIntent: number;
  relationalIntent: number;
  temporalIntent: number;
  comparisonIntent: number;

  hasExactTerms: boolean;
  hasEntities: boolean;
  entities: string[];
}
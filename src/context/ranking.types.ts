export interface RankingFactors {
  relevance: number;
  confidence: number;
  importance: number;
  freshness: number;
  learning: number;
}

export interface RankingResult {
  score: number;
  factors: RankingFactors;
}

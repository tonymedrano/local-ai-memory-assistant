export interface ContextQualityReport {
  score: number;
  relevance: number;
  feedback: number;
  sizePenalty: number;
  memoriesUsed: number;
  knowledgeUsed: number;
  recommendations: string[];
}

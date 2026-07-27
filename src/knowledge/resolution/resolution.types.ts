export type ResolutionDecision = "keep" | "reject" | "uncertain";

export interface ResolutionScore {
  knowledgeId: string;

  confidence: number;

  sourceScore: number;

  recencyScore: number;

  totalScore: number;
}

export interface KnowledgeResolution {
  conflictId?: string;

  subject: string;

  object: string;

  accepted?: string;

  rejected?: string;

  decision: ResolutionDecision;

  scores: ResolutionScore[];

  reasoning: string[];

  createdAt: string;
}

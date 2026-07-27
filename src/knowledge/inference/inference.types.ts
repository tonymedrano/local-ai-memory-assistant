export interface InferenceRule {
  name: string;

  description: string;

  evaluate(graph: unknown): DerivedKnowledge[];
}

export interface DerivedKnowledge {
  subject: string;

  relation: string;

  object: string;

  confidence: number;

  source: string[];

  createdAt: string;
}

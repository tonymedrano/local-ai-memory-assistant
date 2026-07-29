export interface InferenceRule {
  name: string;

  description: string;

  evaluate(graph: unknown): DerivedKnowledge[];
}

export interface DerivedKnowledge {
  subject: string;

  subjectLabel: string;

  relation: string;

  object: string;

  objectLabel: string;

  confidence: number;

  source: string[];

  createdAt: string;
}

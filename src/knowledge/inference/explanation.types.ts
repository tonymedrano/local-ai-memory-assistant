export interface Explanation {
  subject: string;

  relation: string;

  object: string;

  conclusion: string;

  reasoning: string[];

  evidence: string[];

  confidence: number;

  createdAt: string;
}

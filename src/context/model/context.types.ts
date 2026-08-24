export type ContextSource =
  | "query"
  | "memory"
  | "knowledge"
  | "derived-knowledge";

export interface ContextEntity {
  id: string;
  label: string;
  type?: string;
  confidence: number;
  source: ContextSource;
}

export interface ContextGoal {
  id: string;
  description: string;
  priority: number;
}

export interface TemporalContext {
  referenceTime: string;
  from?: string;
  to?: string;
  isRelative: boolean;
}

export interface ContextConstraint {
  type: string;
  value: string;
  source: ContextSource;
}

export interface ContextMemoryReference {
  id: string;
  relevance: number;
}

export interface ContextKnowledgeReference {
  id: string;
  relevance: number;
}

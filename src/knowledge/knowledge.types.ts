export type KnowledgeType =
  | "fact"
  | "decision"
  | "architecture"
  | "technology"
  | "preference";

export interface KnowledgeRelation {
  source: string;

  relation: string;

  target: string;
}

export interface KnowledgeItem {
  id?: string;

  type: KnowledgeType;

  subject: string;

  content: string;

  relations: KnowledgeRelation[];

  confidence: number;

  createdAt: Date;
}

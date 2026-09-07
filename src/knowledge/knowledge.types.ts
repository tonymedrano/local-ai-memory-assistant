export type KnowledgeType =
  | "fact"
  | "decision"
  | "architecture"
  | "technology"
  | "preference";


export type KnowledgeRelationType =
  | "uses"
  | "depends_on"
  | "contains"
  | "stores"
  | "calls"
  | "implements"
  | "extends";


export interface KnowledgeRelation {

  source:string;

  relation:KnowledgeRelationType;

  target:string;

}


export interface KnowledgeItem {

  id?:string;

  /** Tenant ownership carried from the source memory. */
  tenantId?: string;

  type:KnowledgeType;

  subject:string;

  content:string;

  relations:KnowledgeRelation[];

  confidence:number;

  createdAt:Date;

}

export interface SemanticQuery {
  original: string;
  entities: string[];
  expandedTerms: ExpandedTerm[];
  graphNodes: string[];
  graphRelations: string[];
  graphPaths: string[];
}

export interface ExpandedTerm {
  term: string;

  weight: number;

  source:
    | "entity"
    | "graph"
    | "relation"
    | "inferred";
}
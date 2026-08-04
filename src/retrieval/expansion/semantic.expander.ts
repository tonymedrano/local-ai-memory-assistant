import { EntityExtractor } from "../graph/entity.extractor.js";
import { GraphTraverser } from "../graph/graph.traverser.js";

import { SemanticQueryBuilder } from "./semantic.query.builder.js";
import type { SemanticQuery } from "./semantic.types.js";

export class SemanticExpander {
  private readonly extractor = new EntityExtractor();

  private readonly traverser = new GraphTraverser();

  private readonly builder = new SemanticQueryBuilder();

  expand(query: string): SemanticQuery {
    const entities = this.extractor.extract(query);

    const traversed = this.traverser.traverse(entities);

    return this.builder.build(query, entities, traversed);
  }
}

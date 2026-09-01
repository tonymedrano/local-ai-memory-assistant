import { EntityExtractor } from "../graph/entity.extractor.js";
import { GraphTraverser } from "../graph/graph.traverser.js";

import { SemanticQueryBuilder } from "./semantic.query.builder.js";
import type { SemanticQuery } from "./semantic.types.js";
import type { GraphScope } from "../../knowledge/graph/graph.types.js";

export class SemanticExpander {
  private readonly extractor = new EntityExtractor();

  private readonly traverser = new GraphTraverser();

  private readonly builder = new SemanticQueryBuilder();

  expand(scope: GraphScope, query: string): SemanticQuery {
    const entities = this.extractor.extract(query);

    const traversed = this.traverser.traverse(scope, entities);

    return this.builder.build(query, entities, traversed);
  }
}

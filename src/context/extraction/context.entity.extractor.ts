import { QueryAnalyzer } from "../../retrieval/intelligence/query.analyzer.js";
import type { ContextEntity } from "../model/context.types.js";

export class ContextEntityExtractor {
  constructor(private readonly analyzer: QueryAnalyzer = new QueryAnalyzer()) {}

  extract(query: string): ContextEntity[] {
    const profile = this.analyzer.analyze(query);

    return profile.entities.map((entity) => ({
      id: this.createId(entity),
      label: entity,
      type: "technology",
      confidence: 0.95,
      source: "query",
    }));
  }

  private createId(label: string): string {
    return label.trim().toLowerCase().replace(/\s+/g, "-");
  }
}

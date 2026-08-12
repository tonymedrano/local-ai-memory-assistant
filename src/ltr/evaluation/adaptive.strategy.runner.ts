import type { RetrievalPipeline } from "../../retrieval/pipeline/retrieval.pipeline.js";
import { QueryAnalyzer } from "../../retrieval/intelligence/query.analyzer.js";
import { StrategySelector } from "../../retrieval/intelligence/strategy.selector.js";

export class AdaptiveStrategyRunner {
  private readonly analyzer: QueryAnalyzer;
  private readonly selector: StrategySelector;

  constructor(private readonly pipeline: RetrievalPipeline) {
    this.analyzer = new QueryAnalyzer();
    this.selector = new StrategySelector();
  }

  async run(query: string) {
    const start = Date.now();

    const analysis = this.analyzer.analyze(query);

    const selection = this.selector.select({
      specificity: analysis.specificity,
      complexity: analysis.complexity,
      semanticIntent: analysis.semanticIntent,
      tokenCount: analysis.tokenCount,
    });

    const result = await this.pipeline.retrieve({
      query,
      limit: 5,
      options: {
        useLTR: true,
        strategy: selection.strategy,
      },
    });

    return {
      query,

      results: result.memories
        .map((m) => m.memory.id)
        .filter((id): id is string => Boolean(id)),

      strategy: selection.strategy,

      reason: selection.reason,

      analysis,

      elapsedMs: Date.now() - start,
    };
  }
}

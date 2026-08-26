import type { QueryProfile } from "../intelligence/query.types.js";
import type { RetrievalMode, RetrievalStrategy } from "./retrieval.strategy.js";
import type { ContextRetrievalStrategyHints } from "../../context/retrieval/context.retrieval.strategy.js";

export class RetrievalStrategySelector {
  select(
    profile: QueryProfile,
    hints?: ContextRetrievalStrategyHints,
  ): RetrievalStrategy {
    const mode = this.selectMode(profile, hints);

    const strategy = this.buildStrategy(mode, profile);

    return this.applyContextHints(strategy, hints);
  }

  private selectMode(
    profile: QueryProfile,
    hints?: ContextRetrievalStrategyHints,
  ): RetrievalMode {
    /**
     * Relationship queries have the highest priority.
     *
     * Comparisons are intentionally excluded from graph retrieval.
     */
    if (profile.relationalIntent >= 0.7 && profile.comparisonIntent < 0.7) {
      if (profile.complexity >= 0.6) {
        return "hybrid_graph";
      }

      return "graph";
    }

    /**
     * Knowledge-oriented queries.
     */
    if (
      profile.hasEntities &&
      profile.entities.length >= 2 &&
      profile.comparisonIntent < 0.7 &&
      profile.temporalIntent < 0.7
    ) {
      return "knowledge";
    }

    /**
     * Contextual knowledge is a secondary signal.
     *
     * It may suggest knowledge retrieval only when the
     * explicit query profile has not already selected a
     * stronger semantic mode.
     */
    if (
      hints?.preferredMode === "knowledge" &&
      profile.comparisonIntent < 0.7 &&
      profile.relationalIntent < 0.7 &&
      profile.temporalIntent < 0.7 &&
      !profile.hasExactTerms
    ) {
      return "knowledge";
    }

    /**
     * Explicit comparisons are semantic/hybrid queries.
     */
    if (profile.comparisonIntent >= 0.7) {
      return "hybrid";
    }

    /**
     * Explicit exact terms are the strongest signal
     * for lexical retrieval.
     */
    if (profile.hasExactTerms) {
      return "keyword";
    }

    /**
     * Complex queries benefit from combining semantic
     * and lexical retrieval.
     */
    if (profile.complexity >= 0.6) {
      return "hybrid";
    }

    /**
     * Temporal intent is handled as a modifier rather than
     * forcing a dedicated retrieval mode.
     */

    /**
     * High specificity alone does not imply keyword retrieval.
     */
    if (
      profile.specificity >= 0.8 &&
      profile.keywordIntent >= 0.8 &&
      profile.semanticIntent < 0.7
    ) {
      return "keyword";
    }

    /**
     * Medium/high specificity is normally best handled
     * through hybrid retrieval.
     */
    if (profile.specificity >= 0.6) {
      return "hybrid";
    }

    /**
     * Strong semantic intent with low specificity favors
     * vector retrieval.
     */
    if (profile.semanticIntent >= 0.7 && profile.specificity < 0.6) {
      return "vector";
    }

    /**
     * Safe fallback.
     */
    return "hybrid";
  }

  private buildStrategy(
    mode: RetrievalMode,
    profile: QueryProfile,
  ): RetrievalStrategy {
    const strategy = this.getBaseStrategy(mode);

    /**
     * Complex queries need a larger candidate pool and
     * may benefit from query expansion.
     */
    if (profile.complexity >= 0.6) {
      strategy.topK = Math.max(strategy.topK, 20);
      strategy.expandQuery = true;
    }

    /**
     * Temporal intent is a modifier, not a retrieval mode.
     */
    if (profile.temporalIntent >= 0.7) {
      strategy.temporalBoost = profile.temporalIntent;
    }

    return strategy;
  }

  private applyContextHints(
    strategy: RetrievalStrategy,
    hints?: ContextRetrievalStrategyHints,
  ): RetrievalStrategy {
    if (!hints) {
      return strategy;
    }

    /*
     * Context hints are deliberately conservative.
     *
     * They influence retrieval weights but do not replace
     * the strategy selected from explicit query intent.
     */
    strategy.vectorWeight += hints.semanticBoost;
    strategy.keywordWeight += hints.keywordBoost;
    strategy.graphWeight += hints.graphBoost;

    if (hints.temporalBoost > strategy.temporalBoost) {
      strategy.temporalBoost = hints.temporalBoost;
    }

    /*
     * Keep weights bounded.
     */
    strategy.vectorWeight = Math.min(strategy.vectorWeight, 1);
    strategy.keywordWeight = Math.min(strategy.keywordWeight, 1);
    strategy.graphWeight = Math.min(strategy.graphWeight, 1);

    return strategy;
  }

  private getBaseStrategy(mode: RetrievalMode): RetrievalStrategy {
    switch (mode) {
      case "vector":
        return {
          mode,
          vectorWeight: 1,
          keywordWeight: 0,
          graphWeight: 0,
          graphEvidenceWeight: 0,
          topK: 10,
          expandQuery: false,
          rerank: true,
          temporalBoost: 0,
        };

      case "keyword":
        return {
          mode,
          vectorWeight: 0,
          keywordWeight: 1,
          graphWeight: 0,
          graphEvidenceWeight: 0,
          topK: 10,
          expandQuery: false,
          rerank: true,
          temporalBoost: 0,
        };

      case "hybrid":
        return {
          mode,
          vectorWeight: 0.6,
          keywordWeight: 0.4,
          graphWeight: 0,
          graphEvidenceWeight: 0,
          topK: 10,
          expandQuery: false,
          rerank: true,
          temporalBoost: 0,
        };

      case "knowledge":
        return {
          mode,
          vectorWeight: 0.35,
          keywordWeight: 0.15,
          graphWeight: 0.15,
          graphEvidenceWeight: 0.35,
          topK: 15,
          expandQuery: false,
          rerank: true,
          temporalBoost: 0,
        };

      case "graph":
        return {
          mode,
          vectorWeight: 0.45,
          keywordWeight: 0.15,
          graphWeight: 0.4,
          graphEvidenceWeight: 0.4,
          topK: 15,
          expandQuery: false,
          rerank: true,
          temporalBoost: 0,
        };

      case "hybrid_graph":
        return {
          mode,
          vectorWeight: 0.5,
          keywordWeight: 0.2,
          graphWeight: 0.3,
          graphEvidenceWeight: 0.3,
          topK: 20,
          expandQuery: true,
          rerank: true,
          temporalBoost: 0,
        };
    }
  }
}

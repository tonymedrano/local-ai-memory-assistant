import type { ContextModel } from "../model/context.model.js";
import type { QueryProfile } from "../../retrieval/intelligence/query.types.js";
import type { RetrievalStrategy } from "../../retrieval/strategy/retrieval.strategy.js";

import { buildContextRetrievalSignals } from "./context.retrieval.signals.js";
import { buildContextRetrievalStrategyHints } from "./context.retrieval.strategy.js";

export interface ContextAwareRetrievalStrategyResult {
  strategy: RetrievalStrategy;
  hints: ReturnType<typeof buildContextRetrievalStrategyHints>;
}

export function applyContextToRetrievalStrategy(
  baseStrategy: RetrievalStrategy,
  profile: QueryProfile,
  context?: ContextModel,
): ContextAwareRetrievalStrategyResult {
  if (!context) {
    return {
      strategy: { ...baseStrategy },
      hints: buildContextRetrievalStrategyHints({
        entities: [],
        topics: [],
        goalTerms: [],
        constraints: [],
      }),
    };
  }

  const signals = buildContextRetrievalSignals(context);

  const hints = buildContextRetrievalStrategyHints(signals);

  const strategy: RetrievalStrategy = {
    ...baseStrategy,
  };

  /*
   * Context is a modifier.
   *
   * The QueryProfile remains authoritative for explicit
   * query intent. Context must never mutate the base strategy.
   */

  if (
    hints.preferredMode === "knowledge" &&
    profile.relationalIntent < 0.7 &&
    profile.comparisonIntent < 0.7 &&
    !profile.hasExactTerms
  ) {
    strategy.mode = "knowledge";
  }

  if (hints.semanticBoost > 0) {
    strategy.vectorWeight += hints.semanticBoost;
  }

  if (hints.keywordBoost > 0) {
    strategy.keywordWeight += hints.keywordBoost;
  }

  if (hints.graphBoost > 0) {
    strategy.graphWeight += hints.graphBoost;
    strategy.graphEvidenceWeight += hints.graphBoost;
  }

  if (hints.temporalBoost > 0) {
    strategy.temporalBoost = Math.min(
      1,
      strategy.temporalBoost + hints.temporalBoost,
    );
  }

  return {
    strategy,
    hints,
  };
}

import type { ContextModel } from "../model/context.model.js";
import { buildContextRetrievalSignals } from "./context.retrieval.signals.js";
import {
  buildContextRetrievalStrategyHints,
  type ContextRetrievalStrategyHints,
} from "./context.retrieval.strategy.js";
import type { RetrievalStrategy } from "../../retrieval/strategy/retrieval.strategy.js";

export interface ContextAwareStrategyResult {
  strategy: RetrievalStrategy;
  hints: ContextRetrievalStrategyHints;
}

export function applyContextToRetrievalStrategy(
  strategy: RetrievalStrategy,
  context?: ContextModel,
): ContextAwareStrategyResult {
  if (!context) {
    return {
      strategy: { ...strategy },
      hints: {
        semanticBoost: 0,
        keywordBoost: 0,
        graphBoost: 0,
        temporalBoost: 0,
        hasGoals: false,
        hasTopics: false,
        hasConstraints: false,
        hasTemporalContext: false,
      },
    };
  }

  const signals = buildContextRetrievalSignals(context);

  const hints = buildContextRetrievalStrategyHints(signals);

  const adjusted: RetrievalStrategy = {
    ...strategy,

    vectorWeight: strategy.vectorWeight + hints.semanticBoost,
    keywordWeight: strategy.keywordWeight + hints.keywordBoost,
    graphWeight: strategy.graphWeight + hints.graphBoost,
    temporalBoost: Math.max(strategy.temporalBoost, hints.temporalBoost),
  };

  return {
    strategy: adjusted,
    hints,
  };
}

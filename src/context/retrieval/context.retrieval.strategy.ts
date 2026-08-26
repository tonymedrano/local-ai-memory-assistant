import type { RetrievalMode } from "../../retrieval/strategy/retrieval.strategy.js";
import type { ContextRetrievalSignals } from "./context.retrieval.signals.js";

export interface ContextRetrievalStrategyHints {
  preferredMode?: RetrievalMode;

  semanticBoost: number;
  keywordBoost: number;
  graphBoost: number;
  temporalBoost: number;

  hasGoals: boolean;
  hasTopics: boolean;
  hasConstraints: boolean;
  hasTemporalContext: boolean;
}

export function buildContextRetrievalStrategyHints(
  signals: ContextRetrievalSignals,
): ContextRetrievalStrategyHints {
  const hasGoals = signals.goalTerms.length > 0;
  const hasTopics = signals.topics.length > 0;
  const hasConstraints = signals.constraints.length > 0;
  const hasTemporalContext =
    signals.temporalFrom !== undefined || signals.temporalTo !== undefined;

  let preferredMode: RetrievalMode | undefined;

  /*
   * Context provides hints only.
   *
   * The QueryProfile remains authoritative for explicit
   * query intent. Context must not override comparison,
   * relational, exact-term, or semantic decisions.
   */
  if (
    signals.topics.includes("knowledge") ||
    signals.topics.includes("retrieval")
  ) {
    preferredMode = "knowledge";
  }

  return {
    preferredMode,
    semanticBoost: hasGoals ? 0.1 : 0,
    keywordBoost: hasConstraints ? 0.1 : 0,
    graphBoost: signals.entities.length >= 2 ? 0.1 : 0,
    temporalBoost: hasTemporalContext ? 0.1 : 0,
    hasGoals,
    hasTopics,
    hasConstraints,
    hasTemporalContext,
  };
}

import type { RetrievalStrategy } from "../../retrieval/strategy/retrieval.strategy.js";
import type { ContextRetrievalSignals } from "./context.retrieval.signals.js";

export class ContextAwareRetrievalStrategy {
  apply(
    strategy: RetrievalStrategy,
    signals: ContextRetrievalSignals,
  ): RetrievalStrategy {
    const adjusted: RetrievalStrategy = {
      ...strategy,
    };

    /*
     * Multiple contextual entities are a strong signal
     * that graph evidence may be useful.
     */
    if (signals.entities.length >= 2) {
      adjusted.graphEvidenceWeight = Math.max(
        adjusted.graphEvidenceWeight,
        0.35,
      );
    }

    /*
     * Topics provide semantic context.
     *
     * We reinforce vector retrieval without forcing
     * a different retrieval mode.
     */
    if (signals.topics.length > 0) {
      adjusted.vectorWeight = Math.max(adjusted.vectorWeight, 0.4);
    }

    /*
     * Goals indicate that the query has contextual intent
     * beyond the literal query text.
     */
    if (signals.goalTerms.length > 0) {
      adjusted.topK = Math.max(adjusted.topK, Math.min(adjusted.topK + 5, 25));
    }

    /*
     * Temporal context reinforces temporal retrieval.
     *
     * Never reduce an already stronger temporal signal.
     */
    if (signals.temporalFrom || signals.temporalTo) {
      adjusted.temporalBoost = Math.max(adjusted.temporalBoost, 0.7);
    }

    /*
     * Constraints increase the importance of lexical
     * evidence because explicit terms matter more.
     */
    if (signals.constraints.length > 0) {
      adjusted.keywordWeight = Math.max(adjusted.keywordWeight, 0.2);
    }

    return adjusted;
  }
}

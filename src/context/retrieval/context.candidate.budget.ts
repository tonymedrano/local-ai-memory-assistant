import type { ContextModel } from "../model/context.model.js";
import { buildContextRetrievalSignals } from "./context.retrieval.signals.js";

export interface CandidateBudget {
  vector: number;
  keyword: number;
  graph: number;
  graphEvidence: number;
  total: number;
}

export function applyContextToCandidateBudget(
  base: CandidateBudget,
  context?: ContextModel,
): CandidateBudget {
  if (!context) {
    return { ...base };
  }

  const signals = buildContextRetrievalSignals(context);

  let vector = base.vector;
  let keyword = base.keyword;
  let graph = base.graph;
  let graphEvidence = base.graphEvidence;

  /*
   * Goals require semantic evidence.
   */
  if (signals.goalTerms.length > 0) {
    vector += 2;
  }

  /*
   * Topics reinforce semantic retrieval.
   */
  if (signals.topics.length > 0) {
    vector += 1;
  }

  /*
   * Constraints benefit from lexical retrieval because
   * exact terms and restrictions are important evidence.
   */
  if (signals.constraints.length > 0) {
    keyword += 2;
  }

  /*
   * Multiple entities provide a strong graph signal.
   */
  if (signals.entities.length >= 2) {
    graph += 2;
    graphEvidence += 2;
  }

  /*
   * Temporal context keeps additional semantic and lexical
   * candidates available for later temporal scoring/filtering.
   */
  if (signals.temporalFrom !== undefined || signals.temporalTo !== undefined) {
    vector += 1;
    keyword += 1;
  }

  return {
    vector,
    keyword,
    graph,
    graphEvidence,
    total: vector + keyword + graph + graphEvidence,
  };
}

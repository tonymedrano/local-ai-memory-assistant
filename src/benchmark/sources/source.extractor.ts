import type { RetrievalPipelineResult } from "../../retrieval/retrieval.types.js";

import type { ExtractedResult } from "./source.types.js";

export function extractResults(
  result: RetrievalPipelineResult,
): ExtractedResult[] {
  return result.memories.map((item) => ({
    text: item.memory.text,
    source: mapSource(item),
  }));
}

function mapSource(
  item: RetrievalPipelineResult["memories"][number],
): ExtractedResult["source"] {
  /**
   * `source` becomes "hybrid" after the fusion stage.
   *
   * The original retrieval source is preserved in `originalSources`,
   * so benchmark/source extraction must use that information first.
   */
  const sources = item.originalSources ?? [];

  if (sources.includes("graph-evidence")) {
    return "inference";
  }

  if (sources.includes("graph")) {
    return "knowledge";
  }

  return "memory";
}

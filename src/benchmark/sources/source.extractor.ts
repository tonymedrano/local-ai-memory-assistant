import type { RetrievalPipelineResult } from "../../retrieval/retrieval.types.js";

import type { ExtractedResult } from "./source.types.js";

export function extractResults(
  result: RetrievalPipelineResult,
): ExtractedResult[] {
  return result.memories.map((item) => ({
    text: item.memory.text,
    source: "memory",
  }));
}

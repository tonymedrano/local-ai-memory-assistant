import type { RetrievalPipelineResult } from "../../retrieval/retrieval.types.js";

export class MockRetrievalPipeline {
  async retrieve(request: {
    query: string;
    limit?: number;
  }): Promise<RetrievalPipelineResult> {
    const data: Record<string, string[]> = {
      "angular signals": [
        "memory-angular",
        "memory-typescript",
        "memory-react",
      ],

      "node docker": ["memory-node", "memory-docker"],
    };

    const ids = data[request.query] ?? [];

    return {
      memories: ids.map((id) => ({
        memory: {
          id,
        } as any,

        score: 1,

        source: "hybrid",

        rerankScore: 1,
      })),

      elapsedMs: 1,
    };
  }
}

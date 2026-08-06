import type { RetrievalPipeline } from "../../retrieval/pipeline/retrieval.pipeline.js";

export class BaselineRunner {
  constructor(private readonly pipeline: RetrievalPipeline) {}

  async run(query: string) {
    const start = Date.now();

    const result = await this.pipeline.retrieve({
      query,
      limit: 5,
      options: {
        useLTR: false,
      },
    });

    return {
      query,
      results: result.memories.map((m) => m.memory.id),
      elapsedMs: Date.now() - start,
    };
  }
}

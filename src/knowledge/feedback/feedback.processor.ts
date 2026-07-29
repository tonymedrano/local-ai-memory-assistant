import { resolutionStorage } from "../resolution/resolution.storage.js";

import { FeedbackPipeline } from "./feedback.pipeline.js";

export class FeedbackProcessor {
  constructor(private pipeline: FeedbackPipeline) {}

  async processAll() {
    const resolutions = resolutionStorage.getAll();

    const results = [];

    for (const resolution of resolutions) {
      const result = await this.pipeline.process(resolution);

      if (result) {
        results.push(result);
      }
    }

    return results;
  }
}

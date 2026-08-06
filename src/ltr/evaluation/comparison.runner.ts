import type { BenchmarkQuery, ComparisonResult } from "./benchmark.types.js";

import type { BaselineRunner } from "./baseline.runner.js";
import type { LTRRunner } from "./ltr.runner.js";

export class ComparisonRunner {
  constructor(
    private readonly baseline: BaselineRunner,
    private readonly ltr: LTRRunner,
  ) {}

  async run(dataset: BenchmarkQuery[]): Promise<ComparisonResult[]> {
    const output: ComparisonResult[] = [];

    for (const item of dataset) {
      const baseline = await this.baseline.run(item.query);

      const ltr = await this.ltr.run(item.query);

      output.push({
        query: item.query,

        baseline,

        ltr,
      });
    }

    return output;
  }
}

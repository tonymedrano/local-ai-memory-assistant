import type { BenchmarkQuery, ComparisonResult } from "./benchmark.types.js";

export class ComparisonRunner {
  constructor(
    private baseline: any,
    private ltr: any,
  ) {}

  async run(dataset: BenchmarkQuery[]): Promise<ComparisonResult[]> {
    const output = [];

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

import { writeTextFileAtomic } from "../../persistence/json.file.js";
import type { TrainingExample } from "./dataset.types.js";

export class DatasetExporter {
  constructor(private readonly outputPath: string) {}

  async export(dataset: TrainingExample[]): Promise<void> {
    const lines = dataset.map((item) => {
      return JSON.stringify({
        query: item.query,
        memoryId: item.memoryId,
        ...item.features,
        label: item.label,
      });
    });

    await writeTextFileAtomic(this.outputPath, lines.join("\n"));
  }
}

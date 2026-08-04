import fs from "node:fs";

export interface TrainingSample {
  query: string;

  memoryId: string;

  features: {
    semantic: number;
    bm25: number;
    importance: number;
  };

  label: number;
}

export class DatasetLoader {
  constructor(private filePath: string) {}

  load(): TrainingSample[] {
    const content = fs.readFileSync(this.filePath, "utf-8");

    return content
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const row = JSON.parse(line);

        return {
          query: row.query,
          memoryId: row.memoryId,
          features: {
            semantic: row.semantic,
            bm25: row.bm25,
            importance: row.importance,
          },
          label: row.label,
        };
      });
  }
}

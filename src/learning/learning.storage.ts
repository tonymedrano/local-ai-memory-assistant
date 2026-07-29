import fs from "fs/promises";
import path from "path";

import type { ContextLearning } from "./learning.types.js";

const DATA_PATH =
  process.env.LEARNING_DATA_PATH ?? "./data/context-learning.json";

export class LearningStorage {
  private file = path.resolve(DATA_PATH);

  async load(): Promise<ContextLearning[]> {
    try {
      const content = await fs.readFile(this.file, "utf-8");

      const data = JSON.parse(content);

      return data.map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
      }));
    } catch (error) {
      return [];
    }
  }

  async save(events: ContextLearning[]) {
    await fs.mkdir(path.dirname(this.file), {
      recursive: true,
    });

    await fs.writeFile(this.file, JSON.stringify(events, null, 2), "utf-8");
  }
}

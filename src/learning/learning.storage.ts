import path from "path";

import { config } from "../config.js";
import { readJsonFile, writeJsonFileAtomic } from "../persistence/json.file.js";
import type { ContextLearning } from "./learning.types.js";

const DATA_PATH = path.join(config.dataDir, "context-learning.json");

export class LearningStorage {
  private file = path.resolve(DATA_PATH);

  async load(): Promise<ContextLearning[]> {
    const data = await readJsonFile<ContextLearning[]>(this.file, []);
    return data.map((item) => ({ ...item, createdAt: new Date(item.createdAt) }));
  }

  async save(events: ContextLearning[]) {
    await writeJsonFileAtomic(this.file, events);
  }
}

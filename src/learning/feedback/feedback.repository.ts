// src/learning/feedback/feedback.store.ts

import path from "node:path";

import { config } from "../../config.js";
import {
  readJsonFileSync,
  writeJsonFileAtomicSync,
} from "../../persistence/json.file.js";
import type { FeedbackRecord } from "./feedback.types.js";

export class FeedbackRepository {
  constructor(
    private readonly file = path.join(config.dataDir, "feedback.json"),
  ) {}

  save(record: FeedbackRecord): void {
    const feedback = this.getAll();

    feedback.push(record);

    writeJsonFileAtomicSync(this.file, feedback);
  }

  getAll(): FeedbackRecord[] {
    return readJsonFileSync(this.file, []);
  }

  clear(): void {
    writeJsonFileAtomicSync(this.file, []);
  }
}

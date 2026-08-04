// src/learning/feedback/feedback.store.ts

import fs from "node:fs";
import path from "node:path";

import type { FeedbackRecord } from "./feedback.types.js";

export class FeedbackRepository {
  private readonly file = path.join(process.cwd(), "data", "feedback.json");

  save(record: FeedbackRecord): void {
    const feedback = this.getAll();

    feedback.push(record);

    fs.writeFileSync(this.file, JSON.stringify(feedback, null, 2));
  }

  getAll(): FeedbackRecord[] {
    if (!fs.existsSync(this.file)) {
      return [];
    }

    const content = fs.readFileSync(this.file, "utf8");

    if (!content.trim()) {
      return [];
    }

    return JSON.parse(content);
  }

  clear(): void {
    fs.writeFileSync(this.file, "[]");
  }
}

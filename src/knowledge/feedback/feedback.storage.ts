import fs from "node:fs";
import path from "node:path";

import type { KnowledgeFeedback } from "./feedback.types.js";

const FILE_PATH = path.resolve("data/knowledge-feedback.json");

class FeedbackStorage {
  private feedback: KnowledgeFeedback[] = [];

  constructor() {
    this.load();
  }

  private load() {
    if (!fs.existsSync(FILE_PATH)) {
      this.save();

      return;
    }

    this.feedback = JSON.parse(fs.readFileSync(FILE_PATH, "utf-8"));

    console.log(
      `[FeedbackStorage] Loaded ${this.feedback.length} feedback entries`,
    );
  }

  private save() {
    fs.writeFileSync(FILE_PATH, JSON.stringify(this.feedback, null, 2));
  }

  add(item: KnowledgeFeedback) {
    this.feedback.push(item);

    this.save();
  }

  getAll() {
    return this.feedback;
  }
}

export const feedbackStorage = new FeedbackStorage();

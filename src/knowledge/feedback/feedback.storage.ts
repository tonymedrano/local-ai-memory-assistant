import path from "node:path";

import { config } from "../../config.js";
import { readJsonFileSync, writeJsonFileAtomicSync } from "../../persistence/json.file.js";
import type { KnowledgeFeedback } from "./feedback.types.js";

const FILE_PATH = path.join(config.dataDir, "knowledge-feedback.json");

class FeedbackStorage {
  private feedback: KnowledgeFeedback[] = [];

  constructor() {
    this.load();
  }

  private load() {
    const feedback = readJsonFileSync<KnowledgeFeedback[] | undefined>(FILE_PATH, undefined);
    if (!feedback) {
      this.save();

      return;
    }

    this.feedback = feedback;

    console.log(
      `[FeedbackStorage] Loaded ${this.feedback.length} feedback entries`,
    );
  }

  private save() {
    writeJsonFileAtomicSync(FILE_PATH, this.feedback);
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

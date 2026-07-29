import fs from "node:fs";
import path from "node:path";

import type { DerivedKnowledge } from "./inference.types.js";

const DATA_DIR = path.resolve("data");

const FILE_PATH = path.join(DATA_DIR, "derived-knowledge.json");

class InferenceStorage {
  constructor() {
    this.ensureStorage();
  }

  private ensureStorage() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, {
        recursive: true,
      });
    }

    if (!fs.existsSync(FILE_PATH)) {
      this.save([]);
    }
  }

  load(): DerivedKnowledge[] {
    const content = fs.readFileSync(FILE_PATH, "utf-8");

    return JSON.parse(content);
  }

  save(knowledge: DerivedKnowledge[]) {
    fs.writeFileSync(FILE_PATH, JSON.stringify(knowledge, null, 2), "utf-8");
  }

  clear() {
    this.save([]);
  }
}

export const inferenceStorage = new InferenceStorage();

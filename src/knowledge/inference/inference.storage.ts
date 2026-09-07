import path from "node:path";

import { config } from "../../config.js";
import { readJsonFileSync, writeJsonFileAtomicSync } from "../../persistence/json.file.js";
import type { DerivedKnowledge } from "./inference.types.js";

const DATA_DIR = config.dataDir;

const FILE_PATH = path.join(DATA_DIR, "derived-knowledge.json");

class InferenceStorage {
  constructor() {
    this.ensureStorage();
  }

  private ensureStorage() {
    if (!readJsonFileSync<DerivedKnowledge[] | undefined>(FILE_PATH, undefined)) {
      this.save([]);
    }
  }

  load(): DerivedKnowledge[] {
    return readJsonFileSync(FILE_PATH, []);
  }

  save(knowledge: DerivedKnowledge[]) {
    writeJsonFileAtomicSync(FILE_PATH, knowledge);
  }

  clear() {
    this.save([]);
  }
}

export const inferenceStorage = new InferenceStorage();

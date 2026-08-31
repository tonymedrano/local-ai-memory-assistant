import path from "node:path";

import { config } from "../config.js";
import { readJsonFileSync, writeJsonFileAtomicSync } from "../persistence/json.file.js";
import type { KnowledgeItem } from "./knowledge.types.js";

const DATA_DIR = config.dataDir;

const FILE_PATH = path.join(DATA_DIR, "knowledge.json");

function ensureFile() {
  if (!readJsonFileSync<KnowledgeItem[] | undefined>(FILE_PATH, undefined)) {
    writeJsonFileAtomicSync(FILE_PATH, []);
  }
}

class KnowledgeStorage {
  constructor() {
    ensureFile();
  }

  load(): KnowledgeItem[] {
    return readJsonFileSync(FILE_PATH, []);
  }

  save(items: KnowledgeItem[]): void {
    writeJsonFileAtomicSync(FILE_PATH, items);
  }
}

export const knowledgeStorage = new KnowledgeStorage();

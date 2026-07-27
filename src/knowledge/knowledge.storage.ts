import fs from "node:fs";
import path from "node:path";

import type { KnowledgeItem } from "./knowledge.types.js";

const DATA_DIR = path.resolve("data");

const FILE_PATH = path.join(DATA_DIR, "knowledge.json");

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, {
      recursive: true,
    });
  }

  if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, JSON.stringify([], null, 2));
  }
}

class KnowledgeStorage {
  constructor() {
    ensureFile();
  }

  load(): KnowledgeItem[] {
    const raw = fs.readFileSync(FILE_PATH, "utf-8");

    if (!raw) {
      return [];
    }

    return JSON.parse(raw);
  }

  save(items: KnowledgeItem[]): void {
    fs.writeFileSync(FILE_PATH, JSON.stringify(items, null, 2));
  }
}

export const knowledgeStorage = new KnowledgeStorage();

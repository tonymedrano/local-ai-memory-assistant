import fs from "node:fs";
import path from "node:path";

import type { KnowledgeResolution } from "./resolution.types.js";

const FILE_PATH = path.resolve("data/knowledge-resolutions.json");

class ResolutionStorage {
  private resolutions: KnowledgeResolution[] = [];

  constructor() {
    this.load();
  }

  private load() {
    if (!fs.existsSync(FILE_PATH)) {
      this.save();

      return;
    }

    const content = fs.readFileSync(FILE_PATH, "utf-8");

    this.resolutions = JSON.parse(content);

    console.log(
      `[ResolutionStorage] Loaded ${this.resolutions.length} resolutions`,
    );
  }

  private save() {
    fs.writeFileSync(FILE_PATH, JSON.stringify(this.resolutions, null, 2));
  }

  add(resolution: KnowledgeResolution) {
    this.resolutions.push(resolution);

    this.save();
  }

  getAll() {
    return this.resolutions;
  }

  findBySubject(subject: string) {
    return this.resolutions.filter((item) => item.subject === subject);
  }
}

export const resolutionStorage = new ResolutionStorage();

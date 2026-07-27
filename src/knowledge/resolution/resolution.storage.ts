import fs from "node:fs";
import path from "node:path";

import type { KnowledgeResolution } from "./resolution.types.js";

const FILE_PATH = path.resolve("data/knowledge-resolutions.json");

class ResolutionStorage {
  private resolutions: KnowledgeResolution[] = [];

  constructor() {
    this.load();
  }

  private getId(resolution: KnowledgeResolution): string {
    return [resolution.subject, resolution.object].join("-");
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
    const key = this.getKey(resolution);

    const index = this.resolutions.findIndex(
      (item) => this.getKey(item) === key,
    );

    if (index >= 0) {
      this.resolutions[index] = {
        ...resolution,
        createdAt: new Date().toISOString(),
      };
    } else {
      this.resolutions.push(resolution);
    }

    this.save();
  }

  private getKey(resolution: KnowledgeResolution): string {
    return [resolution.subject, resolution.object].join(":");
  }

  getAll() {
    return this.resolutions;
  }

  findBySubject(subject: string) {
    return this.resolutions.filter((item) => item.subject === subject);
  }
}

export const resolutionStorage = new ResolutionStorage();

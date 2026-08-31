import path from "node:path";

import { config } from "../../config.js";
import { readJsonFileSync, writeJsonFileAtomicSync } from "../../persistence/json.file.js";
import type { KnowledgeResolution } from "./resolution.types.js";

const FILE_PATH = path.join(config.dataDir, "knowledge-resolutions.json");

class ResolutionStorage {
  private resolutions: KnowledgeResolution[] = [];

  constructor() {
    this.load();
  }

  private getId(resolution: KnowledgeResolution): string {
    return [resolution.subject, resolution.object].join("-");
  }

  private load() {
    const resolutions = readJsonFileSync<KnowledgeResolution[] | undefined>(FILE_PATH, undefined);
    if (!resolutions) {
      this.save();

      return;
    }

    this.resolutions = resolutions;

    console.log(
      `[ResolutionStorage] Loaded ${this.resolutions.length} resolutions`,
    );
  }

  private save() {
    writeJsonFileAtomicSync(FILE_PATH, this.resolutions);
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

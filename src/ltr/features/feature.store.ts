import fs from "node:fs";
import path from "node:path";

import type { StoredFeature } from "./feature.types.js";
import type { FeatureVector } from "./feature.types.js";

export class FeatureStore {
  private readonly filePath = path.join(
    process.cwd(),
    "data",
    "ltr",
    "features.jsonl",
  );

  constructor() {
    this.ensureStorage();
  }

  private ensureStorage(): void {
    const dir = path.dirname(this.filePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, "");
    }
  }

  save(query: string, memoryId: string, features: FeatureVector): void {
    const all = this.findAll();

    const filtered = all.filter(
      (f) => !(f.query === query && f.memoryId === memoryId),
    );

    filtered.push({
      query,
      memoryId,
      features,
      createdAt: new Date(),
    });

    const content = filtered.map((f) => JSON.stringify(f)).join("\n");

    fs.writeFileSync(this.filePath, content + (filtered.length ? "\n" : ""));
  }

  find(query: string, memoryId: string): FeatureVector | undefined {
    const item = this.findAll().find(
      (f) => f.query === query && f.memoryId === memoryId,
    );

    return item?.features;
  }

  findAll(): StoredFeature[] {
    if (!fs.existsSync(this.filePath)) {
      return [];
    }

    return fs
      .readFileSync(this.filePath, "utf8")
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const item = JSON.parse(line);

        return {
          ...item,
          createdAt: new Date(item.createdAt),
        };
      });
  }

  count(): number {
    return this.findAll().length;
  }

  clear(): void {
    fs.writeFileSync(this.filePath, "");
  }
}

import { randomUUID } from "crypto";
import path from "node:path";

import { config } from "../../config.js";
import { readJsonFile, writeJsonFileAtomic } from "../../persistence/json.file.js";
import type { FeedbackScope, RankingFeedback } from "./feedback.types.js";

export class FeedbackRepository {
  private items: RankingFeedback[] = [];
  private loaded = false;

  constructor(
    private readonly filePath = path.join(config.dataDir, "ranking-feedback.json"),
  ) {}

  private async load(): Promise<void> {
    if (this.loaded) {
      return;
    }

    this.loaded = true;

    const data = await readJsonFile<{ schemaVersion: 1; records: RankingFeedback[] } | RankingFeedback[]>(this.filePath, { schemaVersion: 1, records: [] });
    const records = Array.isArray(data) ? data : data.schemaVersion === 1 ? data.records : [];

    this.items = records.filter((item) => item.scope?.kind === "tenant" || item.scope?.kind === "system").map((item) => ({
      ...item,
      createdAt: new Date(item.createdAt),
    }));
  }

  private async persist(): Promise<void> {
    await writeJsonFileAtomic(this.filePath, { schemaVersion: 1, records: this.items });
  }

  async save(
    scope: FeedbackScope,
    feedback: Omit<RankingFeedback, "id" | "createdAt" | "scope">,
  ): Promise<RankingFeedback> {
    await this.load();

    if (scope.kind === "legacy-unowned") throw new Error("Legacy-unowned feedback is not executable");
    const item: RankingFeedback = {
      id: randomUUID(),
      scope,
      ...feedback,
      createdAt: new Date(),
    };

    this.items.push(item);

    await this.persist();

    return item;
  }

  async saveMany(feedback: RankingFeedback[]): Promise<void> {
    await this.load();

    this.items.push(...feedback);

    await this.persist();
  }

  async findAll(scope: FeedbackScope): Promise<RankingFeedback[]> {
    await this.load();

    return this.items.filter((item) => item.scope.kind === scope.kind && (scope.kind !== "tenant" || item.scope.kind === "tenant" && item.scope.tenantId === scope.tenantId));
  }

  async findSince(scope: FeedbackScope, date: Date): Promise<RankingFeedback[]> {
    await this.load();

    return this.items.filter((item) => item.createdAt >= date && item.scope.kind === scope.kind && (scope.kind !== "tenant" || item.scope.kind === "tenant" && item.scope.tenantId === scope.tenantId));
  }

  async clear(): Promise<void> {
    await this.load();

    this.items = [];

    await this.persist();
  }

  async count(): Promise<number> {
    await this.load();

    return this.items.length;
  }
}

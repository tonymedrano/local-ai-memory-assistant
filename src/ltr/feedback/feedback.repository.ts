import { randomUUID } from "crypto";
import path from "node:path";

import { config } from "../../config.js";
import { readJsonFile, writeJsonFileAtomic } from "../../persistence/json.file.js";
import type { RankingFeedback } from "./feedback.types.js";

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

    const data = await readJsonFile<RankingFeedback[]>(this.filePath, []);

    this.items = data.map((item) => ({
      ...item,
      createdAt: new Date(item.createdAt),
    }));
  }

  private async persist(): Promise<void> {
    await writeJsonFileAtomic(this.filePath, this.items);
  }

  async save(
    feedback: Omit<RankingFeedback, "id" | "createdAt">,
  ): Promise<RankingFeedback> {
    await this.load();

    const item: RankingFeedback = {
      id: randomUUID(),
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

  async findAll(): Promise<RankingFeedback[]> {
    await this.load();

    return [...this.items];
  }

  async findSince(date: Date): Promise<RankingFeedback[]> {
    await this.load();

    return this.items.filter((item) => item.createdAt >= date);
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

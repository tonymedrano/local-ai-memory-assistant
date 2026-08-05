import { existsSync } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";

import type { RankingFeedback } from "./feedback.types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = join(__dirname, "../../data");
const DATA_FILE = join(DATA_DIR, "ranking-feedback.json");

export class FeedbackRepository {
  private items: RankingFeedback[] = [];
  private loaded = false;

  private async load(): Promise<void> {
    if (this.loaded) {
      return;
    }

    this.loaded = true;

    if (!existsSync(DATA_FILE)) {
      return;
    }

    const raw = await readFile(DATA_FILE, "utf8");

    if (!raw.trim()) {
      return;
    }

    const data = JSON.parse(raw) as RankingFeedback[];

    this.items = data.map((item) => ({
      ...item,
      createdAt: new Date(item.createdAt),
    }));
  }

  private async persist(): Promise<void> {
    await mkdir(DATA_DIR, {
      recursive: true,
    });

    await writeFile(DATA_FILE, JSON.stringify(this.items, null, 2), "utf8");
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

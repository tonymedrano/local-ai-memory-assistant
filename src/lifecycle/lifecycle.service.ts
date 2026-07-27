import { MemoryRepository } from "../memory/memory.repository.js";

const repository = new MemoryRepository();

interface LifecyclePayload {
  importance?: number;

  accessCount?: number;

  lastAccess?: string;

  createdAt?: string;

  archived?: boolean;

  [key: string]: unknown;
}

interface LifecycleMemory {
  id: string | number;

  payload?: LifecyclePayload;
}

export class LifecycleService {
  async run(): Promise<void> {
    console.log("[Lifecycle] Starting...");

    const memories = (await repository.getAll()) as LifecycleMemory[];

    await this.updateImportance(memories);

    await this.decayImportance(memories);

    await this.archiveOldMemories(memories);

    console.log("[Lifecycle] Finished.");
  }

  private async updateImportance(memories: LifecycleMemory[]): Promise<void> {
    console.log("[Lifecycle] updateImportance()");

    for (const item of memories) {
      const payload = item.payload ?? {};

      const accessCount = Number(payload.accessCount ?? 0);

      if (accessCount <= 0) {
        continue;
      }

      const importance = Number(payload.importance ?? 0.5);

      await repository.update(
        item.id,

        {
          importance: Math.min(importance + 0.05, 10),
        },
      );
    }
  }

  private async decayImportance(memories: LifecycleMemory[]): Promise<void> {
    console.log("[Lifecycle] decayImportance()");

    for (const item of memories) {
      const payload = item.payload ?? {};

      const importance = Number(payload.importance ?? 0.5);

      const lastAccess = payload.lastAccess ?? payload.createdAt;

      if (!lastAccess) {
        continue;
      }

      const days = this.daysSince(lastAccess);

      if (days <= 0) {
        continue;
      }

      const newImportance = Math.max(importance - days * 0.001, 0);

      if (newImportance !== importance) {
        await repository.update(
          item.id,

          {
            importance: newImportance,
          },
        );
      }
    }
  }

  private async archiveOldMemories(memories: LifecycleMemory[]): Promise<void> {
    console.log("[Lifecycle] archiveOldMemories()");

    for (const item of memories) {
      const payload = item.payload ?? {};

      const importance = Number(payload.importance ?? 0);

      const lastAccess = payload.lastAccess ?? payload.createdAt;

      if (!lastAccess) {
        continue;
      }

      const days = this.daysSince(lastAccess);

      if (importance < 0.5 && days > 180) {
        await repository.update(
          item.id,

          {
            archived: true,
          },
        );
      }
    }
  }

  private daysSince(date: string): number {
    const diff = Date.now() - new Date(date).getTime();

    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}

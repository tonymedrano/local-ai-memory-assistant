import { consolidationService, memoryRepository } from "../core/container.js";

import type { Memory } from "../memory/memory.types.js";

const CONSOLIDATION_WINDOW_DAYS = 7;

export class LifecycleService {
  async run(): Promise<void> {
    console.log("[Lifecycle] Starting...");

    const memories = await memoryRepository.getAll();

    await this.updateImportance(memories);

    await this.decayImportance(memories);

    await this.archiveOldMemories(memories);

    await this.consolidateMemories(memories);

    console.log("[Lifecycle] Finished.");
  }

  private async consolidateMemories(memories: Memory[]): Promise<void> {
    console.log("[Lifecycle] consolidateMemories()");

    const processed = new Set<string>();

    for (const memory of memories) {
      if (!memory.id) {
        continue;
      }

      if (processed.has(memory.id)) {
        continue;
      }

      if (memory.archived) {
        continue;
      }

      if (!memory.createdAt) {
        continue;
      }

      const age = this.daysSince(memory.createdAt);

      if (age > CONSOLIDATION_WINDOW_DAYS) {
        continue;
      }

      try {
        const result = await consolidationService.consolidateById(memory.id);

        if (result.consolidated) {
          console.log(
            `[Lifecycle] Consolidated ${result.sourceMemoryIds.join(
              ", ",
            )} -> ${result.memory?.id}`,
          );

          for (const sourceId of result.sourceMemoryIds) {
            processed.add(sourceId);
          }
        }
      } catch (error) {
        console.error(
          `[Lifecycle] Consolidation failed for ${memory.id}:`,
          error,
        );
      }
    }
  }

  private async updateImportance(memories: Memory[]): Promise<void> {
    console.log("[Lifecycle] updateImportance()");

    for (const memory of memories) {
      const accessCount = Number(memory.accessCount ?? 0);

      if (accessCount <= 0) {
        continue;
      }

      const importance = Number(memory.importance ?? 0.5);

      await memoryRepository.update(memory.id!, {
        importance: Math.min(importance + 0.05, 10),
      });
    }
  }

  private async decayImportance(memories: Memory[]): Promise<void> {
    console.log("[Lifecycle] decayImportance()");

    for (const memory of memories) {
      const importance = Number(memory.importance ?? 0.5);

      const lastAccess = memory.lastAccess ?? memory.createdAt;

      if (!lastAccess) {
        continue;
      }

      const days = this.daysSince(lastAccess);

      if (days <= 0) {
        continue;
      }

      const newImportance = Math.max(importance - days * 0.001, 0);

      if (newImportance !== importance) {
        await memoryRepository.update(memory.id!, {
          importance: newImportance,
        });
      }
    }
  }

  private async archiveOldMemories(memories: Memory[]): Promise<void> {
    console.log("[Lifecycle] archiveOldMemories()");

    for (const memory of memories) {
      const importance = Number(memory.importance ?? 0);

      const lastAccess = memory.lastAccess ?? memory.createdAt;

      if (!lastAccess) {
        continue;
      }

      const days = this.daysSince(lastAccess);

      if (importance < 0.5 && days > 180) {
        await memoryRepository.update(memory.id!, {
          archived: true,
        });
      }
    }
  }

  private daysSince(date: string): number {
    const diff = Date.now() - new Date(date).getTime();

    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}

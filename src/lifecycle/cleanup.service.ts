import type { MemoryRepository } from "../memory/memory.repository.js";
import type { Memory } from "../memory/memory.types.js";

export const ARCHIVED_MEMORY_RETENTION_DAYS = 30;

export interface CleanupResult {
  scanned: number;
  eligible: number;
  deleted: number;
  skippedActive: number;
  skippedRecent: number;
  skippedInvalidDate: number;
}

export type CleanupMemoryRepository = Pick<
  MemoryRepository,
  "getAll" | "delete"
>;

export class CleanupService {
  constructor(
    private readonly memoryRepository: CleanupMemoryRepository,
    private readonly retentionDays = ARCHIVED_MEMORY_RETENTION_DAYS,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async run(): Promise<CleanupResult> {
    const memories = await this.memoryRepository.getAll();
    const result: CleanupResult = {
      scanned: memories.length,
      eligible: 0,
      deleted: 0,
      skippedActive: 0,
      skippedRecent: 0,
      skippedInvalidDate: 0,
    };
    const candidates: Memory[] = [];

    for (const memory of memories) {
      if (!memory.archived) {
        result.skippedActive++;
        continue;
      }

      if (!memory.id || !this.isPastRetention(memory.updatedAt)) {
        result.skippedInvalidDate++;
        continue;
      }

      if (!this.isPastRetention(memory.updatedAt, this.retentionDays)) {
        result.skippedRecent++;
        continue;
      }

      candidates.push(memory);
    }

    result.eligible = candidates.length;

    for (const memory of candidates) {
      await this.memoryRepository.delete(memory.id!);
      result.deleted++;
    }

    return result;
  }

  private isPastRetention(
    updatedAt: string | undefined,
    retentionDays = 0,
  ): boolean {
    if (!updatedAt) {
      return false;
    }

    const updatedAtMs = Date.parse(updatedAt);

    if (!Number.isFinite(updatedAtMs)) {
      return false;
    }

    const ageMs = this.now().getTime() - updatedAtMs;

    return ageMs >= retentionDays * 24 * 60 * 60 * 1000;
  }
}

import { randomUUID } from "node:crypto";

import { createEmbedding, generateText } from "../../ai/ollama.service.js";

import type { MemoryRepository } from "../memory.repository.js";
import type { Memory } from "../memory.types.js";

import type { ConsolidationResult } from "./consolidation.types.js";

export class ConsolidationService {
  constructor(private readonly memoryRepository: MemoryRepository) {}

  async consolidateById(memoryId: string): Promise<ConsolidationResult> {
    const memory = await this.memoryRepository.findById(memoryId);

    if (!memory) {
      throw new Error(`Memory not found: ${memoryId}`);
    }

    return this.consolidate(memory);
  }

  async consolidate(memory: Memory): Promise<ConsolidationResult> {
    if (!memory.id) {
      throw new Error("Cannot consolidate memory without id");
    }

    if (memory.archived) {
      return {
        consolidated: false,
        sourceMemoryIds: [memory.id],
        reason: "Memory is already archived",
      };
    }

    const embedding = await createEmbedding(memory.text);

    const similar = await this.memoryRepository.findSimilar(
      embedding,
      memory.project,
      memory.id,
    );

    if (!similar) {
      return {
        consolidated: false,
        sourceMemoryIds: [memory.id],
        reason: "No consolidation candidate found",
      };
    }

    const similarId = String(similar.id);

    if (similarId === memory.id) {
      return {
        consolidated: false,
        sourceMemoryIds: [memory.id],
        reason: "Similarity candidate is the same memory",
      };
    }

    const similarMemory = similar.payload;

    if (similarMemory.archived) {
      return {
        consolidated: false,
        sourceMemoryIds: [memory.id, similarId],
        reason: "Similarity candidate is archived",
      };
    }

    const consolidatedText = await this.generateConsolidatedText(
      memory,
      similarMemory,
    );

    const consolidatedId = randomUUID();
    const now = new Date().toISOString();

    const consolidatedMemory: Memory = {
      id: consolidatedId,

      text: consolidatedText,

      project: memory.project ?? similarMemory.project,

      type: memory.type ?? similarMemory.type,

      importance: Math.max(
        memory.importance ?? 0,
        similarMemory.importance ?? 0,
      ),

      confidence:
        ((memory.confidence ?? 0.8) + (similarMemory.confidence ?? 0.8)) / 2,

      accessCount: (memory.accessCount ?? 0) + (similarMemory.accessCount ?? 0),

      lastAccess: memory.lastAccess ?? similarMemory.lastAccess,

      archived: false,

      createdAt: now,
      updatedAt: now,

      origin: "consolidation",

      tags: [
        ...new Set([...(memory.tags ?? []), ...(similarMemory.tags ?? [])]),
      ],

      metadata: {
        consolidation: {
          type: "consolidated",
          sourceMemoryIds: [memory.id, similarId],
        },
      },
    };

    const consolidatedEmbedding = await createEmbedding(consolidatedText);

    await this.memoryRepository.save(
      consolidatedId,
      consolidatedEmbedding,
      consolidatedMemory,
    );

    await this.memoryRepository.update(memory.id, {
      archived: true,
      metadata: {
        ...(memory.metadata ?? {}),
        consolidation: {
          type: "source",
          consolidatedInto: consolidatedId,
        },
      },
    });

    await this.memoryRepository.update(similarId, {
      archived: true,
      metadata: {
        ...(similarMemory.metadata ?? {}),
        consolidation: {
          type: "source",
          consolidatedInto: consolidatedId,
        },
      },
    });

    return {
      consolidated: true,
      memory: consolidatedMemory,
      sourceMemoryIds: [memory.id, similarId],
    };
  }

  private async generateConsolidatedText(
    first: Memory,
    second: Memory,
  ): Promise<string> {
    const prompt = `
You are a memory consolidation system.

Combine the following two memories into ONE concise,
accurate memory.

Rules:
- Preserve important factual information.
- Remove redundancy.
- Do not invent information.
- Do not add commentary.
- Return only the consolidated memory.
- Keep it concise.

Memory 1:
${first.text}

Memory 2:
${second.text}
`.trim();

    return generateText(prompt);
  }
}

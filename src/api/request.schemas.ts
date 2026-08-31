import { z } from "zod";

import { MemoryType } from "../memory/memory.types.js";

const text = z.string().trim().min(1).max(10_000);
const identifier = z.string().trim().min(1).max(255);

export const memorySchema = z
  .object({
    text,
    project: identifier.optional(),
    type: z.nativeEnum(MemoryType).optional(),
    importance: z.number().finite().min(0).max(10).optional(),
    confidence: z.number().finite().min(0).max(1).optional(),
    origin: identifier.optional(),
    tags: z.array(identifier).max(100).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
    source: z
      .object({
        file: z.string().trim().min(1).max(2_000).optional(),
        line: z.number().int().positive().optional(),
      })
      .optional(),
  })
  .passthrough();

export const memorySearchSchema = z.object({
  query: text,
  options: z
    .object({
      project: identifier.optional(),
      type: z.nativeEnum(MemoryType).optional(),
    })
    .optional(),
});

export const contextRequestSchema = z.object({
  query: text,
});

export const contextFeedbackSchema = z.object({
  query: text,
  memories: z.array(identifier).min(1).max(100),
  feedback: z.enum(["positive", "negative"]),
});

export const pathParameterSchema = identifier;

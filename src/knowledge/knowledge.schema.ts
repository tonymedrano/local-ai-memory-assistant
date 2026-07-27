import { z } from "zod";

export const KnowledgeSchema = z.object({
  type: z.enum([
    "fact",
    "decision",
    "architecture",
    "technology",
    "preference",
  ]),

  subject: z.string(),

  content: z.string(),

  relations: z.array(
    z.object({
      source: z.string(),

      relation: z.string(),

      target: z.string(),
    }),
  ),

  confidence: z.number(),
});

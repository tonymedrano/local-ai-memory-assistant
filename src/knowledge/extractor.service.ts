import { OllamaClient } from "../llm/ollama.client.js";

import { KNOWLEDGE_EXTRACTION_PROMPT } from "./prompts/extractor.prompt.js";
import { KnowledgeSchema } from "./knowledge.schema.js";

import type {
  KnowledgeItem,
  KnowledgeRelationType
} from "./knowledge.types.js";

export class KnowledgeExtractor {
  constructor(private llm = new OllamaClient()) {}

  async extract(memory: string): Promise<KnowledgeItem> {
    const prompt = KNOWLEDGE_EXTRACTION_PROMPT + memory;

    const response = await this.llm.complete(prompt);

    const knowledge = KnowledgeSchema.parse(JSON.parse(response));

    const confidence = Math.min(
      Math.max(Number(knowledge.confidence) || 0.5, 0),
      1,
    );

    return {
      ...knowledge,

      relations: (knowledge.relations ?? []).map(
    (relation:any) => ({
      source: relation.source,
      relation: relation.relation as KnowledgeRelationType,
      target: relation.target
    })
  ),

      confidence,

      createdAt: new Date(),
    };
  }
}

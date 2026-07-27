import { runJob } from "./job.runner.js";

import { KnowledgeRepository } from "../knowledge/knowledge.repository.js";
import { KnowledgeConsolidator } from "../knowledge/knowledge.consolidator.js";

const knowledgeRepository = new KnowledgeRepository();

const consolidator = new KnowledgeConsolidator();

export async function knowledgeConsolidationJob() {
  await runJob(
    "knowledge-consolidation",

    async () => {
      const knowledge = await knowledgeRepository.findAll();

      console.log(
        `[KnowledgeConsolidationJob] Processing ${knowledge.length} knowledge items`,
      );

      if (knowledge.length === 0) {
        return;
      }

      const consolidated = consolidator.consolidate(knowledge);

      await knowledgeRepository.replaceAll(
        consolidated.map((item) => ({
          ...item,
          createdAt: new Date(),
        })),
      );

      console.log(
        `[KnowledgeConsolidationJob] Consolidated ${consolidated.length} items`,
      );
    },
  );
}

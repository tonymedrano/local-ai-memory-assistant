import { runJob } from "./job.runner.js";

import { KnowledgeRepository } from "../knowledge/knowledge.repository.js";

import { KnowledgeMutation } from "../knowledge/feedback/knowledge.mutation.js";

import { RelearningService } from "../knowledge/relearning/relearning.service.js";

import { RelearningProcessor } from "../knowledge/relearning/relearning.processor.js";

const knowledgeRepository = new KnowledgeRepository();

const mutation = new KnowledgeMutation(knowledgeRepository);

const relearning = new RelearningService();

const processor = new RelearningProcessor(relearning, mutation);

export async function relearningJob() {
  await runJob(
    "relearning",

    async () => {
      const knowledge = await knowledgeRepository.findAll();

      console.log(
        `[RelearningJob] Reviewing ${knowledge.length} knowledge items`,
      );

      for (const item of knowledge) {
        if (!item.id) {
          continue;
        }

        const result = await processor.process(item.id, item.confidence);

        console.log(`[RelearningJob] ${item.subject}: ${result.decision}`);
      }
    },
  );
}

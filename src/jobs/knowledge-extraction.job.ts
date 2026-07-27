import { runJob } from "./job.runner.js";

import { KnowledgeService } from "../knowledge/knowledge.service.js";

const knowledgeService = new KnowledgeService();

export async function knowledgeExtractionJob() {
  await runJob(
    "knowledge-extraction",

    async () => {
      const memories = [
        {
          id: "memory-1",

          content: `
          Angular Native Federation usa un shell llamado sp-shell.
          Qdrant almacena embeddings.
          Continue conecta con memory-service mediante MCP.
          `,
        },
      ];

      console.log(
        `[KnowledgeExtractionJob] Processing ${memories.length} memories`,
      );

      for (const memory of memories) {
        const knowledge = await knowledgeService.processMemory(memory.content);

        console.log(`[KnowledgeExtractionJob] extracted: ${knowledge.subject}`);
      }
    },
  );
}

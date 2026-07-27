import crypto from "node:crypto";

import { createEmbedding } from "../indexer/embedder.js";
import { MemoryRepository } from "../memory/memory.repository.js";
import { knowledgeExtractionJob } from "./knowledge-extraction.job.js";


const memoryRepository = new MemoryRepository();


const text = `
Angular Native Federation usa un shell llamado sp-shell.
Qdrant almacena embeddings.
Continue conecta con memory-service mediante MCP.
`;


console.log("[Test] Creating embedding");


const vector =
  await createEmbedding(text);


console.log(
  "[Test] Vector size:",
  vector.length
);


await memoryRepository.save(
  crypto.randomUUID(),

  vector,

  {
    text,

    importance: 0.9,

    createdAt:
      new Date().toISOString(),

    knowledgeExtracted: false,
  }
);


console.log("[Test] Starting knowledge extraction job");


await knowledgeExtractionJob();


console.log("[Test] Finished");
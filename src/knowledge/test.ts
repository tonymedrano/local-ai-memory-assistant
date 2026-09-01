import { KnowledgeService } from "./knowledge.service.js";

const service = new KnowledgeService();

const knowledge = await service.processMemory(
  { text: `
Angular Native Federation usa un shell llamado sp-shell.
Qdrant almacena embeddings.
 `, tenantId: "test-tenant" },
);

console.log("\nSaved knowledge:\n");

console.log(JSON.stringify(knowledge, null, 2));

console.log("\nAll knowledge:\n");

console.log(JSON.stringify(await service.getKnowledge(), null, 2));

console.log("\nSearch:\n");

console.log(JSON.stringify(await service.searchKnowledge("Angular"), null, 2));

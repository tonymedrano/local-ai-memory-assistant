import { ProjectRegistry } from "./project.registry.js";

import { CollectionManager } from "./collection.manager.js";

import { qdrant } from "../qdrant/qdrant.client.js";

async function main() {
  const registry = new ProjectRegistry();

  const collections = new CollectionManager(qdrant);

  const project = {
    id: "memory-service",

    name: "Local AI Memory Service",

    rootPath: process.cwd(),

    collection: "project_memory_service",

    createdAt: new Date().toISOString(),
  };

  await registry.registerProject(project);

  await collections.ensure(project.collection);

  console.log("Proyecto preparado");
}

main();

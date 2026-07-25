import { retrieveMemoryContext } from "../memory/memory-retrieval.service.js";

const result = await retrieveMemoryContext("¿Qué base vectorial usamos?", {
  project: "memory-service",
  limit: 3,
});

console.log(JSON.stringify(result, null, 2));

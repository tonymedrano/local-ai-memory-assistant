import type { FastifyInstance } from "fastify";

import { recall, store } from "../core/container.js";

export async function memoryRoutes(app: FastifyInstance) {
  app.post("/memory", async (request) => {
    const memory = request.body as any;

    try {

  return await store(memory);

} catch(error) {

  console.error(error);

  return {
    error:"Error storing memory",
    detail: String(error),
  };

}
  });

  app.post("/memory/search", async (request) => {
    const body = request.body as any;

    return await recall(body.query, body.options);
  });
}

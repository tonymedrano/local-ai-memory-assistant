import { randomUUID } from "node:crypto";
import { config } from "../config.js";

const baseUrl = config.qdrantUrl;

export async function initCollection() {
  const response = await fetch(`${baseUrl}/collections`);

  if (!response.ok) {
    throw new Error(`Qdrant error ${response.status}`);
  }

  const data = await response.json();

  const exists = data.result.collections.some(
    (c: any) => c.name === config.collection,
  );

  if (!exists) {
    const create = await fetch(`${baseUrl}/collections/${config.collection}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vectors: {
          size: 768,
          distance: "Cosine",
        },
      }),
    });

    if (!create.ok) {
      throw new Error(await create.text());
    }
  }
}

export async function saveMemory(
  id: string,
  vector: number[],
  payload: Record<string, unknown>,
) {
  const response = await fetch(
    `${baseUrl}/collections/${config.collection}/points`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        points: [
          {
            id: randomUUID(),
            vector,
            payload,
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }
}

export async function searchMemory(vector: number[]) {
  const response = await fetch(
    `${baseUrl}/collections/${config.collection}/points/search`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vector,
        limit: 5,
        with_payload: true,
        score_threshold: 0.6,
      }),
    },
  );

  return await response.json();
}

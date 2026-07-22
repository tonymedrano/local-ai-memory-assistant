import { config } from "../config.js";

export async function createEmbedding(text: string): Promise<number[]> {
  const response = await fetch(`${config.ollamaUrl}/api/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.embedModel,
      prompt: text,
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = await response.json();

  return data.embedding;
}

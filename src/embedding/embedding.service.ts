import { config } from "../config.js";

export class EmbeddingService {
  async embed(text: string): Promise<number[]> {
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
      throw new Error(`Embedding failed: ${response.status}`);
    }

    const data = (await response.json()) as {
      embedding: number[];
    };

    return data.embedding;
  }
}

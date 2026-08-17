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

  const data = (await response.json()) as {
    embedding: number[];
  };

  return data.embedding;
}

export async function generateText(prompt: string): Promise<string> {
  const response = await fetch(`${config.ollamaUrl}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.chatModel,
      prompt,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = (await response.json()) as {
    response?: string;
  };

  const text = data.response?.trim();

  if (!text) {
    throw new Error("Ollama returned an empty response");
  }

  return text;
}

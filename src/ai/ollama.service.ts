import { config } from "../config.js";
import { ExternalProviderError, fetchWithTimeout } from "../external/fetch-with-timeout.js";

export async function createEmbedding(text: string): Promise<number[]> {
  const response = await fetchWithTimeout("Ollama embeddings", `${config.ollamaUrl}/api/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.embedModel,
      prompt: text,
    }),
  });

  let data: { embedding?: number[] };
  try {
    data = (await response.json()) as { embedding?: number[] };
  } catch (error) {
    throw new ExternalProviderError("Ollama embeddings returned invalid JSON", "Ollama embeddings", "invalid-response");
  }

  if (!Array.isArray(data.embedding) || data.embedding.length === 0) {
    throw new ExternalProviderError("Ollama embeddings returned no vector", "Ollama embeddings", "invalid-response");
  }

  return data.embedding;
}

export async function generateText(prompt: string): Promise<string> {
  const response = await fetchWithTimeout("Ollama generation", `${config.ollamaUrl}/api/generate`, {
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

  const data = (await response.json()) as {
    response?: string;
  };

  const text = data.response?.trim();

  if (!text) {
    throw new Error("Ollama returned an empty response");
  }

  return text;
}

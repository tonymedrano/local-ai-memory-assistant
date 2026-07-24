import axios from "axios";

const OLLAMA = "http://localhost:11434";

export async function createEmbedding(text: string) {
  const response = await axios.post(`${OLLAMA}/api/embeddings`, {
    model: "nomic-embed-text",

    prompt: text,
  });

  return response.data.embedding;
}

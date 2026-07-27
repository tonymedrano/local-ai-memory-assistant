export class OllamaClient {
  constructor(
    private baseUrl = "http://localhost:11434",

    private model = "qwen2.5:14b",
  ) {}

  async complete(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        model: this.model,

        prompt,

        stream: false,

        format: "json",
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error ${response.status}`);
    }

    const data = await response.json();

    return data.response;
  }
}

import { config } from "../config.js";
import { missingOllamaModels } from "../ai/ollama.models.js";

export interface ReadinessCheck {
  name: string;
  check(): Promise<void>;
}

export interface ReadinessStatus {
  ready: boolean;
  service: "memory-service";
  timestamp: string;
  checks: Record<string, { status: "ok" | "error"; error?: string }>;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function checkQdrantCollection(collection: string): Promise<void> {
  let response: Response;

  try {
    response = await fetch(
      `${config.qdrantUrl}/collections/${encodeURIComponent(collection)}`,
      { signal: AbortSignal.timeout(2_000) },
    );
  } catch (error) {
    throw new Error(`Qdrant is unavailable at ${config.qdrantUrl}: ${errorMessage(error)}`);
  }

  if (!response.ok) {
    throw new Error(
      `Qdrant collection "${collection}" is unavailable (status ${response.status})`,
    );
  }
}

async function checkQdrant(): Promise<void> {
  const collections = new Set([config.collection, config.memoryCollection]);
  await Promise.all([...collections].map(checkQdrantCollection));
}

async function checkOllama(): Promise<void> {
  let response: Response;

  try {
    response = await fetch(`${config.ollamaUrl}/api/tags`, {
      signal: AbortSignal.timeout(2_000),
    });
  } catch (error) {
    throw new Error(`Ollama is unavailable at ${config.ollamaUrl}: ${errorMessage(error)}`);
  }

  if (!response.ok) {
    throw new Error(`Ollama readiness check failed with status ${response.status}`);
  }

  const payload = (await response.json()) as { models?: Array<{ name?: string; model?: string }> };
  const missingModels = missingOllamaModels(
    [config.embedModel, config.chatModel],
    payload.models ?? [],
  );

  if (missingModels.length > 0) {
    throw new Error(`Ollama is missing configured model(s): ${missingModels.join(", ")}`);
  }
}

export class ReadinessService {
  private bootError: string | undefined;
  private bootstrapped = false;

  constructor(private readonly checks: ReadinessCheck[]) {}

  markReady(): void {
    this.bootError = undefined;
    this.bootstrapped = true;
  }

  markFailed(error: unknown): void {
    this.bootError = errorMessage(error);
    this.bootstrapped = false;
  }

  async getStatus(now = new Date()): Promise<ReadinessStatus> {
    const checks: ReadinessStatus["checks"] = {};

    if (!this.bootstrapped) {
      checks.bootstrap = {
        status: "error",
        error: this.bootError ?? "Memory service bootstrap has not completed",
      };

      return {
        ready: false,
        service: "memory-service",
        timestamp: now.toISOString(),
        checks,
      };
    }

    checks.bootstrap = { status: "ok" };

    await Promise.all(
      this.checks.map(async ({ name, check }) => {
        try {
          await check();
          checks[name] = { status: "ok" };
        } catch (error) {
          checks[name] = { status: "error", error: errorMessage(error) };
        }
      }),
    );

    return {
      ready: Object.values(checks).every((check) => check.status === "ok"),
      service: "memory-service",
      timestamp: now.toISOString(),
      checks,
    };
  }
}

export const readinessService = new ReadinessService([
  { name: "qdrant", check: checkQdrant },
  { name: "ollama", check: checkOllama },
]);

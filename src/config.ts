import path from "node:path";

const DEFAULT_MEMORY_COLLECTION = "contextual_memory";

function requiredName(
  value: string | undefined,
  variable: string,
  fallback: string,
): string {
  const name = (value ?? fallback).trim();

  if (!name) {
    throw new Error(`${variable} must be a non-empty collection name`);
  }

  return name;
}

function booleanFlag(
  value: string | undefined,
  variable: string,
  fallback: boolean,
): boolean {
  if (value === undefined) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  throw new Error(`${variable} must be either true or false`);
}

function requiredDirectory(
  value: string | undefined,
  variable: string,
  fallback: string,
): string {
  const directory = (value ?? fallback).trim();

  if (!directory) {
    throw new Error(`${variable} must be a non-empty directory path`);
  }

  return path.resolve(directory);
}

export function createConfig(env: NodeJS.ProcessEnv = process.env) {
  const production = env.NODE_ENV === "production";
  const authMode = env.AUTH_MODE ?? (production ? "jwt" : "development");
  if (production && authMode === "development") throw new Error("AUTH_MODE=development is forbidden in production");
  if (authMode !== "development" && authMode !== "jwt") throw new Error("AUTH_MODE must be development or jwt");
  if (authMode === "jwt" && !env.JWT_SECRET?.trim()) throw new Error("JWT_SECRET is required when AUTH_MODE=jwt");
  return {
    chatModel: "qwen2.5:14b",
    port: Number(env.PORT ?? 3000),
    ollamaUrl: env.OLLAMA_URL ?? "http://localhost:11434",
    qdrantUrl: env.QDRANT_URL ?? "http://localhost:6333",
    collection: requiredName(env.COLLECTION, "COLLECTION", "global_memory"),
    memoryCollection: requiredName(
      env.MEMORY_COLLECTION,
      "MEMORY_COLLECTION",
      DEFAULT_MEMORY_COLLECTION,
    ),
    contextAwareRetrieval: booleanFlag(
      env.CONTEXT_AWARE_RETRIEVAL,
      "CONTEXT_AWARE_RETRIEVAL",
      true,
    ),
    dataDir: requiredDirectory(env.DATA_DIR, "DATA_DIR", "data"),
    embedModel: env.EMBED_MODEL ?? "nomic-embed-text",
    authMode,
    jwtSecret: env.JWT_SECRET,
    jwtIssuer: env.JWT_ISSUER,
    jwtAudience: env.JWT_AUDIENCE,
    jwtTenantClaim: env.JWT_TENANT_CLAIM?.trim() || "tenantId",
  };
}

export const config = createConfig();

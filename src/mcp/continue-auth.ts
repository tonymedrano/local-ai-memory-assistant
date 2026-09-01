import { createConfig } from "../config.js";
import { createTenantJwt } from "../security/jwt.js";

const DEFAULT_TTL_SECONDS = 4 * 60 * 60;
const MAX_TTL_SECONDS = 24 * 60 * 60;

function requiredEnvironmentValue(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required for Continue MCP development`);
  }
  return value;
}

function tokenTtlSeconds(env: NodeJS.ProcessEnv): number {
  const configured = env.CONTINUE_MEMORY_JWT_TTL_SECONDS;
  if (!configured) {
    return DEFAULT_TTL_SECONDS;
  }

  const ttl = Number(configured);
  if (!Number.isInteger(ttl) || ttl <= 0 || ttl > MAX_TTL_SECONDS) {
    throw new Error(
      `CONTINUE_MEMORY_JWT_TTL_SECONDS must be an integer between 1 and ${MAX_TTL_SECONDS}`,
    );
  }
  return ttl;
}

export function createContinueMemoryJwt(
  env: NodeJS.ProcessEnv = process.env,
  now = Date.now(),
): string {
  const runtimeConfig = createConfig(env);
  if (runtimeConfig.authMode !== "jwt") {
    throw new Error("AUTH_MODE=jwt is required for Continue MCP development");
  }

  const tenantId = requiredEnvironmentValue(env, "CONTINUE_MEMORY_TENANT_ID");
  const subject = env.CONTINUE_MEMORY_SUBJECT?.trim() || "continue-mcp";
  const expiresAt = Math.floor(now / 1000) + tokenTtlSeconds(env);

  return createTenantJwt({
    jwtSecret: runtimeConfig.jwtSecret,
    jwtIssuer: runtimeConfig.jwtIssuer,
    jwtAudience: runtimeConfig.jwtAudience,
    jwtTenantClaim: runtimeConfig.jwtTenantClaim,
    subject,
    tenantId,
    expiresAt,
  });
}

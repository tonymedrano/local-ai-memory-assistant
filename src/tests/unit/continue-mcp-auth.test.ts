import assert from "node:assert/strict";
import test from "node:test";

import { createContinueMemoryJwt } from "../../mcp/continue-auth.js";
import { verifyTenantJwt } from "../../security/jwt.js";

const now = Date.now();
const contract = {
  jwtSecret: "continue-mcp-test-secret",
  jwtIssuer: "memory-service-local",
  jwtAudience: "continue",
  jwtTenantClaim: "workspaceTenant",
};

test("Continue launcher JWT follows the memory-service tenant contract", () => {
  const token = createContinueMemoryJwt(
    {
      AUTH_MODE: "jwt",
      JWT_SECRET: contract.jwtSecret,
      JWT_ISSUER: contract.jwtIssuer,
      JWT_AUDIENCE: contract.jwtAudience,
      JWT_TENANT_CLAIM: contract.jwtTenantClaim,
      CONTINUE_MEMORY_TENANT_ID: "continue-local",
      CONTINUE_MEMORY_SUBJECT: "continue-mcp-client",
      CONTINUE_MEMORY_JWT_TTL_SECONDS: "7200",
    },
    now,
  );

  const [header, payload] = token.split(".");
  const parsedHeader = JSON.parse(Buffer.from(header, "base64url").toString());
  const parsedPayload = JSON.parse(Buffer.from(payload, "base64url").toString());

  assert.equal(parsedHeader.alg, "HS256");
  assert.equal(parsedPayload.sub, "continue-mcp-client");
  assert.equal(parsedPayload.workspaceTenant, "continue-local");
  assert.equal(parsedPayload.iss, contract.jwtIssuer);
  assert.equal(parsedPayload.aud, contract.jwtAudience);
  assert.equal(parsedPayload.exp, Math.floor(now / 1000) + 7200);
  assert.deepEqual(verifyTenantJwt(token, contract, now), {
    subject: "continue-mcp-client",
    tenantId: "continue-local",
  });
  assert.equal(
    verifyTenantJwt(token, { ...contract, jwtSecret: "wrong-secret" }, now),
    undefined,
  );
  assert.equal(verifyTenantJwt(token, contract, now + 7201 * 1000), undefined);
});

test("Continue launcher fails closed for non-JWT auth and invalid tenant input", () => {
  assert.throws(
    () =>
      createContinueMemoryJwt({
        AUTH_MODE: "development",
        JWT_SECRET: contract.jwtSecret,
        CONTINUE_MEMORY_TENANT_ID: "continue-local",
      }),
    /AUTH_MODE=jwt/,
  );
  assert.throws(
    () =>
      createContinueMemoryJwt({
        AUTH_MODE: "jwt",
        JWT_SECRET: contract.jwtSecret,
        CONTINUE_MEMORY_TENANT_ID: "invalid tenant",
      }),
    /valid tenant identities/,
  );
});

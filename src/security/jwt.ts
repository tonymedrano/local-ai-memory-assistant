import { createHmac, timingSafeEqual } from "node:crypto";

export interface JwtContract {
  jwtSecret?: string;
  jwtIssuer?: string;
  jwtAudience?: string;
  jwtTenantClaim: string;
}

export interface TenantJwtClaims {
  subject: string;
  tenantId: string;
}

export interface CreateTenantJwtOptions extends JwtContract {
  subject: string;
  tenantId: string;
  expiresAt: number;
}

const tenantIdPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;

export function isValidTenantIdentity(value: string): boolean {
  return tenantIdPattern.test(value);
}

export function createTenantJwt({
  jwtSecret,
  jwtIssuer,
  jwtAudience,
  jwtTenantClaim,
  subject,
  tenantId,
  expiresAt,
}: CreateTenantJwtOptions): string {
  if (!jwtSecret?.trim()) {
    throw new Error("JWT_SECRET is required to create a development token");
  }
  if (!isValidTenantIdentity(subject) || !isValidTenantIdentity(tenantId)) {
    throw new Error("JWT subject and tenant must be valid tenant identities");
  }
  if (!Number.isFinite(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) {
    throw new Error("JWT expiration must be in the future");
  }

  const encode = (value: unknown) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  const header = encode({ alg: "HS256", typ: "JWT" });
  const payload = encode({
    sub: subject,
    [jwtTenantClaim]: tenantId,
    exp: expiresAt,
    ...(jwtIssuer ? { iss: jwtIssuer } : {}),
    ...(jwtAudience ? { aud: jwtAudience } : {}),
  });
  const signature = createHmac("sha256", jwtSecret)
    .update(`${header}.${payload}`)
    .digest("base64url");

  return `${header}.${payload}.${signature}`;
}

export function verifyTenantJwt(
  token: string | undefined,
  contract: JwtContract,
  now = Date.now(),
): TenantJwtClaims | undefined {
  try {
    const [header, payload, signature] = token?.split(".") ?? [];
    if (!header || !payload || !signature || !contract.jwtSecret) {
      throw new Error();
    }
    if (JSON.parse(Buffer.from(header, "base64url").toString()).alg !== "HS256") {
      throw new Error();
    }
    const expected = createHmac("sha256", contract.jwtSecret)
      .update(`${header}.${payload}`)
      .digest("base64url");
    if (
      expected.length !== signature.length ||
      !timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
    ) {
      throw new Error();
    }

    const claims = JSON.parse(
      Buffer.from(payload, "base64url").toString(),
    ) as Record<string, unknown>;
    const tenantId = claims[contract.jwtTenantClaim];
    if (
      typeof tenantId !== "string" ||
      !isValidTenantIdentity(tenantId) ||
      typeof claims.sub !== "string" ||
      !isValidTenantIdentity(claims.sub) ||
      typeof claims.exp !== "number" ||
      claims.exp <= now / 1000
    ) {
      throw new Error();
    }
    if (contract.jwtIssuer && claims.iss !== contract.jwtIssuer) {
      throw new Error();
    }
    if (contract.jwtAudience && claims.aud !== contract.jwtAudience) {
      throw new Error();
    }

    return { subject: claims.sub, tenantId };
  } catch {
    return undefined;
  }
}

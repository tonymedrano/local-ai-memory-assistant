import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";
import type { NextFunction } from "express";
import { config } from "../config.js";

export const TENANT_HEADER = "x-memory-user-id";
export interface AuthenticatedPrincipal { subject: string; tenantId: string; }
declare global { namespace Express { interface Request { authenticatedPrincipal?: AuthenticatedPrincipal; } } }

const tenantIdPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;

function authenticate(req: Request): AuthenticatedPrincipal | undefined {
  if (config.authMode === "jwt") {
    const token = req.header("authorization")?.match(/^Bearer (.+)$/i)?.[1];
    try {
      const [header, payload, signature] = token?.split(".") ?? [];
      if (!header || !payload || !signature || !config.jwtSecret) throw new Error();
      if (JSON.parse(Buffer.from(header, "base64url").toString()).alg !== "HS256") throw new Error();
      const expected = createHmac("sha256", config.jwtSecret).update(`${header}.${payload}`).digest("base64url");
      if (expected.length !== signature.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) throw new Error();
      const claims = JSON.parse(Buffer.from(payload, "base64url").toString()) as Record<string, unknown>;
      const tenantId = claims[config.jwtTenantClaim];
      if (typeof tenantId !== "string" || !tenantIdPattern.test(tenantId) || typeof claims.sub !== "string" || !tenantIdPattern.test(claims.sub) || typeof claims.exp !== "number" || claims.exp <= Date.now() / 1000) throw new Error();
      if (config.jwtIssuer && claims.iss !== config.jwtIssuer) throw new Error();
      if (config.jwtAudience && claims.aud !== config.jwtAudience) throw new Error();
      return { subject: claims.sub, tenantId };
    } catch { return undefined; }
  }
  const value = req.header(TENANT_HEADER)?.trim();
  return value && tenantIdPattern.test(value) ? { subject: value, tenantId: value } : undefined;
}

export function tenantAuthentication(req: Request, res: Response, next: NextFunction): void {
  const principal = authenticate(req);
  if (!principal) {
    res.status(config.authMode === "jwt" ? 401 : 400).json({
      error: config.authMode === "jwt" ? "Invalid or expired bearer token" : `A valid ${TENANT_HEADER} header is required`,
      code: config.authMode === "jwt" ? "AUTHENTICATION_REQUIRED" : "TENANT_REQUIRED",
    });
    return;
  }
  req.authenticatedPrincipal = principal;
  next();
}

export function systemAuthentication(_req: Request, res: Response): void {
  res.status(403).json({ error: "System authentication is required", code: "SYSTEM_AUTHENTICATION_REQUIRED" });
}

export function tenantIdFromRequest(req: Request, res: Response): string | undefined {
  if (req.authenticatedPrincipal) return req.authenticatedPrincipal.tenantId;
  const principal = authenticate(req);
  if (principal) return principal.tenantId;
  res.status(config.authMode === "jwt" ? 401 : 400).json({
    error: config.authMode === "jwt" ? "Invalid or expired bearer token" : `A valid ${TENANT_HEADER} header is required`,
    code: config.authMode === "jwt" ? "AUTHENTICATION_REQUIRED" : "TENANT_REQUIRED",
  });
  return undefined;
}

import type { Request, Response } from "express";
import type { NextFunction } from "express";
import { config } from "../config.js";
import { isValidTenantIdentity, verifyTenantJwt } from "./jwt.js";

export const TENANT_HEADER = "x-memory-user-id";
export interface AuthenticatedPrincipal { subject: string; tenantId: string; }
declare global { namespace Express { interface Request { authenticatedPrincipal?: AuthenticatedPrincipal; } } }

function authenticate(req: Request): AuthenticatedPrincipal | undefined {
  if (config.authMode === "jwt") {
    const token = req.header("authorization")?.match(/^Bearer (.+)$/i)?.[1];
    return verifyTenantJwt(token, config);
  }
  const value = req.header(TENANT_HEADER)?.trim();
  return value && isValidTenantIdentity(value)
    ? { subject: value, tenantId: value }
    : undefined;
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

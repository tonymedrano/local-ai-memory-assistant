import type { NextFunction, Request, Response } from "express";

export function badRequest(res: Response, error: string) {
  return res.status(400).json({
    error,
    code: "VALIDATION_ERROR",
  });
}

export function notFound(res: Response, error: string) {
  return res.status(404).json({
    error,
    code: "NOT_FOUND",
  });
}

export function internalError(
  res: Response,
  error: unknown,
  context: string,
) {
  console.error(context, error);

  return res.status(500).json({
    error: "Internal server error",
    code: "INTERNAL_ERROR",
  });
}

export function notFoundHandler(_req: Request, res: Response) {
  return notFound(res, "Route not found");
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof SyntaxError && "body" in error) {
    return badRequest(res, "Malformed JSON request body");
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    error.type === "entity.too.large"
  ) {
    return res.status(413).json({
      error: "Request body exceeds 1mb limit",
      code: "PAYLOAD_TOO_LARGE",
    });
  }

  return internalError(res, error, "[HTTP]");
}

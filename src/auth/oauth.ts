/**
 * OAuth Bearer-token middleware.
 *
 * Validates the `Authorization: Bearer <token>` header against the
 * `OAUTH_TOKEN` environment variable.  When the env var is absent the
 * middleware is a no-op (open in development), so existing tests stay green.
 *
 * Usage (Express):
 *   app.use("/api/ollama", oauthMiddleware, ollamaRouter);
 */

import type { Request, Response, NextFunction } from "express";

/**
 * Returns `true` when the request carries a valid Bearer token.
 * The expected token is read from `process.env.OAUTH_TOKEN`.
 */
export function validateBearerToken(req: Request): boolean {
  const expected = process.env.OAUTH_TOKEN;
  if (!expected) {
    // No token configured — skip validation (development/test mode)
    return true;
  }
  const header = req.headers["authorization"] ?? "";
  const parts = header.split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
    return false;
  }
  return parts[1] === expected;
}

/**
 * Express middleware that enforces OAuth Bearer-token authentication.
 * Responds with `401 Unauthorized` when the token is missing or invalid.
 */
export function oauthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!validateBearerToken(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

/**
 * Express router for Ollama chat.
 *
 * POST /api/ollama/chat
 *   Body: { message: string; model?: string }
 *   Response: OllamaChatResponse | { error: string }
 *
 * Note: Bearer-token auth is applied at the app level via oauthMiddleware.
 */

import { Router } from "express";
import type { Request, Response } from "express";
import { routeToOllama } from "../ollama/router";

export function createOllamaRouter(): Router {
  const router = Router();

  /**
   * POST /chat
   *
   * Accepts `{ message, model? }` and forwards to local Ollama when the
   * message mentions a recognised agent handle.
   */
  router.post("/chat", async (req: Request, res: Response): Promise<void> => {
    const { message, model } = req.body as { message?: string; model?: string };

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Missing required field: message" });
      return;
    }

    try {
      const result = await routeToOllama(message, model ? { model } : {});
      if (!result.routed) {
        res.status(400).json({
          error:
            "Message not routed. Mention @blackboxprogramming, @lucidia, @ollama, or @copilot.",
        });
        return;
      }
      res.json(result.response);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res.status(502).json({ error: errorMessage });
    }
  });

  return router;
}

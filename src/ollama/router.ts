/**
 * Ollama Express Router
 *
 * Handles POST /ollama/chat requests.
 * Any message that starts with or contains one of the supported handles
 * (@copilot, @lucidia, @blackboxprogramming, @ollama) is stripped of its
 * mention prefix and forwarded directly to the local Ollama server.
 *
 * @example
 * ```
 * POST /api/ollama/chat
 * { "message": "@lucidia What is 2+2?" }
 * → forwarded to Ollama as "What is 2+2?"
 * ```
 */

import { Router } from "express";
import type { Request, Response } from "express";
import { ollamaChat } from "./client";
import type { OllamaClientConfig } from "./client";

/** Handles whose mentions route a request to Ollama */
export const OLLAMA_HANDLES = [
  "@copilot",
  "@lucidia",
  "@blackboxprogramming",
  "@ollama",
] as const;

/**
 * Strips any leading Ollama handle mention from a message and returns the
 * clean prompt.
 *
 * @param message - Raw user message (may include a handle prefix)
 * @returns Cleaned prompt string
 */
export function stripHandle(message: string): string {
  const lower = message.toLowerCase().trimStart();
  for (const handle of OLLAMA_HANDLES) {
    if (lower.startsWith(handle)) {
      return message.slice(lower.indexOf(handle) + handle.length).trimStart();
    }
  }
  return message.trim();
}

/**
 * Returns true if the message contains one of the Ollama handles.
 *
 * @param message - User message
 */
export function containsOllamaHandle(message: string): boolean {
  const lower = message.toLowerCase();
  return OLLAMA_HANDLES.some((h) => lower.includes(h));
}

/**
 * Creates the Ollama Express router.
 *
 * @param config - Optional Ollama client configuration overrides
 */
export function createOllamaRouter(config: OllamaClientConfig = {}) {
  const router = Router();

  /**
   * POST /chat
   *
   * Request body: { message: string, model?: string }
   * Response:     { reply: string, model: string, handle?: string }
   *
   * If `message` starts with or contains an Ollama handle the handle is
   * stripped before forwarding.  Non-handle requests are accepted too so the
   * endpoint is useful as a generic Ollama proxy.
   */
  router.post("/chat", async (req: Request, res: Response) => {
    const { message, model } = req.body as {
      message?: unknown;
      model?: unknown;
    };

    if (typeof message !== "string" || !message.trim()) {
      res.status(400).json({ error: "message must be a non-empty string" });
      return;
    }

    const lower = message.toLowerCase();
    const detectedHandle =
      OLLAMA_HANDLES.find((h) => lower.includes(h)) ?? null;
    const prompt = detectedHandle ? stripHandle(message) : message.trim();

    try {
      const result = await ollamaChat(prompt, {
        ...config,
        model: typeof model === "string" ? model : config.model,
      });

      const responseBody: Record<string, unknown> = {
        reply: result.message.content,
        model: result.model,
      };
      if (detectedHandle) responseBody.handle = detectedHandle;

      res.json(responseBody);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Ollama request failed";
      res.status(502).json({ error: errorMessage });
    }
  });

  return router;
}

/**
 * Ollama message router.
 *
 * Any chat message that mentions one of the recognised agent handles
 * (@blackboxprogramming, @lucidia, @ollama, @copilot) is routed to the
 * local Ollama endpoint via the Ollama client.  All other messages are
 * returned as-is so callers can fall through to their own handling.
 *
 * Usage (Express route):
 *   const { routed, response } = await routeToOllama(message, history);
 *   if (routed) res.json(response);
 */

import { chatWithOllama } from "./client";
import type { OllamaMessage, OllamaChatOptions, OllamaChatResponse } from "./client";

export { OllamaMessage, OllamaChatOptions, OllamaChatResponse };

/** Agent handles that trigger local-Ollama routing. */
export const ROUTED_HANDLES = [
  "@blackboxprogramming",
  "@lucidia",
  "@ollama",
  "@copilot",
] as const;

export interface RouteResult {
  /** Whether the message was handled by Ollama. */
  routed: boolean;
  /** Ollama response when `routed` is true, otherwise `undefined`. */
  response?: OllamaChatResponse;
}

/**
 * Returns `true` when the message contains a handle that should be
 * routed to the local Ollama instance.
 */
export function shouldRouteToOllama(message: string): boolean {
  const lower = message.toLowerCase();
  return ROUTED_HANDLES.some((handle) => lower.includes(handle));
}

/**
 * Inspects `message` and, when it contains a recognised agent handle,
 * forwards the request to the local Ollama instance.
 *
 * @param message  - Incoming user message text
 * @param options  - Optional Ollama client options (model, message history)
 * @returns        RouteResult with `routed: false` when unhandled
 */
export async function routeToOllama(
  message: string,
  options: OllamaChatOptions = {}
): Promise<RouteResult> {
  if (!shouldRouteToOllama(message)) {
    return { routed: false };
  }
  const response = await chatWithOllama(message, options);
  return { routed: true, response };
}

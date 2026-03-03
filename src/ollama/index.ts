/**
 * Ollama Module
 *
 * Exposes a local-Ollama client and Express router.
 * All @copilot / @lucidia / @blackboxprogramming / @ollama mentions are
 * routed here without contacting any external AI provider.
 */

export { ollamaChat } from "./client";
export type { OllamaChatRequest, OllamaChatResponse, OllamaClientConfig, OllamaMessage } from "./client";

export {
  createOllamaRouter,
  containsOllamaHandle,
  stripHandle,
  OLLAMA_HANDLES,
} from "./router";

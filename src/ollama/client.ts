/**
 * Ollama HTTP Client
 *
 * Sends chat/generate requests to a local Ollama instance.
 * Defaults to http://localhost:11434 (overridable via OLLAMA_BASE_URL).
 *
 * @example
 * ```typescript
 * import { ollamaChat } from './client';
 * const reply = await ollamaChat('Why is the sky blue?');
 * console.log(reply.message.content);
 * ```
 */

export interface OllamaMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface OllamaChatRequest {
  model: string;
  messages: OllamaMessage[];
  stream?: boolean;
}

export interface OllamaChatResponse {
  model: string;
  message: OllamaMessage;
  done: boolean;
}

export interface OllamaClientConfig {
  /** Base URL of the Ollama server. Defaults to OLLAMA_BASE_URL env var or http://localhost:11434 */
  baseUrl?: string;
  /** Default model to use. Defaults to OLLAMA_MODEL env var or llama3 */
  model?: string;
}

/**
 * Sends a chat request to Ollama and returns the response.
 *
 * @param prompt - The user message to send
 * @param config - Optional client configuration overrides
 * @returns The Ollama chat response
 */
export async function ollamaChat(
  prompt: string,
  config: OllamaClientConfig = {}
): Promise<OllamaChatResponse> {
  const baseUrl =
    config.baseUrl ?? process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
  const model = config.model ?? process.env.OLLAMA_MODEL ?? "llama3";

  const body: OllamaChatRequest = {
    model,
    messages: [{ role: "user", content: prompt }],
    stream: false,
  };

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Ollama request failed (${response.status}): ${text}`);
  }

  return response.json() as Promise<OllamaChatResponse>;
}

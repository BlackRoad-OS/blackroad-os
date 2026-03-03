/**
 * Ollama HTTP client.
 *
 * Sends chat-completion requests to a local Ollama instance.
 *
 * Configuration:
 *   OLLAMA_BASE_URL  – base URL of the Ollama server  (default: http://localhost:11434)
 *   OLLAMA_MODEL     – default model name              (default: llama3)
 *
 * Usage:
 *   import { chatWithOllama } from "./client";
 *   const reply = await chatWithOllama("Hello!", { model: "mistral" });
 */

export interface OllamaMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OllamaChatOptions {
  /** Model name, e.g. "llama3", "mistral", "codellama". Defaults to OLLAMA_MODEL or "llama3". */
  model?: string;
  /** Full conversation history.  When supplied, `prompt` is appended as a user message. */
  messages?: OllamaMessage[];
}

export interface OllamaChatResponse {
  model: string;
  message: OllamaMessage;
}

/**
 * Sends a chat request to the local Ollama endpoint and returns the
 * assistant's reply message.
 *
 * @param prompt  - User prompt text
 * @param options - Optional model and message-history overrides
 */
export async function chatWithOllama(
  prompt: string,
  options: OllamaChatOptions = {}
): Promise<OllamaChatResponse> {
  const baseUrl =
    process.env.OLLAMA_BASE_URL?.replace(/\/$/, "") ??
    "http://localhost:11434";
  const model = options.model ?? process.env.OLLAMA_MODEL ?? "llama3";

  const messages: OllamaMessage[] = [
    ...(options.messages ?? []),
    { role: "user", content: prompt },
  ];

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, stream: false }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Ollama request failed (${response.status}): ${text}`
    );
  }

  const data = (await response.json()) as OllamaChatResponse;
  return data;
}

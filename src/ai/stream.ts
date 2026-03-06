/**
 * AI Streaming module
 *
 * Provides a provider-agnostic async-generator that yields Server-Sent Event
 * (SSE) lines from OpenAI-compatible (OpenAI, Groq) and Anthropic APIs.
 *
 * Usage:
 *   for await (const chunk of streamChat({ provider: 'openai', messages })) {
 *     process.stdout.write(chunk);
 *   }
 */

import type { StreamRequest, AIProvider } from "./providers";
import { getProviderConfig, validateStreamRequest } from "./providers";

/**
 * Build the fetch options for an OpenAI-compatible streaming request
 * (used by openai and groq providers).
 */
function buildOpenAIRequest(
  req: StreamRequest,
  config: ReturnType<typeof getProviderConfig>
): { url: string; init: RequestInit } {
  return {
    url: config.baseUrl,
    init: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: req.model ?? config.defaultModel,
        messages: req.messages,
        stream: true,
      }),
    },
  };
}

/**
 * Build the fetch options for an Anthropic streaming request.
 */
function buildAnthropicRequest(
  req: StreamRequest,
  config: ReturnType<typeof getProviderConfig>
): { url: string; init: RequestInit } {
  // Anthropic separates the system prompt from the messages array
  const systemMessages = req.messages.filter((m) => m.role === "system");
  const userMessages = req.messages.filter((m) => m.role !== "system");

  const body: Record<string, unknown> = {
    model: req.model ?? config.defaultModel,
    max_tokens: 4096,
    messages: userMessages,
    stream: true,
  };

  if (systemMessages.length > 0) {
    body.system = systemMessages.map((m) => m.content).join("\n");
  }

  return {
    url: config.baseUrl,
    init: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    },
  };
}

/**
 * Stream a chat completion from the specified AI provider.
 *
 * Yields raw SSE lines exactly as received from the upstream API so that
 * callers can forward them to the client without extra parsing.
 *
 * @param req - The streaming chat request
 * @yields SSE text lines (e.g. `data: {...}\n\n`)
 * @throws On missing API key, unsupported provider, or upstream HTTP error
 */
export async function* streamChat(
  req: StreamRequest
): AsyncGenerator<string> {
  validateStreamRequest(req);

  const config = getProviderConfig(req.provider);

  const { url, init } =
    req.provider === "anthropic"
      ? buildAnthropicRequest(req, config)
      : buildOpenAIRequest(req, config);

  const response = await fetch(url, init);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `${req.provider} API error (${response.status}): ${errorText}`
    );
  }

  if (!response.body) {
    throw new Error(`No response body from ${req.provider}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield decoder.decode(value, { stream: true });
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Collect the full streamed text content from a chat request.
 *
 * Parses OpenAI-compatible SSE delta events and returns the concatenated
 * content string. Useful for non-streaming callers that still want to use
 * a single code path.
 *
 * @param req - The streaming chat request
 * @returns The complete assistant reply as a string
 */
export async function collectStreamedText(
  req: StreamRequest
): Promise<string> {
  const provider = req.provider as AIProvider;
  let result = "";

  for await (const chunk of streamChat(req)) {
    const lines = chunk.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;

      const dataStr = trimmed.slice(5).trim();
      if (dataStr === "[DONE]") break;

      try {
        const parsed = JSON.parse(dataStr) as Record<string, unknown>;

        if (provider === "anthropic") {
          // Anthropic stream event shape
          const delta = parsed.delta as Record<string, unknown> | undefined;
          if (delta?.type === "text_delta") {
            result += (delta.text as string) ?? "";
          }
        } else {
          // OpenAI / Groq stream event shape
          const choices = parsed.choices as
            | Array<{ delta?: { content?: string } }>
            | undefined;
          if (choices?.[0]?.delta?.content) {
            result += choices[0].delta.content;
          }
        }
      } catch {
        // Ignore non-JSON lines
      }
    }
  }

  return result;
}

/**
 * Next.js App Router – Ollama chat endpoint
 *
 * POST /api/ollama/chat
 *
 * Routes @copilot, @lucidia, @blackboxprogramming, and @ollama mentions
 * directly to the local Ollama server without any external AI provider.
 *
 * Request body: { message: string, model?: string }
 * Response:     { reply: string, model: string, handle?: string }
 */

import { ollamaChat, containsOllamaHandle, stripHandle, OLLAMA_HANDLES } from "../../../src/ollama";

export async function POST(request: Request): Promise<Response> {
  let body: { message?: unknown; model?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { message, model } = body;

  if (typeof message !== "string" || !message.trim()) {
    return Response.json(
      { error: "message must be a non-empty string" },
      { status: 400 }
    );
  }

  const lower = message.toLowerCase();
  const detectedHandle =
    containsOllamaHandle(message)
      ? OLLAMA_HANDLES.find((h) => lower.includes(h)) ?? null
      : null;
  const prompt = detectedHandle ? stripHandle(message) : message.trim();

  try {
    const result = await ollamaChat(prompt, {
      model: typeof model === "string" ? model : undefined,
    });

    const responseBody: Record<string, unknown> = {
      reply: result.message.content,
      model: result.model,
    };
    if (detectedHandle) responseBody.handle = detectedHandle;

    return Response.json(responseBody);
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : "Ollama request failed";
    return Response.json({ error: msg }, { status: 502 });
  }
}

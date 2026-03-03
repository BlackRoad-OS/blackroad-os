import { streamChat } from "../../../../src/ai/stream";
import { validateStreamRequest } from "../../../../src/ai/providers";
import type { StreamRequest } from "../../../../src/ai/providers";

/**
 * POST /api/ai/stream
 *
 * Streams a chat completion from the configured AI provider using
 * Server-Sent Events (SSE). Supports openai (GitHub Copilot-compatible),
 * anthropic, and groq providers.
 *
 * Request body: StreamRequest
 * Response: SSE text/event-stream
 */
export async function POST(request: Request): Promise<Response> {
  let body: StreamRequest;

  try {
    body = (await request.json()) as StreamRequest;
    validateStreamRequest(body);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid request body";
    return Response.json({ error: message }, { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamChat(body)) {
          controller.enqueue(new TextEncoder().encode(chunk));
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Stream error";
        controller.enqueue(
          new TextEncoder().encode(
            `data: ${JSON.stringify({ error: message })}\n\n`
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

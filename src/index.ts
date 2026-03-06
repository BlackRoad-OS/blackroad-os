import Fastify from "fastify";
import { getBuildInfo } from "./utils/buildInfo";
import {
  DigestVoiceRunner,
  createRunnerFromEnv,
  generateDigest,
  validateMetadata,
} from "./digest";
import type { PRMetadata, DigestRunnerConfig } from "./digest";
import { streamChat, collectStreamedText } from "./ai/stream";
import type { StreamRequest } from "./ai/providers";
import { validateStreamRequest } from "./ai/providers";

let runner: DigestVoiceRunner | null = null;

function getRunner(): DigestVoiceRunner {
  if (!runner) {
    runner = createRunnerFromEnv();
  }
  return runner;
}

const SERVICE_NAME = process.env.SERVICE_NAME || "blackroad-os";

export async function createServer() {
  const server = Fastify({ logger: true });

  server.get("/health", async () => ({ 
    status: "ok",
    service: SERVICE_NAME
  }));

  server.get("/version", async () => {
    const info = getBuildInfo();
    return { version: info.version, commit: info.commit };
  });

  // Digest routes
  server.post<{ Body: PRMetadata }>("/api/digest/generate", async (request, reply) => {
    try {
      const metadata = request.body;
      validateMetadata(metadata);
      const digest = generateDigest(metadata);
      return { digest };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      reply.status(400);
      return { error: message };
    }
  });

  server.post<{ Body: PRMetadata }>("/api/digest/run", async (request, reply) => {
    try {
      const metadata = request.body;
      const digestRunner = getRunner();
      const result = await digestRunner.run(metadata);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      reply.status(500);
      return { error: message };
    }
  });

  server.get("/api/digest/config", async () => {
    const digestRunner = getRunner();
    return digestRunner.getConfig();
  });

  server.post<{ Body: Partial<DigestRunnerConfig> }>("/api/digest/config", async (request) => {
    const updates = request.body;
    const digestRunner = getRunner();
    digestRunner.updateConfig(updates);
    return { success: true, config: digestRunner.getConfig() };
  });

  /**
   * POST /api/ai/stream
   *
   * Streams a chat completion from the configured AI provider using
   * Server-Sent Events (SSE). Supports openai (GitHub Copilot-compatible),
   * anthropic, and groq providers.
   */
  server.post<{ Body: StreamRequest }>("/api/ai/stream", async (request, reply) => {
    try {
      validateStreamRequest(request.body);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid request";
      reply.status(400);
      return { error: message };
    }

    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    try {
      for await (const chunk of streamChat(request.body)) {
        reply.raw.write(chunk);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Stream error";
      reply.raw.write(`data: ${JSON.stringify({ error: message })}\n\n`);
    } finally {
      reply.raw.end();
    }
  });

  /**
   * POST /api/ai/complete
   *
   * Non-streaming convenience endpoint that returns the full assistant
   * reply as a JSON object.
   */
  server.post<{ Body: StreamRequest }>("/api/ai/complete", async (request, reply) => {
    try {
      validateStreamRequest(request.body);
      const text = await collectStreamedText(request.body);
      return { text };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      reply.status(500);
      return { error: message };
    }
  });

  return server;
}

if (require.main === module) {
  const port = Number(process.env.PORT || 8080);
  createServer()
    .then((server) => server.listen({ port, host: "0.0.0.0" }))
    .then((address) => {
      console.log(`Server listening at ${address}`);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

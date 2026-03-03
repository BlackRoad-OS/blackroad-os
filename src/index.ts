import Fastify from "fastify";
import { getBuildInfo } from "./utils/buildInfo";
import {
  DigestVoiceRunner,
  createRunnerFromEnv,
  generateDigest,
  validateMetadata,
} from "./digest";
import type { PRMetadata, DigestRunnerConfig } from "./digest";
import { ollamaChat, containsOllamaHandle, stripHandle, OLLAMA_HANDLES } from "./ollama";

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

  // Ollama route – all @copilot / @lucidia / @blackboxprogramming / @ollama mentions
  server.post<{ Body: { message?: string; model?: string } }>(
    "/api/ollama/chat",
    async (request, reply) => {
      const { message, model } = request.body ?? {};
      if (typeof message !== "string" || !message.trim()) {
        reply.status(400);
        return { error: "message must be a non-empty string" };
      }
      const lower = message.toLowerCase();
      const detectedHandle = containsOllamaHandle(message)
        ? OLLAMA_HANDLES.find((h) => lower.includes(h)) ?? null
        : null;
      const prompt = detectedHandle ? stripHandle(message) : message.trim();
      try {
        const result = await ollamaChat(prompt, { model });
        const response: Record<string, unknown> = {
          reply: result.message.content,
          model: result.model,
        };
        if (detectedHandle) response.handle = detectedHandle;
        return response;
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Ollama request failed";
        reply.status(502);
        return { error: msg };
      }
    }
  );

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

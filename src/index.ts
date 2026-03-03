import Fastify from "fastify";
import { z } from "zod";
import { getBuildInfo } from "./utils/buildInfo";
import {
  DigestVoiceRunner,
  createRunnerFromEnv,
  generateDigest,
  validateMetadata,
} from "./digest";
import type { PRMetadata, DigestRunnerConfig } from "./digest";
import { createLucidia, validateMetrics, ValidationError } from "./lucidia";
import type { Metrics, SpawnRulesConfig } from "./lucidia";
import type { Environment } from "./types";
import { registerSampleJobProcessor } from "./jobs/sample.job";

let runner: DigestVoiceRunner | null = null;

// Validation schema for Metrics
const MetricsSchema = z.object({
  escalations_last_3_days: z.number(),
  agent_load: z.number(),
  blocked_prs: z.number(),
  avg_review_time: z.number(),
  unmapped_repos: z.number(),
  repo_activity_score: z.number(),
  open_issues: z.number(),
  avg_issue_age: z.number(),
  unowned_workflows: z.number(),
});

/**
 * Validates request body and returns validated Metrics or error response
 */
function validateMetrics(body: unknown): { success: true; data: Metrics } | { success: false; error: object } {
  // Check if request body exists
  if (!body) {
    return {
      success: false,
      error: { error: "Request body is required" },
    };
  }

  // Validate metrics data
  const validationResult = MetricsSchema.safeParse(body);
  if (!validationResult.success) {
    return {
      success: false,
      error: {
        error: "Invalid metrics data",
        details: validationResult.error.errors,
      },
    };
  }

  return { success: true, data: validationResult.data };
}

// Default Lucidia configuration
const defaultSpawnConfig: SpawnRulesConfig = {
  version: "1.0.0",
  settings: {
    approval_required: true,
    approver: "BlackRoad Founders",
    default_ttl: "7d",
    max_clones: 5,
    cooldown_period: "24h",
  },
  rules: [
    {
      id: "escalation-surge",
      name: "Escalation Surge Handler",
      if: { escalations_last_3_days: ">10" },
      then: {
        spawn: "escalation-handler",
        config: {
          role: "sentinel",
          ttl: "72h",
          inherits_from: "guardian-agent",
          description: "Handles surge in escalations",
        },
      },
    },
    {
      id: "blocked-resolver",
      name: "Blocked Issue Resolver",
      if: { blocked_prs: ">5" },
      then: {
        spawn: "blocked-resolver",
        config: {
          role: "reviewer",
          ttl: "48h",
          inherits_from: "guardian-agent",
          description: "Resolves blocked PRs",
        },
      },
    },
  ],
};

const lucidia = createLucidia(defaultSpawnConfig);

// Mock environment data - in production, fetch from monitoring service
const environments: Environment[] = [
  { id: "prod-us-east", name: "Production US", region: "us-east-1", status: "healthy" },
  { id: "prod-eu-west", name: "Production EU", region: "eu-west-1", status: "healthy" },
  { id: "staging", name: "Staging", region: "us-west-2", status: "healthy" },
  { id: "dev", name: "Development", region: "us-east-2", status: "healthy" },
];

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

  // Environment status endpoint
  server.get("/api/environments", async () => {
    return { environments };
  });

  // Update environment status (for monitoring integration)
  server.patch<{ Params: { id: string }; Body: { status: string } }>(
    "/api/environments/:id",
    async (request, reply) => {
      const { id } = request.params;
      const { status } = request.body;
      const env = environments.find((e) => e.id === id);
      if (!env) {
        reply.status(404);
        return { error: "Environment not found" };
      }
      if (!["healthy", "degraded", "down"].includes(status)) {
        reply.status(400);
        return { error: "Invalid status. Must be: healthy, degraded, or down" };
      }
      env.status = status as "healthy" | "degraded" | "down";
      return { success: true, environment: env };
    }
  );

  // Chronicles endpoints
  server.get("/api/chronicles", async (request, reply) => {
    try {
      // TODO: Consider caching the chronicles data to avoid reading from disk on every request
      const fileContent = await readFile(CHRONICLES_PATH, "utf-8");
      const chroniclesData = JSON.parse(fileContent);
      
      if (!Array.isArray(chroniclesData.episodes)) {
        reply.status(500);
        return { error: "Invalid chronicles data structure: episodes must be an array" };
      }
      
      // Validate each episode and filter out invalid ones
      const validEpisodes = chroniclesData.episodes.filter((episode: any) => {
        const isValid = validateEpisode(episode);
        if (!isValid) {
          console.warn("Invalid episode found and filtered out:", episode.id || "unknown");
        }
        return isValid;
      });
      
      return { episodes: validEpisodes, total: validEpisodes.length };
    } catch (error) {
      console.error("Failed to read chronicles data:", error);
      reply.status(500);
      return { error: "Failed to load chronicles data", episodes: [], total: 0 };
    }
  });

  // Lucidia spawn endpoints
  server.get("/api/lucidia/rules", async () => {
    return {
      settings: lucidia.getSettings(),
      rules: lucidia.getRules(),
    };
  });

  server.post<{ Body: Metrics }>("/api/lucidia/spawn", async (request, reply) => {
    try {
      validateMetrics(request.body);
      const metrics = request.body;
      const result = lucidia.spawn(metrics);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      reply.status(error instanceof ValidationError ? 400 : 500);
      return { error: message };
    }
  });

  server.post<{ Body: Metrics }>("/api/lucidia/detect", async (request, reply) => {
    try {
      validateMetrics(request.body);
      const metrics = request.body;
      const result = lucidia.detect(metrics);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      reply.status(error instanceof ValidationError ? 400 : 500);
      return { error: message };
    }
  });

  return server;
}

// Initialize job workers if Redis is available
function initializeJobWorkers() {
  const redisHost = process.env.REDIS_HOST || "localhost";
  const redisPort = Number(process.env.REDIS_PORT || 6379);

  if (process.env.ENABLE_JOBS === "true") {
    try {
      const worker = registerSampleJobProcessor({ host: redisHost, port: redisPort });
      console.log(`Job worker registered, connecting to Redis at ${redisHost}:${redisPort}`);
      return worker;
    } catch (error) {
      console.warn("Failed to initialize job workers:", error);
      return null;
    }
  }
  return null;
}

if (require.main === module) {
  const port = Number(process.env.PORT || 8080);

  // Initialize job workers
  const jobWorker = initializeJobWorkers();

  createServer()
    .then((server) => server.listen({ port, host: "0.0.0.0" }))
    .then((address) => {
      console.log(`Server listening at ${address}`);
      console.log(`Lucidia spawn system: ACTIVE`);
      console.log(`Job workers: ${jobWorker ? "ENABLED" : "DISABLED (set ENABLE_JOBS=true)"}`);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

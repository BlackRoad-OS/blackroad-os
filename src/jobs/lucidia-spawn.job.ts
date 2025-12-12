/**
 * Lucidia Spawn Job Processor
 *
 * Processes spawn detection jobs from the queue.
 * When triggered, evaluates current metrics against spawn rules
 * and initiates agent spawning if conditions are met.
 */

import { Worker, Queue } from "bullmq";
import { createLucidia } from "../lucidia";
import type { Metrics, SpawnRulesConfig } from "../lucidia";
import { notifyAgentPR } from "../notify";

export const LUCIDIA_SPAWN_QUEUE = "lucidia-spawn";

interface SpawnJobData {
  metrics: Metrics;
  triggeredBy?: string;
  timestamp?: string;
}

interface SpawnJobResult {
  matched: boolean;
  agentSpawned?: string;
  prCreated?: boolean;
  notificationSent?: boolean;
}

// Default configuration - in production, load from YAML
const defaultConfig: SpawnRulesConfig = {
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
    {
      id: "review-accelerator",
      name: "Review Accelerator",
      if: { avg_review_time: ">48" },
      then: {
        spawn: "review-accelerator",
        config: {
          role: "reviewer",
          ttl: "72h",
          inherits_from: "guardian-agent",
          description: "Accelerates PR reviews",
        },
      },
    },
  ],
};

const lucidia = createLucidia(defaultConfig);

/**
 * Register the Lucidia spawn job processor
 */
export function registerLucidiaSpawnProcessor(
  connection = { host: "localhost", port: 6379 }
) {
  const worker = new Worker<SpawnJobData, SpawnJobResult>(
    LUCIDIA_SPAWN_QUEUE,
    async (job) => {
      console.log(`[Lucidia] Processing spawn job ${job.id}`);

      const { metrics, triggeredBy } = job.data;
      const spawnOutput = lucidia.spawn(metrics);

      if (!spawnOutput.result.matched) {
        console.log(`[Lucidia] No spawn rules matched for job ${job.id}`);
        return { matched: false };
      }

      console.log(`[Lucidia] Spawn rule matched: ${spawnOutput.result.rule?.name}`);

      const response: SpawnJobResult = {
        matched: true,
        agentSpawned: spawnOutput.agent?.spec.name,
        prCreated: !!spawnOutput.pr,
        notificationSent: false,
      };

      // Send notification if agent was spawned
      if (spawnOutput.agent && spawnOutput.pr) {
        try {
          await notifyAgentPR({
            agentName: spawnOutput.agent.spec.name,
            prURL: `https://github.com/BlackRoad-OS/blackroad-os/pull/new/${spawnOutput.pr.branch}`,
            purpose: spawnOutput.agent.spec.description,
            summary: `Auto-spawned by Lucidia based on rule: ${spawnOutput.result.rule?.name}. Triggered by: ${triggeredBy || "system"}`,
            ttl: spawnOutput.agent.spec.ttl,
            awaitingApproval: spawnOutput.pr.assignee,
          });
          response.notificationSent = true;
          console.log(`[Lucidia] Notification sent for agent: ${spawnOutput.agent.spec.name}`);
        } catch (error) {
          console.error(`[Lucidia] Failed to send notification:`, error);
        }
      }

      return response;
    },
    { connection }
  );

  worker.on("failed", (job, err) => {
    console.error(`[Lucidia] Job ${job?.id} failed:`, err);
  });

  worker.on("completed", (job, result) => {
    console.log(`[Lucidia] Job ${job.id} completed:`, result);
  });

  return worker;
}

/**
 * Create a queue for adding spawn jobs
 */
export function createSpawnQueue(connection = { host: "localhost", port: 6379 }) {
  return new Queue<SpawnJobData>(LUCIDIA_SPAWN_QUEUE, { connection });
}

/**
 * Add a spawn detection job to the queue
 */
export async function queueSpawnDetection(
  queue: Queue<SpawnJobData>,
  metrics: Metrics,
  triggeredBy?: string
) {
  const job = await queue.add("detect-spawn", {
    metrics,
    triggeredBy,
    timestamp: new Date().toISOString(),
  });
  return job;
}

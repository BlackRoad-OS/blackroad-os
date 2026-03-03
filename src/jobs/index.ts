/**
 * Job Processors Index
 *
 * Exports all job processors for the BlackRoad OS queue system.
 * Uses BullMQ with Redis for reliable job processing.
 */

export { registerSampleJobProcessor } from "./sample.job";
export {
  registerLucidiaSpawnProcessor,
  createSpawnQueue,
  queueSpawnDetection,
  LUCIDIA_SPAWN_QUEUE,
} from "./lucidia-spawn.job";

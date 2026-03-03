/**
 * BlackRoad OS - Platform Integrations
 * Unified integration layer for all external services
 */

// Deployment platforms
export * from "./deployment/railway.js";
export * from "./deployment/cloudflare.js";
export * from "./deployment/vercel.js";
export * from "./deployment/digitalocean.js";
export * from "./deployment/docker.js";
export * from "./deployment/raspberrypi.js";

// Source control & project management
export * from "./scm/github.js";
export * from "./project/asana.js";
export * from "./project/notion.js";

// Authentication & payments
export * from "./auth/clerk.js";
export * from "./payments/stripe.js";

// AI & ML
export * from "./ai/huggingface.js";
export * from "./ai/open-source-models.js";

// Tunneling
export * from "./tunnels/index.js";

// Mobile & dev tools
export * from "./mobile/index.js";

// Types
export * from "./types.js";

// Config loader
export { loadPlatformConfig, getPlatformStatus } from "./config-loader.js";

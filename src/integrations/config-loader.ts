/**
 * BlackRoad OS - Platform Configuration Loader
 */

import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import type { PlatformStatus } from "./types.js";

interface PlatformConfig {
  version: string;
  deployment: Record<string, { enabled: boolean; description: string }>;
  sourceControl: Record<string, { enabled: boolean; description: string }>;
  projectManagement: Record<string, { enabled: boolean; description: string }>;
  authentication: Record<string, { enabled: boolean; description: string }>;
  payments: Record<string, { enabled: boolean; description: string }>;
  ai: Record<string, { enabled: boolean; description: string }>;
  tunnels: Record<string, { enabled: boolean; description: string }>;
  mobileApps: Record<string, { enabled: boolean; description: string }>;
}

let cachedConfig: PlatformConfig | null = null;

/**
 * Load platform configuration from YAML file
 */
export function loadPlatformConfig(): PlatformConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const configPath = path.resolve(
    process.cwd(),
    "config",
    "platforms.yml"
  );

  try {
    const raw = fs.readFileSync(configPath, "utf8");
    cachedConfig = yaml.load(raw) as PlatformConfig;
    return cachedConfig;
  } catch (error) {
    console.warn("Failed to load platforms.yml, using defaults");
    return getDefaultConfig();
  }
}

/**
 * Clear cached config (useful for testing or hot reloading)
 */
export function clearConfigCache(): void {
  cachedConfig = null;
}

/**
 * Get status of all platforms
 */
export async function getPlatformStatus(): Promise<PlatformStatus[]> {
  const config = loadPlatformConfig();
  const statuses: PlatformStatus[] = [];

  // Check each category
  const categories = [
    "deployment",
    "sourceControl",
    "projectManagement",
    "authentication",
    "payments",
    "ai",
    "tunnels",
    "mobileApps",
  ];

  for (const category of categories) {
    const platforms = config[category as keyof PlatformConfig];
    if (typeof platforms !== "object") continue;

    for (const [name, settings] of Object.entries(platforms)) {
      if (typeof settings !== "object" || !("enabled" in settings)) continue;

      statuses.push({
        name: `${category}/${name}`,
        enabled: settings.enabled,
        healthy: await checkPlatformHealth(name, settings.enabled),
        lastCheck: new Date(),
      });
    }
  }

  return statuses;
}

/**
 * Check if a specific platform is healthy
 */
async function checkPlatformHealth(
  name: string,
  enabled: boolean
): Promise<boolean> {
  if (!enabled) return true; // Disabled platforms are "healthy" by default

  // Check for required environment variables
  const envVarMap: Record<string, string[]> = {
    railway: ["RAILWAY_TOKEN"],
    cloudflare: ["CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID"],
    vercel: ["VERCEL_TOKEN"],
    digitalocean: ["DIGITALOCEAN_TOKEN"],
    github: ["GITHUB_TOKEN"],
    clerk: ["CLERK_SECRET_KEY"],
    stripe: ["STRIPE_SECRET_KEY"],
    huggingface: ["HUGGINGFACE_TOKEN"],
    asana: ["ASANA_ACCESS_TOKEN"],
    notion: ["NOTION_TOKEN"],
    ngrok: ["NGROK_AUTHTOKEN"],
    tailscale: ["TAILSCALE_AUTHKEY"],
  };

  const requiredVars = envVarMap[name.toLowerCase()] || [];
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      return false;
    }
  }

  return true;
}

/**
 * Get default configuration when file is not found
 */
function getDefaultConfig(): PlatformConfig {
  return {
    version: "1.0",
    deployment: {
      railway: { enabled: true, description: "Railway deployment" },
      cloudflare: { enabled: true, description: "Cloudflare Workers/Pages" },
      vercel: { enabled: false, description: "Vercel deployment" },
      digitalocean: { enabled: false, description: "Digital Ocean Droplets" },
      docker: { enabled: true, description: "Docker containers" },
      raspberrypi: { enabled: false, description: "Raspberry Pi devices" },
    },
    sourceControl: {
      github: { enabled: true, description: "GitHub integration" },
    },
    projectManagement: {
      asana: { enabled: false, description: "Asana integration" },
      notion: { enabled: false, description: "Notion integration" },
    },
    authentication: {
      clerk: { enabled: false, description: "Clerk auth" },
    },
    payments: {
      stripe: { enabled: false, description: "Stripe payments" },
    },
    ai: {
      huggingface: { enabled: false, description: "Hugging Face models" },
      openSourceModels: { enabled: true, description: "Open source AI models" },
    },
    tunnels: {
      cloudflare: { enabled: false, description: "Cloudflare Tunnel" },
      ngrok: { enabled: false, description: "ngrok tunnels" },
      tailscale: { enabled: false, description: "Tailscale VPN" },
      localtunnel: { enabled: false, description: "LocalTunnel" },
    },
    mobileApps: {
      workingCopy: { enabled: false, description: "Working Copy Git" },
      shellfish: { enabled: false, description: "Shellfish SSH" },
      pyto: { enabled: false, description: "Pyto Python IDE" },
      warp: { enabled: false, description: "Warp terminal" },
    },
  };
}

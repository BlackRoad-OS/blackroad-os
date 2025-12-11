/**
 * BlackRoad OS - Platform Integration Types
 */

export interface PlatformStatus {
  name: string;
  enabled: boolean;
  healthy: boolean;
  lastCheck: Date;
  error?: string;
}

export interface DeploymentResult {
  success: boolean;
  url?: string;
  deploymentId?: string;
  logs?: string[];
  error?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: "pending" | "succeeded" | "failed" | "canceled";
  customerId?: string;
}

export interface AIModelConfig {
  id: string;
  name: string;
  provider: string;
  parameters?: string;
  license: string;
  audited: boolean;
  forkable: boolean;
  safety: {
    status: "verified" | "pending" | "failed";
    lastAudit?: string;
    auditor?: string;
  };
}

export interface AIInferenceRequest {
  model: string;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface AIInferenceResponse {
  text: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface TunnelConfig {
  provider: "cloudflare" | "ngrok" | "tailscale" | "localtunnel";
  enabled: boolean;
  url?: string;
  status: "connected" | "disconnected" | "error";
}

export interface GitHubProjectItem {
  id: string;
  contentId: string;
  contentType: "Issue" | "PullRequest" | "DraftIssue";
  title: string;
  status?: string;
  fields: Record<string, unknown>;
}

export interface GitHubProjectFieldUpdate {
  projectId: string;
  itemId: string;
  fieldId: string;
  value: string | number | { singleSelectOptionId: string };
}

export interface NotionPage {
  id: string;
  title: string;
  url: string;
  properties: Record<string, unknown>;
  createdTime: string;
  lastEditedTime: string;
}

export interface AsanaTask {
  gid: string;
  name: string;
  completed: boolean;
  assignee?: { gid: string; name: string };
  projects: Array<{ gid: string; name: string }>;
  dueOn?: string;
  notes?: string;
}

export interface DigitalOceanDroplet {
  id: number;
  name: string;
  status: "new" | "active" | "off" | "archive";
  size: string;
  region: string;
  image: string;
  networks: {
    v4: Array<{ ip_address: string; type: "public" | "private" }>;
    v6: Array<{ ip_address: string; type: "public" | "private" }>;
  };
}

export interface RaspberryPiDevice {
  id: string;
  hostname: string;
  model: "pi4" | "pi5" | "zero2w";
  ipAddress: string;
  status: "online" | "offline" | "unknown";
  services: Array<{
    name: string;
    status: "running" | "stopped" | "failed";
    port: number;
  }>;
}

export interface MobileAppCallback {
  app: "workingCopy" | "shellfish" | "pyto";
  action: string;
  params: Record<string, string>;
  callbackUrl?: string;
}

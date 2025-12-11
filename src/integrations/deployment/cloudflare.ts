/**
 * BlackRoad OS - Cloudflare Integration
 * Supports Workers, Pages, KV, R2, and Tunnels
 */

import type { DeploymentResult, TunnelConfig } from "../types.js";

interface CloudflareConfig {
  apiToken: string;
  accountId: string;
  zoneId?: string;
}

interface CloudflareWorker {
  id: string;
  name: string;
  created_on: string;
  modified_on: string;
}

interface CloudflareKVNamespace {
  id: string;
  title: string;
  supports_url_encoding: boolean;
}

interface CloudflareTunnel {
  id: string;
  name: string;
  status: "active" | "inactive" | "degraded";
  created_at: string;
  connections: Array<{
    colo_name: string;
    is_pending_reconnect: boolean;
  }>;
}

/**
 * Cloudflare API client
 */
export class CloudflareClient {
  private apiToken: string;
  private accountId: string;
  private baseUrl = "https://api.cloudflare.com/client/v4";

  constructor(config?: Partial<CloudflareConfig>) {
    this.apiToken = config?.apiToken || process.env.CLOUDFLARE_API_TOKEN || "";
    this.accountId = config?.accountId || process.env.CLOUDFLARE_ACCOUNT_ID || "";
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await response.json();
    if (!data.success) {
      const errors = data.errors?.map((e: { message: string }) => e.message).join(", ");
      throw new Error(`Cloudflare API error: ${errors}`);
    }

    return data.result;
  }

  // =====================
  // Workers
  // =====================

  /**
   * List all Workers
   */
  async listWorkers(): Promise<CloudflareWorker[]> {
    return this.request<CloudflareWorker[]>(
      `/accounts/${this.accountId}/workers/scripts`
    );
  }

  /**
   * Deploy a Worker script
   */
  async deployWorker(
    name: string,
    script: string,
    bindings?: Record<string, unknown>
  ): Promise<DeploymentResult> {
    try {
      const formData = new FormData();
      formData.append(
        "script",
        new Blob([script], { type: "application/javascript" })
      );

      if (bindings) {
        formData.append(
          "metadata",
          new Blob([JSON.stringify({ bindings })], { type: "application/json" })
        );
      }

      await fetch(
        `${this.baseUrl}/accounts/${this.accountId}/workers/scripts/${name}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
          },
          body: formData,
        }
      );

      return {
        success: true,
        url: `https://${name}.${this.accountId}.workers.dev`,
        deploymentId: name,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // =====================
  // KV Storage
  // =====================

  /**
   * List KV namespaces
   */
  async listKVNamespaces(): Promise<CloudflareKVNamespace[]> {
    return this.request<CloudflareKVNamespace[]>(
      `/accounts/${this.accountId}/storage/kv/namespaces`
    );
  }

  /**
   * Create KV namespace
   */
  async createKVNamespace(title: string): Promise<CloudflareKVNamespace> {
    return this.request<CloudflareKVNamespace>(
      `/accounts/${this.accountId}/storage/kv/namespaces`,
      {
        method: "POST",
        body: JSON.stringify({ title }),
      }
    );
  }

  /**
   * Write to KV
   */
  async kvPut(namespaceId: string, key: string, value: string): Promise<void> {
    await this.request(
      `/accounts/${this.accountId}/storage/kv/namespaces/${namespaceId}/values/${key}`,
      {
        method: "PUT",
        body: value,
        headers: { "Content-Type": "text/plain" },
      }
    );
  }

  /**
   * Read from KV
   */
  async kvGet(namespaceId: string, key: string): Promise<string | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/accounts/${this.accountId}/storage/kv/namespaces/${namespaceId}/values/${key}`,
        {
          headers: { Authorization: `Bearer ${this.apiToken}` },
        }
      );
      if (!response.ok) return null;
      return response.text();
    } catch {
      return null;
    }
  }

  // =====================
  // Tunnels
  // =====================

  /**
   * List tunnels
   */
  async listTunnels(): Promise<CloudflareTunnel[]> {
    return this.request<CloudflareTunnel[]>(
      `/accounts/${this.accountId}/cfd_tunnel`
    );
  }

  /**
   * Get tunnel status
   */
  async getTunnelStatus(tunnelId: string): Promise<TunnelConfig> {
    try {
      const tunnel = await this.request<CloudflareTunnel>(
        `/accounts/${this.accountId}/cfd_tunnel/${tunnelId}`
      );
      return {
        provider: "cloudflare",
        enabled: true,
        status: tunnel.status === "active" ? "connected" : "disconnected",
      };
    } catch {
      return {
        provider: "cloudflare",
        enabled: false,
        status: "error",
      };
    }
  }

  // =====================
  // Pages
  // =====================

  /**
   * List Pages projects
   */
  async listPagesProjects(): Promise<Array<{ name: string; subdomain: string }>> {
    const result = await this.request<Array<{ name: string; subdomain: string }>>(
      `/accounts/${this.accountId}/pages/projects`
    );
    return result;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    if (!this.apiToken || !this.accountId) return false;

    try {
      await this.request(`/accounts/${this.accountId}`);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Create Cloudflare client with environment defaults
 */
export function createCloudflareClient(): CloudflareClient {
  return new CloudflareClient({
    apiToken: process.env.CLOUDFLARE_API_TOKEN,
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  });
}

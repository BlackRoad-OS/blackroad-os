/**
 * BlackRoad OS - Digital Ocean Integration
 * Supports Droplets, Kubernetes, and Spaces
 */

import type { DeploymentResult, DigitalOceanDroplet } from "../types.js";

interface DigitalOceanConfig {
  token: string;
  spacesKey?: string;
  spacesSecret?: string;
}

interface DropletCreateOptions {
  name: string;
  region: string;
  size: string;
  image: string;
  sshKeys?: string[];
  userData?: string;
  tags?: string[];
}

interface DOKubernetesCluster {
  id: string;
  name: string;
  region: string;
  status: { state: string };
  node_pools: Array<{
    id: string;
    name: string;
    size: string;
    count: number;
  }>;
}

/**
 * Digital Ocean API client
 */
export class DigitalOceanClient {
  private token: string;
  private baseUrl = "https://api.digitalocean.com/v2";

  constructor(config?: Partial<DigitalOceanConfig>) {
    this.token = config?.token || process.env.DIGITALOCEAN_TOKEN || "";
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `DigitalOcean API error: ${response.status} - ${error.message || "Unknown error"}`
      );
    }

    return response.json();
  }

  // =====================
  // Droplets
  // =====================

  /**
   * List all droplets
   */
  async listDroplets(): Promise<DigitalOceanDroplet[]> {
    const result = await this.request<{ droplets: DigitalOceanDroplet[] }>("/droplets");
    return result.droplets;
  }

  /**
   * Get droplet by ID
   */
  async getDroplet(dropletId: number): Promise<DigitalOceanDroplet | null> {
    try {
      const result = await this.request<{ droplet: DigitalOceanDroplet }>(
        `/droplets/${dropletId}`
      );
      return result.droplet;
    } catch {
      return null;
    }
  }

  /**
   * Create a new droplet
   */
  async createDroplet(options: DropletCreateOptions): Promise<DeploymentResult> {
    try {
      const result = await this.request<{ droplet: DigitalOceanDroplet }>("/droplets", {
        method: "POST",
        body: JSON.stringify({
          name: options.name,
          region: options.region,
          size: options.size,
          image: options.image,
          ssh_keys: options.sshKeys,
          user_data: options.userData,
          tags: options.tags || ["blackroad"],
        }),
      });

      return {
        success: true,
        deploymentId: result.droplet.id.toString(),
        logs: [
          `Droplet created: ${result.droplet.name}`,
          `ID: ${result.droplet.id}`,
          `Region: ${options.region}`,
          `Size: ${options.size}`,
        ],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Delete droplet
   */
  async deleteDroplet(dropletId: number): Promise<boolean> {
    try {
      await this.request(`/droplets/${dropletId}`, { method: "DELETE" });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Perform droplet action (power on/off, reboot, etc.)
   */
  async dropletAction(
    dropletId: number,
    action: "power_on" | "power_off" | "reboot" | "shutdown" | "rebuild"
  ): Promise<boolean> {
    try {
      await this.request(`/droplets/${dropletId}/actions`, {
        method: "POST",
        body: JSON.stringify({ type: action }),
      });
      return true;
    } catch {
      return false;
    }
  }

  // =====================
  // Kubernetes
  // =====================

  /**
   * List Kubernetes clusters
   */
  async listKubernetesClusters(): Promise<DOKubernetesCluster[]> {
    const result = await this.request<{ kubernetes_clusters: DOKubernetesCluster[] }>(
      "/kubernetes/clusters"
    );
    return result.kubernetes_clusters;
  }

  /**
   * Get Kubernetes cluster
   */
  async getKubernetesCluster(clusterId: string): Promise<DOKubernetesCluster | null> {
    try {
      const result = await this.request<{ kubernetes_cluster: DOKubernetesCluster }>(
        `/kubernetes/clusters/${clusterId}`
      );
      return result.kubernetes_cluster;
    } catch {
      return null;
    }
  }

  /**
   * Get kubeconfig for cluster
   */
  async getKubeconfig(clusterId: string): Promise<string | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/kubernetes/clusters/${clusterId}/kubeconfig`,
        {
          headers: { Authorization: `Bearer ${this.token}` },
        }
      );
      if (!response.ok) return null;
      return response.text();
    } catch {
      return null;
    }
  }

  // =====================
  // Regions & Sizes
  // =====================

  /**
   * List available regions
   */
  async listRegions(): Promise<Array<{ slug: string; name: string; available: boolean }>> {
    const result = await this.request<{
      regions: Array<{ slug: string; name: string; available: boolean }>;
    }>("/regions");
    return result.regions;
  }

  /**
   * List available sizes
   */
  async listSizes(): Promise<
    Array<{ slug: string; memory: number; vcpus: number; disk: number; price_monthly: number }>
  > {
    const result = await this.request<{
      sizes: Array<{
        slug: string;
        memory: number;
        vcpus: number;
        disk: number;
        price_monthly: number;
      }>;
    }>("/sizes");
    return result.sizes;
  }

  /**
   * List SSH keys
   */
  async listSSHKeys(): Promise<Array<{ id: number; name: string; fingerprint: string }>> {
    const result = await this.request<{
      ssh_keys: Array<{ id: number; name: string; fingerprint: string }>;
    }>("/account/keys");
    return result.ssh_keys;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    if (!this.token) return false;

    try {
      await this.request("/account");
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Create Digital Ocean client with environment defaults
 */
export function createDigitalOceanClient(): DigitalOceanClient {
  return new DigitalOceanClient({
    token: process.env.DIGITALOCEAN_TOKEN,
  });
}

/**
 * Standard droplet sizes with friendly names
 */
export const DROPLET_SIZES = {
  micro: "s-1vcpu-1gb",
  small: "s-2vcpu-2gb",
  medium: "s-4vcpu-8gb",
  large: "s-8vcpu-16gb",
  xlarge: "s-16vcpu-32gb",
} as const;

/**
 * Standard regions with friendly names
 */
export const DROPLET_REGIONS = {
  nyc: "nyc1",
  sfo: "sfo3",
  ams: "ams3",
  sgp: "sgp1",
  lon: "lon1",
  fra: "fra1",
  tor: "tor1",
  blr: "blr1",
} as const;

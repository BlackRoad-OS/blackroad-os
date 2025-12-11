/**
 * BlackRoad OS - Vercel Deployment Integration
 */

import type { DeploymentResult } from "../types.js";

interface VercelConfig {
  token: string;
  orgId?: string;
  projectId?: string;
}

interface VercelDeployment {
  id: string;
  name: string;
  url: string;
  state: "BUILDING" | "ERROR" | "INITIALIZING" | "QUEUED" | "READY" | "CANCELED";
  createdAt: number;
  meta?: Record<string, string>;
}

interface VercelProject {
  id: string;
  name: string;
  framework?: string;
  latestDeployments?: VercelDeployment[];
}

/**
 * Vercel API client
 */
export class VercelClient {
  private token: string;
  private teamId?: string;
  private baseUrl = "https://api.vercel.com";

  constructor(config?: Partial<VercelConfig>) {
    this.token = config?.token || process.env.VERCEL_TOKEN || "";
    this.teamId = config?.orgId || process.env.VERCEL_ORG_ID;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (this.teamId) {
      url.searchParams.set("teamId", this.teamId);
    }

    const response = await fetch(url.toString(), {
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
        `Vercel API error: ${response.status} - ${error.error?.message || "Unknown error"}`
      );
    }

    return response.json();
  }

  /**
   * List all projects
   */
  async listProjects(): Promise<VercelProject[]> {
    const result = await this.request<{ projects: VercelProject[] }>("/v9/projects");
    return result.projects;
  }

  /**
   * Get project by ID or name
   */
  async getProject(idOrName: string): Promise<VercelProject | null> {
    try {
      return await this.request<VercelProject>(`/v9/projects/${idOrName}`);
    } catch {
      return null;
    }
  }

  /**
   * List deployments for a project
   */
  async listDeployments(projectId?: string, limit = 10): Promise<VercelDeployment[]> {
    const endpoint = projectId
      ? `/v6/deployments?projectId=${projectId}&limit=${limit}`
      : `/v6/deployments?limit=${limit}`;
    const result = await this.request<{ deployments: VercelDeployment[] }>(endpoint);
    return result.deployments;
  }

  /**
   * Get deployment by ID
   */
  async getDeployment(deploymentId: string): Promise<VercelDeployment | null> {
    try {
      return await this.request<VercelDeployment>(`/v13/deployments/${deploymentId}`);
    } catch {
      return null;
    }
  }

  /**
   * Create a new deployment
   */
  async createDeployment(options: {
    name: string;
    gitSource?: {
      type: "github" | "gitlab" | "bitbucket";
      ref: string;
      repoId: string;
    };
    target?: "production" | "preview";
  }): Promise<DeploymentResult> {
    try {
      const deployment = await this.request<VercelDeployment>("/v13/deployments", {
        method: "POST",
        body: JSON.stringify({
          name: options.name,
          gitSource: options.gitSource,
          target: options.target || "preview",
        }),
      });

      return {
        success: true,
        url: `https://${deployment.url}`,
        deploymentId: deployment.id,
        logs: [`Deployment created: ${deployment.id}`, `State: ${deployment.state}`],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get deployment logs
   */
  async getDeploymentLogs(deploymentId: string): Promise<string[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/v2/deployments/${deploymentId}/events`,
        {
          headers: { Authorization: `Bearer ${this.token}` },
        }
      );
      const text = await response.text();
      return text.split("\n").filter(Boolean);
    } catch {
      return [];
    }
  }

  /**
   * Create project
   */
  async createProject(options: {
    name: string;
    framework?: string;
    gitRepository?: {
      type: "github" | "gitlab" | "bitbucket";
      repo: string;
    };
  }): Promise<VercelProject | null> {
    try {
      return await this.request<VercelProject>("/v10/projects", {
        method: "POST",
        body: JSON.stringify(options),
      });
    } catch {
      return null;
    }
  }

  /**
   * Set environment variables
   */
  async setEnvVariables(
    projectId: string,
    variables: Array<{
      key: string;
      value: string;
      target: ("production" | "preview" | "development")[];
    }>
  ): Promise<boolean> {
    try {
      await this.request(`/v10/projects/${projectId}/env`, {
        method: "POST",
        body: JSON.stringify(variables),
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    if (!this.token) return false;

    try {
      await this.request("/v2/user");
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Create Vercel client with environment defaults
 */
export function createVercelClient(): VercelClient {
  return new VercelClient({
    token: process.env.VERCEL_TOKEN,
    orgId: process.env.VERCEL_ORG_ID,
  });
}

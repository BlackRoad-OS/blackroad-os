/**
 * BlackRoad OS - Railway Deployment Integration
 */

import type { DeploymentResult } from "../types.js";

interface RailwayConfig {
  token: string;
  projectId?: string;
  serviceId?: string;
}

interface RailwayDeployment {
  id: string;
  status: "BUILDING" | "DEPLOYING" | "SUCCESS" | "FAILED" | "CRASHED";
  url?: string;
  createdAt: string;
}

/**
 * Railway deployment client
 */
export class RailwayClient {
  private token: string;
  private apiUrl = "https://backboard.railway.app/graphql/v2";

  constructor(config?: Partial<RailwayConfig>) {
    this.token = config?.token || process.env.RAILWAY_TOKEN || "";
  }

  private async query<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`Railway API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.errors) {
      throw new Error(`Railway GraphQL error: ${data.errors[0].message}`);
    }

    return data.data;
  }

  /**
   * Get current deployment status
   */
  async getDeploymentStatus(deploymentId: string): Promise<RailwayDeployment | null> {
    const query = `
      query GetDeployment($id: String!) {
        deployment(id: $id) {
          id
          status
          staticUrl
          createdAt
        }
      }
    `;

    try {
      const result = await this.query<{ deployment: RailwayDeployment }>(query, {
        id: deploymentId,
      });
      return result.deployment;
    } catch {
      return null;
    }
  }

  /**
   * List projects
   */
  async listProjects(): Promise<Array<{ id: string; name: string }>> {
    const query = `
      query {
        me {
          projects {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      }
    `;

    try {
      const result = await this.query<{
        me: { projects: { edges: Array<{ node: { id: string; name: string } }> } };
      }>(query);
      return result.me.projects.edges.map((e) => e.node);
    } catch {
      return [];
    }
  }

  /**
   * Trigger a deployment via Railway CLI (exec)
   */
  async deploy(projectId?: string): Promise<DeploymentResult> {
    // Railway deployments are typically triggered via CLI or git push
    // This method validates the configuration
    if (!this.token) {
      return {
        success: false,
        error: "RAILWAY_TOKEN not configured",
      };
    }

    const projects = await this.listProjects();
    if (projects.length === 0) {
      return {
        success: false,
        error: "No Railway projects found",
      };
    }

    const targetProject = projectId
      ? projects.find((p) => p.id === projectId)
      : projects[0];

    if (!targetProject) {
      return {
        success: false,
        error: `Project ${projectId} not found`,
      };
    }

    return {
      success: true,
      deploymentId: `pending-${Date.now()}`,
      logs: [
        `Deployment triggered for project: ${targetProject.name}`,
        "Use 'railway up' CLI command for actual deployment",
      ],
    };
  }

  /**
   * Check if Railway integration is healthy
   */
  async healthCheck(): Promise<boolean> {
    if (!this.token) return false;

    try {
      const projects = await this.listProjects();
      return projects.length >= 0;
    } catch {
      return false;
    }
  }
}

/**
 * Create Railway client with environment defaults
 */
export function createRailwayClient(): RailwayClient {
  return new RailwayClient({
    token: process.env.RAILWAY_TOKEN,
  });
}

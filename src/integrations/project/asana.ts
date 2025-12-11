/**
 * BlackRoad OS - Asana Integration
 */

import type { AsanaTask } from "../types.js";

interface AsanaConfig {
  accessToken: string;
  workspaceId?: string;
  projectId?: string;
}

interface AsanaProject {
  gid: string;
  name: string;
  notes?: string;
  workspace: { gid: string; name: string };
}

interface AsanaSection {
  gid: string;
  name: string;
  project: { gid: string };
}

/**
 * Asana API client
 */
export class AsanaClient {
  private token: string;
  private workspaceId?: string;
  private baseUrl = "https://app.asana.com/api/1.0";

  constructor(config?: Partial<AsanaConfig>) {
    this.token = config?.accessToken || process.env.ASANA_ACCESS_TOKEN || "";
    this.workspaceId = config?.workspaceId || process.env.ASANA_WORKSPACE_ID;
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
        `Asana API error: ${response.status} - ${error.errors?.[0]?.message || "Unknown error"}`
      );
    }

    const data = await response.json();
    return data.data;
  }

  // =====================
  // Workspaces
  // =====================

  /**
   * List workspaces
   */
  async listWorkspaces(): Promise<Array<{ gid: string; name: string }>> {
    return this.request<Array<{ gid: string; name: string }>>("/workspaces");
  }

  // =====================
  // Projects
  // =====================

  /**
   * List projects in workspace
   */
  async listProjects(workspaceId?: string): Promise<AsanaProject[]> {
    const wsId = workspaceId || this.workspaceId;
    if (!wsId) throw new Error("Workspace ID required");

    return this.request<AsanaProject[]>(`/workspaces/${wsId}/projects`);
  }

  /**
   * Get project by ID
   */
  async getProject(projectId: string): Promise<AsanaProject | null> {
    try {
      return await this.request<AsanaProject>(`/projects/${projectId}`);
    } catch {
      return null;
    }
  }

  /**
   * Create project
   */
  async createProject(options: {
    name: string;
    workspaceId?: string;
    notes?: string;
    color?: string;
  }): Promise<AsanaProject | null> {
    const wsId = options.workspaceId || this.workspaceId;
    if (!wsId) throw new Error("Workspace ID required");

    try {
      return await this.request<AsanaProject>("/projects", {
        method: "POST",
        body: JSON.stringify({
          data: {
            name: options.name,
            workspace: wsId,
            notes: options.notes,
            color: options.color,
          },
        }),
      });
    } catch {
      return null;
    }
  }

  // =====================
  // Sections
  // =====================

  /**
   * List sections in project
   */
  async listSections(projectId: string): Promise<AsanaSection[]> {
    return this.request<AsanaSection[]>(`/projects/${projectId}/sections`);
  }

  /**
   * Create section
   */
  async createSection(projectId: string, name: string): Promise<AsanaSection | null> {
    try {
      return await this.request<AsanaSection>(`/projects/${projectId}/sections`, {
        method: "POST",
        body: JSON.stringify({ data: { name } }),
      });
    } catch {
      return null;
    }
  }

  // =====================
  // Tasks
  // =====================

  /**
   * List tasks in project
   */
  async listTasks(projectId: string): Promise<AsanaTask[]> {
    return this.request<AsanaTask[]>(
      `/projects/${projectId}/tasks?opt_fields=name,completed,assignee,projects,due_on,notes`
    );
  }

  /**
   * Get task by ID
   */
  async getTask(taskId: string): Promise<AsanaTask | null> {
    try {
      return await this.request<AsanaTask>(
        `/tasks/${taskId}?opt_fields=name,completed,assignee,projects,due_on,notes`
      );
    } catch {
      return null;
    }
  }

  /**
   * Create task
   */
  async createTask(options: {
    name: string;
    projectId: string;
    assignee?: string;
    dueOn?: string;
    notes?: string;
    sectionId?: string;
  }): Promise<AsanaTask | null> {
    try {
      const data: Record<string, unknown> = {
        name: options.name,
        projects: [options.projectId],
      };

      if (options.assignee) data.assignee = options.assignee;
      if (options.dueOn) data.due_on = options.dueOn;
      if (options.notes) data.notes = options.notes;

      const task = await this.request<AsanaTask>("/tasks", {
        method: "POST",
        body: JSON.stringify({ data }),
      });

      // Move to section if specified
      if (options.sectionId && task) {
        await this.addTaskToSection(task.gid, options.sectionId);
      }

      return task;
    } catch {
      return null;
    }
  }

  /**
   * Update task
   */
  async updateTask(
    taskId: string,
    updates: {
      name?: string;
      completed?: boolean;
      assignee?: string;
      dueOn?: string;
      notes?: string;
    }
  ): Promise<boolean> {
    try {
      const data: Record<string, unknown> = {};
      if (updates.name !== undefined) data.name = updates.name;
      if (updates.completed !== undefined) data.completed = updates.completed;
      if (updates.assignee !== undefined) data.assignee = updates.assignee;
      if (updates.dueOn !== undefined) data.due_on = updates.dueOn;
      if (updates.notes !== undefined) data.notes = updates.notes;

      await this.request(`/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify({ data }),
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Complete task
   */
  async completeTask(taskId: string): Promise<boolean> {
    return this.updateTask(taskId, { completed: true });
  }

  /**
   * Add task to section
   */
  async addTaskToSection(taskId: string, sectionId: string): Promise<boolean> {
    try {
      await this.request(`/sections/${sectionId}/addTask`, {
        method: "POST",
        body: JSON.stringify({ data: { task: taskId } }),
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete task
   */
  async deleteTask(taskId: string): Promise<boolean> {
    try {
      await this.request(`/tasks/${taskId}`, { method: "DELETE" });
      return true;
    } catch {
      return false;
    }
  }

  // =====================
  // Sync with GitHub
  // =====================

  /**
   * Sync GitHub issue to Asana task
   */
  async syncGitHubIssue(issue: {
    title: string;
    body?: string;
    number: number;
    url: string;
    state: string;
  }, projectId: string): Promise<AsanaTask | null> {
    const name = `[GitHub #${issue.number}] ${issue.title}`;
    const notes = `GitHub Issue: ${issue.url}\n\n${issue.body || ""}`;

    const task = await this.createTask({
      name,
      projectId,
      notes,
    });

    if (task && issue.state === "closed") {
      await this.completeTask(task.gid);
    }

    return task;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    if (!this.token) return false;

    try {
      await this.request("/users/me");
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Create Asana client with environment defaults
 */
export function createAsanaClient(): AsanaClient {
  return new AsanaClient({
    accessToken: process.env.ASANA_ACCESS_TOKEN,
    workspaceId: process.env.ASANA_WORKSPACE_ID,
  });
}

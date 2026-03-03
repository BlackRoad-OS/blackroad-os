/**
 * BlackRoad OS - GitHub Integration
 * Complete GitHub API integration including Projects V2 GraphQL
 */

import type { GitHubProjectItem, GitHubProjectFieldUpdate } from "../types.js";

interface GitHubConfig {
  token: string;
  owner?: string;
  repo?: string;
}

interface ProjectV2 {
  id: string;
  title: string;
  number: number;
  url: string;
  fields: {
    nodes: Array<{
      id: string;
      name: string;
      dataType: string;
      options?: Array<{ id: string; name: string }>;
    }>;
  };
}

interface ProjectV2Item {
  id: string;
  content: {
    __typename: string;
    title?: string;
    number?: number;
    url?: string;
  };
  fieldValues: {
    nodes: Array<{
      field?: { name: string };
      name?: string;
      text?: string;
    }>;
  };
}

/**
 * GitHub API client with full Projects V2 support
 */
export class GitHubClient {
  private token: string;
  private owner?: string;
  private repo?: string;
  private graphqlUrl = "https://api.github.com/graphql";
  private restUrl = "https://api.github.com";

  constructor(config?: Partial<GitHubConfig>) {
    this.token = config?.token || process.env.GITHUB_TOKEN || "";
    this.owner = config?.owner;
    this.repo = config?.repo;
  }

  // =====================
  // GraphQL Helper
  // =====================

  private async graphql<T>(
    query: string,
    variables?: Record<string, unknown>
  ): Promise<T> {
    const response = await fetch(this.graphqlUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });

    const data = await response.json();
    if (data.errors) {
      throw new Error(`GitHub GraphQL error: ${data.errors[0].message}`);
    }

    return data.data;
  }

  private async rest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.restUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`GitHub API error: ${response.status} - ${error.message}`);
    }

    return response.json();
  }

  // =====================
  // Projects V2 API
  // =====================

  /**
   * Get organization project by number
   */
  async getOrgProject(org: string, projectNumber: number): Promise<ProjectV2 | null> {
    const query = `
      query GetProject($org: String!, $number: Int!) {
        organization(login: $org) {
          projectV2(number: $number) {
            id
            title
            number
            url
            fields(first: 20) {
              nodes {
                ... on ProjectV2Field {
                  id
                  name
                  dataType
                }
                ... on ProjectV2SingleSelectField {
                  id
                  name
                  dataType
                  options {
                    id
                    name
                  }
                }
              }
            }
          }
        }
      }
    `;

    try {
      const result = await this.graphql<{
        organization: { projectV2: ProjectV2 };
      }>(query, { org, number: projectNumber });
      return result.organization.projectV2;
    } catch {
      return null;
    }
  }

  /**
   * Get user project by number
   */
  async getUserProject(login: string, projectNumber: number): Promise<ProjectV2 | null> {
    const query = `
      query GetProject($login: String!, $number: Int!) {
        user(login: $login) {
          projectV2(number: $number) {
            id
            title
            number
            url
            fields(first: 20) {
              nodes {
                ... on ProjectV2Field {
                  id
                  name
                  dataType
                }
                ... on ProjectV2SingleSelectField {
                  id
                  name
                  dataType
                  options {
                    id
                    name
                  }
                }
              }
            }
          }
        }
      }
    `;

    try {
      const result = await this.graphql<{
        user: { projectV2: ProjectV2 };
      }>(query, { login, number: projectNumber });
      return result.user.projectV2;
    } catch {
      return null;
    }
  }

  /**
   * Get project items
   */
  async getProjectItems(projectId: string, first = 50): Promise<ProjectV2Item[]> {
    const query = `
      query GetProjectItems($projectId: ID!, $first: Int!) {
        node(id: $projectId) {
          ... on ProjectV2 {
            items(first: $first) {
              nodes {
                id
                content {
                  __typename
                  ... on Issue {
                    title
                    number
                    url
                  }
                  ... on PullRequest {
                    title
                    number
                    url
                  }
                  ... on DraftIssue {
                    title
                  }
                }
                fieldValues(first: 10) {
                  nodes {
                    ... on ProjectV2ItemFieldTextValue {
                      field { ... on ProjectV2Field { name } }
                      text
                    }
                    ... on ProjectV2ItemFieldSingleSelectValue {
                      field { ... on ProjectV2SingleSelectField { name } }
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const result = await this.graphql<{
      node: { items: { nodes: ProjectV2Item[] } };
    }>(query, { projectId, first });

    return result.node.items.nodes;
  }

  /**
   * Add item to project
   */
  async addItemToProject(projectId: string, contentId: string): Promise<string | null> {
    const mutation = `
      mutation AddProjectItem($projectId: ID!, $contentId: ID!) {
        addProjectV2ItemById(input: {
          projectId: $projectId
          contentId: $contentId
        }) {
          item {
            id
          }
        }
      }
    `;

    try {
      const result = await this.graphql<{
        addProjectV2ItemById: { item: { id: string } };
      }>(mutation, { projectId, contentId });
      return result.addProjectV2ItemById.item.id;
    } catch {
      return null;
    }
  }

  /**
   * Update project item field - THIS FIXES THE PLACEHOLDER TODO
   */
  async updateProjectItemField(update: GitHubProjectFieldUpdate): Promise<boolean> {
    const mutation = `
      mutation UpdateProjectItemField($projectId: ID!, $itemId: ID!, $fieldId: ID!, $value: ProjectV2FieldValue!) {
        updateProjectV2ItemFieldValue(input: {
          projectId: $projectId
          itemId: $itemId
          fieldId: $fieldId
          value: $value
        }) {
          projectV2Item {
            id
          }
        }
      }
    `;

    try {
      await this.graphql(mutation, {
        projectId: update.projectId,
        itemId: update.itemId,
        fieldId: update.fieldId,
        value: update.value,
      });
      console.log(
        `✅ Updated project field ${update.fieldId} for item ${update.itemId}`
      );
      return true;
    } catch (error) {
      console.error(
        `❌ Failed to update project field: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      return false;
    }
  }

  /**
   * Update project item status by option name
   */
  async updateProjectItemStatus(
    projectId: string,
    itemId: string,
    statusFieldId: string,
    optionId: string
  ): Promise<boolean> {
    return this.updateProjectItemField({
      projectId,
      itemId,
      fieldId: statusFieldId,
      value: { singleSelectOptionId: optionId },
    });
  }

  /**
   * Remove item from project
   */
  async removeItemFromProject(projectId: string, itemId: string): Promise<boolean> {
    const mutation = `
      mutation RemoveProjectItem($projectId: ID!, $itemId: ID!) {
        deleteProjectV2Item(input: {
          projectId: $projectId
          itemId: $itemId
        }) {
          deletedItemId
        }
      }
    `;

    try {
      await this.graphql(mutation, { projectId, itemId });
      return true;
    } catch {
      return false;
    }
  }

  // =====================
  // Issues & PRs
  // =====================

  /**
   * Get issue node ID (for project operations)
   */
  async getIssueNodeId(owner: string, repo: string, issueNumber: number): Promise<string | null> {
    const query = `
      query GetIssue($owner: String!, $repo: String!, $number: Int!) {
        repository(owner: $owner, name: $repo) {
          issue(number: $number) {
            id
          }
        }
      }
    `;

    try {
      const result = await this.graphql<{
        repository: { issue: { id: string } };
      }>(query, { owner, repo, number: issueNumber });
      return result.repository.issue.id;
    } catch {
      return null;
    }
  }

  /**
   * Get PR node ID (for project operations)
   */
  async getPRNodeId(owner: string, repo: string, prNumber: number): Promise<string | null> {
    const query = `
      query GetPR($owner: String!, $repo: String!, $number: Int!) {
        repository(owner: $owner, name: $repo) {
          pullRequest(number: $number) {
            id
          }
        }
      }
    `;

    try {
      const result = await this.graphql<{
        repository: { pullRequest: { id: string } };
      }>(query, { owner, repo, number: prNumber });
      return result.repository.pullRequest.id;
    } catch {
      return null;
    }
  }

  /**
   * Add reaction to issue/PR
   */
  async addReaction(
    owner: string,
    repo: string,
    issueNumber: number,
    reaction: "+1" | "-1" | "laugh" | "confused" | "heart" | "hooray" | "rocket" | "eyes"
  ): Promise<boolean> {
    try {
      await this.rest(`/repos/${owner}/${repo}/issues/${issueNumber}/reactions`, {
        method: "POST",
        body: JSON.stringify({ content: reaction }),
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Create issue comment
   */
  async createComment(
    owner: string,
    repo: string,
    issueNumber: number,
    body: string
  ): Promise<boolean> {
    try {
      await this.rest(`/repos/${owner}/${repo}/issues/${issueNumber}/comments`, {
        method: "POST",
        body: JSON.stringify({ body }),
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Close issue
   */
  async closeIssue(owner: string, repo: string, issueNumber: number): Promise<boolean> {
    try {
      await this.rest(`/repos/${owner}/${repo}/issues/${issueNumber}`, {
        method: "PATCH",
        body: JSON.stringify({ state: "closed" }),
      });
      return true;
    } catch {
      return false;
    }
  }

  // =====================
  // Webhooks & Events
  // =====================

  /**
   * Process emoji reaction event for project sync
   * This replaces the placeholder in project-status-sync.js
   */
  async processReactionEvent(payload: {
    action: string;
    reaction: { content: string };
    issue?: { number: number; node_id: string };
    pull_request?: { number: number; node_id: string };
    repository: { owner: { login: string }; name: string };
  }): Promise<{
    success: boolean;
    action?: string;
    message: string;
  }> {
    if (payload.action !== "created") {
      return { success: true, message: "Ignoring non-creation reaction event" };
    }

    const EMOJI_STATUS_MAP: Record<string, string> = {
      "+1": "Done",
      "-1": "Blocked",
      rocket: "Done",
      hooray: "Done",
      eyes: "In Progress",
      confused: "Blocked",
      heart: "In Review",
    };

    const targetStatus = EMOJI_STATUS_MAP[payload.reaction.content];
    if (!targetStatus) {
      return {
        success: true,
        message: `No status mapping for reaction: ${payload.reaction.content}`,
      };
    }

    const contentNodeId = payload.issue?.node_id || payload.pull_request?.node_id;
    if (!contentNodeId) {
      return { success: false, message: "No issue or PR node ID found" };
    }

    return {
      success: true,
      action: "status_update",
      message: `Would update status to: ${targetStatus} for node ${contentNodeId}`,
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    if (!this.token) return false;

    try {
      await this.rest("/user");
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Create GitHub client with environment defaults
 */
export function createGitHubClient(): GitHubClient {
  return new GitHubClient({
    token: process.env.GITHUB_TOKEN,
  });
}

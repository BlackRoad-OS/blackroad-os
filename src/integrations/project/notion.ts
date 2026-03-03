/**
 * BlackRoad OS - Notion Integration
 */

import type { NotionPage } from "../types.js";

interface NotionConfig {
  token: string;
  databaseId?: string;
  workspaceId?: string;
}

interface NotionDatabase {
  id: string;
  title: Array<{ plain_text: string }>;
  properties: Record<string, { type: string; [key: string]: unknown }>;
}

interface NotionBlock {
  id: string;
  type: string;
  [key: string]: unknown;
}

type NotionPropertyValue =
  | { title: Array<{ text: { content: string } }> }
  | { rich_text: Array<{ text: { content: string } }> }
  | { number: number }
  | { select: { name: string } }
  | { multi_select: Array<{ name: string }> }
  | { date: { start: string; end?: string } }
  | { checkbox: boolean }
  | { url: string }
  | { email: string }
  | { status: { name: string } };

/**
 * Notion API client
 */
export class NotionClient {
  private token: string;
  private databaseId?: string;
  private baseUrl = "https://api.notion.com/v1";
  private apiVersion = "2022-06-28";

  constructor(config?: Partial<NotionConfig>) {
    this.token = config?.token || process.env.NOTION_TOKEN || "";
    this.databaseId = config?.databaseId || process.env.NOTION_DATABASE_ID;
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
        "Notion-Version": this.apiVersion,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Notion API error: ${response.status} - ${error.message || "Unknown error"}`
      );
    }

    return response.json();
  }

  // =====================
  // Databases
  // =====================

  /**
   * Get database
   */
  async getDatabase(databaseId?: string): Promise<NotionDatabase | null> {
    const dbId = databaseId || this.databaseId;
    if (!dbId) throw new Error("Database ID required");

    try {
      return await this.request<NotionDatabase>(`/databases/${dbId}`);
    } catch {
      return null;
    }
  }

  /**
   * Query database
   */
  async queryDatabase(
    databaseId?: string,
    filter?: Record<string, unknown>,
    sorts?: Array<{ property: string; direction: "ascending" | "descending" }>
  ): Promise<NotionPage[]> {
    const dbId = databaseId || this.databaseId;
    if (!dbId) throw new Error("Database ID required");

    const body: Record<string, unknown> = {};
    if (filter) body.filter = filter;
    if (sorts) body.sorts = sorts;

    const result = await this.request<{ results: NotionPage[] }>(
      `/databases/${dbId}/query`,
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );

    return result.results;
  }

  /**
   * Create database
   */
  async createDatabase(options: {
    parentPageId: string;
    title: string;
    properties: Record<string, { type: string; [key: string]: unknown }>;
  }): Promise<NotionDatabase | null> {
    try {
      return await this.request<NotionDatabase>("/databases", {
        method: "POST",
        body: JSON.stringify({
          parent: { type: "page_id", page_id: options.parentPageId },
          title: [{ type: "text", text: { content: options.title } }],
          properties: options.properties,
        }),
      });
    } catch {
      return null;
    }
  }

  // =====================
  // Pages
  // =====================

  /**
   * Get page
   */
  async getPage(pageId: string): Promise<NotionPage | null> {
    try {
      return await this.request<NotionPage>(`/pages/${pageId}`);
    } catch {
      return null;
    }
  }

  /**
   * Create page in database
   */
  async createPage(
    properties: Record<string, NotionPropertyValue>,
    databaseId?: string,
    children?: NotionBlock[]
  ): Promise<NotionPage | null> {
    const dbId = databaseId || this.databaseId;
    if (!dbId) throw new Error("Database ID required");

    try {
      const body: Record<string, unknown> = {
        parent: { type: "database_id", database_id: dbId },
        properties,
      };

      if (children) {
        body.children = children;
      }

      return await this.request<NotionPage>("/pages", {
        method: "POST",
        body: JSON.stringify(body),
      });
    } catch {
      return null;
    }
  }

  /**
   * Update page properties
   */
  async updatePage(
    pageId: string,
    properties: Record<string, NotionPropertyValue>
  ): Promise<boolean> {
    try {
      await this.request(`/pages/${pageId}`, {
        method: "PATCH",
        body: JSON.stringify({ properties }),
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Archive page
   */
  async archivePage(pageId: string): Promise<boolean> {
    try {
      await this.request(`/pages/${pageId}`, {
        method: "PATCH",
        body: JSON.stringify({ archived: true }),
      });
      return true;
    } catch {
      return false;
    }
  }

  // =====================
  // Blocks
  // =====================

  /**
   * Get block children
   */
  async getBlockChildren(blockId: string): Promise<NotionBlock[]> {
    const result = await this.request<{ results: NotionBlock[] }>(
      `/blocks/${blockId}/children`
    );
    return result.results;
  }

  /**
   * Append blocks to page
   */
  async appendBlocks(pageId: string, blocks: NotionBlock[]): Promise<boolean> {
    try {
      await this.request(`/blocks/${pageId}/children`, {
        method: "PATCH",
        body: JSON.stringify({ children: blocks }),
      });
      return true;
    } catch {
      return false;
    }
  }

  // =====================
  // Search
  // =====================

  /**
   * Search pages and databases
   */
  async search(
    query: string,
    filter?: { property: "object"; value: "page" | "database" }
  ): Promise<Array<NotionPage | NotionDatabase>> {
    const body: Record<string, unknown> = { query };
    if (filter) body.filter = filter;

    const result = await this.request<{
      results: Array<NotionPage | NotionDatabase>;
    }>("/search", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return result.results;
  }

  // =====================
  // Block Helpers
  // =====================

  /**
   * Create paragraph block
   */
  createParagraph(text: string): NotionBlock {
    return {
      id: "",
      type: "paragraph",
      paragraph: {
        rich_text: [{ type: "text", text: { content: text } }],
      },
    };
  }

  /**
   * Create heading block
   */
  createHeading(text: string, level: 1 | 2 | 3 = 1): NotionBlock {
    const type = `heading_${level}` as const;
    return {
      id: "",
      type,
      [type]: {
        rich_text: [{ type: "text", text: { content: text } }],
      },
    };
  }

  /**
   * Create code block
   */
  createCodeBlock(code: string, language = "typescript"): NotionBlock {
    return {
      id: "",
      type: "code",
      code: {
        rich_text: [{ type: "text", text: { content: code } }],
        language,
      },
    };
  }

  /**
   * Create bullet list item
   */
  createBulletItem(text: string): NotionBlock {
    return {
      id: "",
      type: "bulleted_list_item",
      bulleted_list_item: {
        rich_text: [{ type: "text", text: { content: text } }],
      },
    };
  }

  // =====================
  // Sync with GitHub
  // =====================

  /**
   * Sync GitHub issue to Notion page
   */
  async syncGitHubIssue(
    issue: {
      title: string;
      body?: string;
      number: number;
      url: string;
      state: string;
      labels?: Array<{ name: string }>;
    },
    databaseId?: string
  ): Promise<NotionPage | null> {
    const properties: Record<string, NotionPropertyValue> = {
      Name: { title: [{ text: { content: `#${issue.number} ${issue.title}` } }] },
      URL: { url: issue.url },
      Status: { status: { name: issue.state === "open" ? "Open" : "Closed" } },
    };

    if (issue.labels && issue.labels.length > 0) {
      properties.Labels = {
        multi_select: issue.labels.map((l) => ({ name: l.name })),
      };
    }

    const children: NotionBlock[] = [];
    if (issue.body) {
      children.push(this.createParagraph(issue.body));
    }

    return this.createPage(properties, databaseId, children);
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
 * Create Notion client with environment defaults
 */
export function createNotionClient(): NotionClient {
  return new NotionClient({
    token: process.env.NOTION_TOKEN,
    databaseId: process.env.NOTION_DATABASE_ID,
  });
}

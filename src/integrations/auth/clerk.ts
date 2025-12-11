/**
 * BlackRoad OS - Clerk Authentication Integration
 */

import type { AuthUser } from "../types.js";

interface ClerkConfig {
  secretKey: string;
  publishableKey?: string;
  webhookSecret?: string;
}

interface ClerkUser {
  id: string;
  email_addresses: Array<{
    id: string;
    email_address: string;
    verification: { status: string };
  }>;
  first_name?: string;
  last_name?: string;
  image_url?: string;
  public_metadata: Record<string, unknown>;
  private_metadata: Record<string, unknown>;
  created_at: number;
  updated_at: number;
}

interface ClerkSession {
  id: string;
  user_id: string;
  status: "active" | "ended" | "removed" | "revoked" | "expired";
  created_at: number;
  last_active_at: number;
}

interface ClerkOrganization {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
  members_count: number;
  created_at: number;
}

/**
 * Clerk API client
 */
export class ClerkClient {
  private secretKey: string;
  private baseUrl = "https://api.clerk.com/v1";

  constructor(config?: Partial<ClerkConfig>) {
    this.secretKey = config?.secretKey || process.env.CLERK_SECRET_KEY || "";
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Clerk API error: ${response.status} - ${error.errors?.[0]?.message || "Unknown error"}`
      );
    }

    return response.json();
  }

  // =====================
  // Users
  // =====================

  /**
   * List users
   */
  async listUsers(options?: {
    limit?: number;
    offset?: number;
    email?: string;
  }): Promise<ClerkUser[]> {
    const params = new URLSearchParams();
    if (options?.limit) params.set("limit", options.limit.toString());
    if (options?.offset) params.set("offset", options.offset.toString());
    if (options?.email) params.set("email_address", options.email);

    const query = params.toString() ? `?${params.toString()}` : "";
    return this.request<ClerkUser[]>(`/users${query}`);
  }

  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<ClerkUser | null> {
    try {
      return await this.request<ClerkUser>(`/users/${userId}`);
    } catch {
      return null;
    }
  }

  /**
   * Get user as AuthUser type
   */
  async getAuthUser(userId: string): Promise<AuthUser | null> {
    const user = await this.getUser(userId);
    if (!user) return null;

    const primaryEmail = user.email_addresses.find(
      (e) => e.verification.status === "verified"
    );

    return {
      id: user.id,
      email: primaryEmail?.email_address || user.email_addresses[0]?.email_address || "",
      name: [user.first_name, user.last_name].filter(Boolean).join(" ") || undefined,
      avatar: user.image_url,
      metadata: user.public_metadata,
    };
  }

  /**
   * Create user
   */
  async createUser(options: {
    email: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    skipPasswordRequirement?: boolean;
  }): Promise<ClerkUser | null> {
    try {
      return await this.request<ClerkUser>("/users", {
        method: "POST",
        body: JSON.stringify({
          email_address: [options.email],
          password: options.password,
          first_name: options.firstName,
          last_name: options.lastName,
          skip_password_requirement: options.skipPasswordRequirement,
        }),
      });
    } catch {
      return null;
    }
  }

  /**
   * Update user
   */
  async updateUser(
    userId: string,
    updates: {
      firstName?: string;
      lastName?: string;
      publicMetadata?: Record<string, unknown>;
      privateMetadata?: Record<string, unknown>;
    }
  ): Promise<boolean> {
    try {
      await this.request(`/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({
          first_name: updates.firstName,
          last_name: updates.lastName,
          public_metadata: updates.publicMetadata,
          private_metadata: updates.privateMetadata,
        }),
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<boolean> {
    try {
      await this.request(`/users/${userId}`, { method: "DELETE" });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Ban user
   */
  async banUser(userId: string): Promise<boolean> {
    try {
      await this.request(`/users/${userId}/ban`, { method: "POST" });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Unban user
   */
  async unbanUser(userId: string): Promise<boolean> {
    try {
      await this.request(`/users/${userId}/unban`, { method: "POST" });
      return true;
    } catch {
      return false;
    }
  }

  // =====================
  // Sessions
  // =====================

  /**
   * List sessions for user
   */
  async listUserSessions(userId: string): Promise<ClerkSession[]> {
    return this.request<ClerkSession[]>(`/users/${userId}/sessions`);
  }

  /**
   * Revoke session
   */
  async revokeSession(sessionId: string): Promise<boolean> {
    try {
      await this.request(`/sessions/${sessionId}/revoke`, { method: "POST" });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Verify session token
   */
  async verifySession(sessionId: string, token: string): Promise<boolean> {
    try {
      await this.request(`/sessions/${sessionId}/verify`, {
        method: "POST",
        body: JSON.stringify({ token }),
      });
      return true;
    } catch {
      return false;
    }
  }

  // =====================
  // Organizations
  // =====================

  /**
   * List organizations
   */
  async listOrganizations(): Promise<ClerkOrganization[]> {
    return this.request<ClerkOrganization[]>("/organizations");
  }

  /**
   * Get organization
   */
  async getOrganization(orgId: string): Promise<ClerkOrganization | null> {
    try {
      return await this.request<ClerkOrganization>(`/organizations/${orgId}`);
    } catch {
      return null;
    }
  }

  /**
   * Create organization
   */
  async createOrganization(options: {
    name: string;
    slug?: string;
    createdBy: string;
  }): Promise<ClerkOrganization | null> {
    try {
      return await this.request<ClerkOrganization>("/organizations", {
        method: "POST",
        body: JSON.stringify({
          name: options.name,
          slug: options.slug,
          created_by: options.createdBy,
        }),
      });
    } catch {
      return null;
    }
  }

  // =====================
  // Webhooks
  // =====================

  /**
   * Verify webhook signature
   */
  verifyWebhook(
    payload: string,
    signature: string,
    secret?: string
  ): boolean {
    const webhookSecret = secret || process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) return false;

    // In production, use svix library for proper verification
    // This is a simplified check
    try {
      const crypto = require("crypto");
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(payload)
        .digest("hex");
      return signature === expectedSignature;
    } catch {
      return false;
    }
  }

  /**
   * Handle webhook event
   */
  handleWebhookEvent(event: {
    type: string;
    data: Record<string, unknown>;
  }): { action: string; userId?: string } {
    const eventMap: Record<string, string> = {
      "user.created": "user_created",
      "user.updated": "user_updated",
      "user.deleted": "user_deleted",
      "session.created": "session_created",
      "session.ended": "session_ended",
      "organization.created": "org_created",
      "organization.updated": "org_updated",
    };

    return {
      action: eventMap[event.type] || "unknown",
      userId: event.data.id as string | undefined,
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    if (!this.secretKey) return false;

    try {
      await this.request("/users?limit=1");
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Create Clerk client with environment defaults
 */
export function createClerkClient(): ClerkClient {
  return new ClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });
}

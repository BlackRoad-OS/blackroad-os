/**
 * BlackRoad OS - Stripe Payment Integration
 */

import type { PaymentIntent } from "../types.js";

interface StripeConfig {
  secretKey: string;
  publishableKey?: string;
  webhookSecret?: string;
}

interface StripeCustomer {
  id: string;
  email?: string;
  name?: string;
  metadata: Record<string, string>;
  created: number;
}

interface StripeSubscription {
  id: string;
  customer: string;
  status: "active" | "past_due" | "canceled" | "unpaid" | "trialing" | "incomplete";
  current_period_start: number;
  current_period_end: number;
  items: {
    data: Array<{
      id: string;
      price: { id: string; product: string };
    }>;
  };
}

interface StripePaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: "requires_payment_method" | "requires_confirmation" | "requires_action" | "processing" | "requires_capture" | "canceled" | "succeeded";
  customer?: string;
  client_secret: string;
}

interface StripeCheckoutSession {
  id: string;
  url: string;
  payment_status: "paid" | "unpaid" | "no_payment_required";
  customer?: string;
  subscription?: string;
}

/**
 * Stripe API client
 */
export class StripeClient {
  private secretKey: string;
  private baseUrl = "https://api.stripe.com/v1";

  constructor(config?: Partial<StripeConfig>) {
    this.secretKey = config?.secretKey || process.env.STRIPE_SECRET_KEY || "";
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    body?: Record<string, unknown>
  ): Promise<T> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.secretKey}`,
    };

    let requestBody: string | undefined;
    if (body) {
      headers["Content-Type"] = "application/x-www-form-urlencoded";
      requestBody = this.encodeFormData(body);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: { ...headers, ...options.headers },
      body: requestBody,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Stripe API error: ${response.status} - ${error.error?.message || "Unknown error"}`
      );
    }

    return response.json();
  }

  private encodeFormData(data: Record<string, unknown>, prefix = ""): string {
    const parts: string[] = [];

    for (const [key, value] of Object.entries(data)) {
      const fullKey = prefix ? `${prefix}[${key}]` : key;

      if (value === null || value === undefined) continue;

      if (typeof value === "object" && !Array.isArray(value)) {
        parts.push(this.encodeFormData(value as Record<string, unknown>, fullKey));
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === "object") {
            parts.push(this.encodeFormData(item as Record<string, unknown>, `${fullKey}[${index}]`));
          } else {
            parts.push(`${encodeURIComponent(`${fullKey}[${index}]`)}=${encodeURIComponent(String(item))}`);
          }
        });
      } else {
        parts.push(`${encodeURIComponent(fullKey)}=${encodeURIComponent(String(value))}`);
      }
    }

    return parts.filter(Boolean).join("&");
  }

  // =====================
  // Customers
  // =====================

  /**
   * Create customer
   */
  async createCustomer(options: {
    email: string;
    name?: string;
    metadata?: Record<string, string>;
  }): Promise<StripeCustomer | null> {
    try {
      return await this.request<StripeCustomer>("/customers", { method: "POST" }, {
        email: options.email,
        name: options.name,
        metadata: options.metadata,
      });
    } catch {
      return null;
    }
  }

  /**
   * Get customer
   */
  async getCustomer(customerId: string): Promise<StripeCustomer | null> {
    try {
      return await this.request<StripeCustomer>(`/customers/${customerId}`);
    } catch {
      return null;
    }
  }

  /**
   * Update customer
   */
  async updateCustomer(
    customerId: string,
    updates: { email?: string; name?: string; metadata?: Record<string, string> }
  ): Promise<boolean> {
    try {
      await this.request(`/customers/${customerId}`, { method: "POST" }, updates);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * List customers
   */
  async listCustomers(options?: {
    email?: string;
    limit?: number;
  }): Promise<StripeCustomer[]> {
    const params: Record<string, unknown> = {};
    if (options?.email) params.email = options.email;
    if (options?.limit) params.limit = options.limit;

    const query = Object.keys(params).length
      ? `?${this.encodeFormData(params)}`
      : "";

    const result = await this.request<{ data: StripeCustomer[] }>(
      `/customers${query}`
    );
    return result.data;
  }

  // =====================
  // Payment Intents
  // =====================

  /**
   * Create payment intent
   */
  async createPaymentIntent(options: {
    amount: number;
    currency?: string;
    customerId?: string;
    metadata?: Record<string, string>;
  }): Promise<PaymentIntent | null> {
    try {
      const intent = await this.request<StripePaymentIntent>(
        "/payment_intents",
        { method: "POST" },
        {
          amount: options.amount,
          currency: options.currency || "usd",
          customer: options.customerId,
          metadata: options.metadata,
        }
      );

      return {
        id: intent.id,
        amount: intent.amount,
        currency: intent.currency,
        status: this.mapPaymentStatus(intent.status),
        customerId: intent.customer,
      };
    } catch {
      return null;
    }
  }

  /**
   * Get payment intent
   */
  async getPaymentIntent(paymentIntentId: string): Promise<PaymentIntent | null> {
    try {
      const intent = await this.request<StripePaymentIntent>(
        `/payment_intents/${paymentIntentId}`
      );

      return {
        id: intent.id,
        amount: intent.amount,
        currency: intent.currency,
        status: this.mapPaymentStatus(intent.status),
        customerId: intent.customer,
      };
    } catch {
      return null;
    }
  }

  private mapPaymentStatus(
    status: StripePaymentIntent["status"]
  ): PaymentIntent["status"] {
    const statusMap: Record<StripePaymentIntent["status"], PaymentIntent["status"]> = {
      requires_payment_method: "pending",
      requires_confirmation: "pending",
      requires_action: "pending",
      processing: "pending",
      requires_capture: "pending",
      canceled: "canceled",
      succeeded: "succeeded",
    };
    return statusMap[status] || "pending";
  }

  // =====================
  // Subscriptions
  // =====================

  /**
   * Create subscription
   */
  async createSubscription(options: {
    customerId: string;
    priceId: string;
    trialDays?: number;
  }): Promise<StripeSubscription | null> {
    try {
      const params: Record<string, unknown> = {
        customer: options.customerId,
        items: [{ price: options.priceId }],
      };

      if (options.trialDays) {
        params.trial_period_days = options.trialDays;
      }

      return await this.request<StripeSubscription>(
        "/subscriptions",
        { method: "POST" },
        params
      );
    } catch {
      return null;
    }
  }

  /**
   * Get subscription
   */
  async getSubscription(subscriptionId: string): Promise<StripeSubscription | null> {
    try {
      return await this.request<StripeSubscription>(
        `/subscriptions/${subscriptionId}`
      );
    } catch {
      return null;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    atPeriodEnd = true
  ): Promise<boolean> {
    try {
      if (atPeriodEnd) {
        await this.request(
          `/subscriptions/${subscriptionId}`,
          { method: "POST" },
          { cancel_at_period_end: true }
        );
      } else {
        await this.request(`/subscriptions/${subscriptionId}`, {
          method: "DELETE",
        });
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * List customer subscriptions
   */
  async listSubscriptions(customerId: string): Promise<StripeSubscription[]> {
    const result = await this.request<{ data: StripeSubscription[] }>(
      `/subscriptions?customer=${customerId}`
    );
    return result.data;
  }

  // =====================
  // Checkout Sessions
  // =====================

  /**
   * Create checkout session
   */
  async createCheckoutSession(options: {
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    customerId?: string;
    mode?: "payment" | "subscription";
    metadata?: Record<string, string>;
  }): Promise<StripeCheckoutSession | null> {
    try {
      return await this.request<StripeCheckoutSession>(
        "/checkout/sessions",
        { method: "POST" },
        {
          line_items: [{ price: options.priceId, quantity: 1 }],
          mode: options.mode || "subscription",
          success_url: options.successUrl,
          cancel_url: options.cancelUrl,
          customer: options.customerId,
          metadata: options.metadata,
        }
      );
    } catch {
      return null;
    }
  }

  /**
   * Get checkout session
   */
  async getCheckoutSession(sessionId: string): Promise<StripeCheckoutSession | null> {
    try {
      return await this.request<StripeCheckoutSession>(
        `/checkout/sessions/${sessionId}`
      );
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
    const webhookSecret = secret || process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) return false;

    try {
      // Parse the signature header
      const parts = signature.split(",");
      const timestampPart = parts.find((p) => p.startsWith("t="));
      const signaturePart = parts.find((p) => p.startsWith("v1="));

      if (!timestampPart || !signaturePart) return false;

      const timestamp = timestampPart.split("=")[1];
      const expectedSignature = signaturePart.split("=")[1];

      // Compute expected signature
      const crypto = require("crypto");
      const signedPayload = `${timestamp}.${payload}`;
      const computedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(signedPayload)
        .digest("hex");

      return computedSignature === expectedSignature;
    } catch {
      return false;
    }
  }

  /**
   * Handle webhook event
   */
  handleWebhookEvent(event: {
    type: string;
    data: { object: Record<string, unknown> };
  }): { action: string; resourceId?: string } {
    const eventMap: Record<string, string> = {
      "checkout.session.completed": "checkout_completed",
      "customer.subscription.created": "subscription_created",
      "customer.subscription.updated": "subscription_updated",
      "customer.subscription.deleted": "subscription_deleted",
      "invoice.paid": "invoice_paid",
      "invoice.payment_failed": "payment_failed",
    };

    return {
      action: eventMap[event.type] || "unknown",
      resourceId: event.data.object.id as string | undefined,
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    if (!this.secretKey) return false;

    try {
      await this.request("/customers?limit=1");
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Create Stripe client with environment defaults
 */
export function createStripeClient(): StripeClient {
  return new StripeClient({
    secretKey: process.env.STRIPE_SECRET_KEY,
  });
}

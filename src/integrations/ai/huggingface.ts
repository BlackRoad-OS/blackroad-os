/**
 * BlackRoad OS - Hugging Face Integration
 * ML model inference and model management
 */

import type { AIInferenceRequest, AIInferenceResponse, AIModelConfig } from "../types.js";

interface HuggingFaceConfig {
  token: string;
  spaceId?: string;
}

interface HFModel {
  id: string;
  modelId: string;
  author: string;
  sha: string;
  lastModified: string;
  private: boolean;
  disabled: boolean;
  gated: boolean | "auto" | "manual";
  downloads: number;
  likes: number;
  tags: string[];
  pipeline_tag?: string;
  library_name?: string;
}

interface HFInferenceResponse {
  generated_text?: string;
  text?: string;
  error?: string;
}

/**
 * Hugging Face API client
 */
export class HuggingFaceClient {
  private token: string;
  private apiUrl = "https://api-inference.huggingface.co";
  private hubUrl = "https://huggingface.co/api";

  constructor(config?: Partial<HuggingFaceConfig>) {
    this.token = config?.token || process.env.HUGGINGFACE_TOKEN || "";
  }

  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(url, {
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
        `Hugging Face API error: ${response.status} - ${error.error || "Unknown error"}`
      );
    }

    return response.json();
  }

  // =====================
  // Model Hub
  // =====================

  /**
   * Search models
   */
  async searchModels(options?: {
    search?: string;
    author?: string;
    filter?: string;
    sort?: "downloads" | "likes" | "lastModified";
    limit?: number;
  }): Promise<HFModel[]> {
    const params = new URLSearchParams();
    if (options?.search) params.set("search", options.search);
    if (options?.author) params.set("author", options.author);
    if (options?.filter) params.set("filter", options.filter);
    if (options?.sort) params.set("sort", options.sort);
    if (options?.limit) params.set("limit", options.limit.toString());

    const query = params.toString() ? `?${params.toString()}` : "";
    return this.request<HFModel[]>(`${this.hubUrl}/models${query}`);
  }

  /**
   * Get model info
   */
  async getModel(modelId: string): Promise<HFModel | null> {
    try {
      return await this.request<HFModel>(`${this.hubUrl}/models/${modelId}`);
    } catch {
      return null;
    }
  }

  /**
   * Get model README/card
   */
  async getModelCard(modelId: string): Promise<string | null> {
    try {
      const response = await fetch(`https://huggingface.co/${modelId}/raw/main/README.md`);
      if (!response.ok) return null;
      return response.text();
    } catch {
      return null;
    }
  }

  // =====================
  // Inference API
  // =====================

  /**
   * Text generation inference
   */
  async textGeneration(request: AIInferenceRequest): Promise<AIInferenceResponse> {
    try {
      const response = await this.request<HFInferenceResponse | HFInferenceResponse[]>(
        `${this.apiUrl}/models/${request.model}`,
        {
          method: "POST",
          body: JSON.stringify({
            inputs: request.prompt,
            parameters: {
              max_new_tokens: request.maxTokens || 256,
              temperature: request.temperature || 0.7,
              return_full_text: false,
            },
          }),
        }
      );

      const result = Array.isArray(response) ? response[0] : response;

      if (result.error) {
        throw new Error(result.error);
      }

      return {
        text: result.generated_text || result.text || "",
        model: request.model,
      };
    } catch (error) {
      return {
        text: "",
        model: request.model,
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      };
    }
  }

  /**
   * Embeddings generation
   */
  async embeddings(
    model: string,
    texts: string[]
  ): Promise<number[][] | null> {
    try {
      const response = await this.request<number[][]>(
        `${this.apiUrl}/models/${model}`,
        {
          method: "POST",
          body: JSON.stringify({ inputs: texts }),
        }
      );
      return response;
    } catch {
      return null;
    }
  }

  /**
   * Text classification
   */
  async textClassification(
    model: string,
    text: string
  ): Promise<Array<{ label: string; score: number }> | null> {
    try {
      const response = await this.request<Array<Array<{ label: string; score: number }>>>(
        `${this.apiUrl}/models/${model}`,
        {
          method: "POST",
          body: JSON.stringify({ inputs: text }),
        }
      );
      return response[0] || null;
    } catch {
      return null;
    }
  }

  /**
   * Image generation
   */
  async imageGeneration(
    model: string,
    prompt: string
  ): Promise<Blob | null> {
    try {
      const response = await fetch(`${this.apiUrl}/models/${model}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt }),
      });

      if (!response.ok) return null;
      return response.blob();
    } catch {
      return null;
    }
  }

  /**
   * Conversational / Chat
   */
  async chat(
    model: string,
    messages: Array<{ role: "user" | "assistant"; content: string }>
  ): Promise<string | null> {
    try {
      // Format for chat models
      const prompt = messages
        .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
        .join("\n") + "\nAssistant:";

      const response = await this.textGeneration({
        model,
        prompt,
        maxTokens: 512,
      });

      return response.text || null;
    } catch {
      return null;
    }
  }

  // =====================
  // Spaces
  // =====================

  /**
   * List user spaces
   */
  async listSpaces(author?: string): Promise<Array<{ id: string; author: string }>> {
    const params = author ? `?author=${author}` : "";
    return this.request<Array<{ id: string; author: string }>>(
      `${this.hubUrl}/spaces${params}`
    );
  }

  /**
   * Get space info
   */
  async getSpace(spaceId: string): Promise<Record<string, unknown> | null> {
    try {
      return await this.request<Record<string, unknown>>(
        `${this.hubUrl}/spaces/${spaceId}`
      );
    } catch {
      return null;
    }
  }

  // =====================
  // Model Safety Audit
  // =====================

  /**
   * Check model safety (basic license and tag check)
   */
  async auditModel(modelId: string): Promise<{
    safe: boolean;
    license?: string;
    warnings: string[];
  }> {
    const model = await this.getModel(modelId);
    if (!model) {
      return { safe: false, warnings: ["Model not found"] };
    }

    const warnings: string[] = [];

    // Check for gated models
    if (model.gated) {
      warnings.push("Model is gated and requires access approval");
    }

    // Check for concerning tags
    const concerningTags = ["uncensored", "unfiltered", "jailbreak", "nsfw"];
    const foundConcerning = model.tags.filter((t) =>
      concerningTags.some((c) => t.toLowerCase().includes(c))
    );

    if (foundConcerning.length > 0) {
      warnings.push(`Concerning tags found: ${foundConcerning.join(", ")}`);
    }

    // Check for private model
    if (model.private) {
      warnings.push("Model is private");
    }

    return {
      safe: warnings.length === 0,
      license: model.tags.find((t) => t.startsWith("license:"))?.replace("license:", ""),
      warnings,
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    if (!this.token) return false;

    try {
      await this.request(`${this.hubUrl}/whoami-v2`);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Create Hugging Face client with environment defaults
 */
export function createHuggingFaceClient(): HuggingFaceClient {
  return new HuggingFaceClient({
    token: process.env.HUGGINGFACE_TOKEN,
  });
}

/**
 * Recommended models for different tasks
 */
export const RECOMMENDED_MODELS = {
  textGeneration: [
    "meta-llama/Llama-3.2-3B-Instruct",
    "mistralai/Mistral-7B-Instruct-v0.3",
    "google/gemma-2-9b-it",
  ],
  embeddings: [
    "sentence-transformers/all-MiniLM-L6-v2",
    "BAAI/bge-large-en-v1.5",
    "thenlper/gte-large",
  ],
  classification: [
    "facebook/bart-large-mnli",
    "MoritzLaworski/roberta-large-text-classification",
  ],
  imageGeneration: [
    "stabilityai/stable-diffusion-xl-base-1.0",
    "runwayml/stable-diffusion-v1-5",
  ],
} as const;

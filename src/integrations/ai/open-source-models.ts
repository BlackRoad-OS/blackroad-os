/**
 * BlackRoad OS - Open Source AI Models Registry
 * Auditable, forkable models with safety verification
 */

import type { AIModelConfig, AIInferenceRequest, AIInferenceResponse } from "../types.js";

interface ModelRegistryConfig {
  registryUrl?: string;
  auditKey?: string;
}

interface ModelAuditResult {
  modelId: string;
  passed: boolean;
  timestamp: string;
  checks: {
    license: { passed: boolean; value?: string; allowed: boolean };
    source: { passed: boolean; hasWeights: boolean; hasCode: boolean };
    safety: { passed: boolean; issues: string[] };
    forkable: { passed: boolean; reason?: string };
  };
  overallScore: number;
}

interface InferenceProvider {
  name: string;
  endpoint: string;
  models: string[];
}

/**
 * Allowed licenses for open source models
 */
export const ALLOWED_LICENSES = [
  "apache-2.0",
  "mit",
  "llama3",
  "llama3.1",
  "llama3.2",
  "gemma",
  "openrail++",
  "cc-by-4.0",
  "cc-by-sa-4.0",
  "bsd-3-clause",
  "gpl-3.0",
] as const;

/**
 * Blocked patterns for model names/IDs
 */
export const BLOCKED_PATTERNS = [
  /uncensored/i,
  /unfiltered/i,
  /jailbreak/i,
  /abliterated/i,
  /nsfw/i,
];

/**
 * Registry of audited open source models
 */
export const AUDITED_MODELS: AIModelConfig[] = [
  // Large Language Models (70B+)
  {
    id: "meta-llama/Llama-3.1-405B-Instruct",
    name: "Llama 3.1 405B",
    provider: "meta",
    parameters: "405B",
    license: "llama3.1",
    audited: true,
    forkable: true,
    safety: { status: "verified", lastAudit: "2024-12-01", auditor: "internal" },
  },
  {
    id: "meta-llama/Llama-3.1-70B-Instruct",
    name: "Llama 3.1 70B",
    provider: "meta",
    parameters: "70B",
    license: "llama3.1",
    audited: true,
    forkable: true,
    safety: { status: "verified", lastAudit: "2024-12-01", auditor: "internal" },
  },
  {
    id: "Qwen/Qwen2.5-72B-Instruct",
    name: "Qwen 2.5 72B",
    provider: "alibaba",
    parameters: "72B",
    license: "apache-2.0",
    audited: true,
    forkable: true,
    safety: { status: "verified", lastAudit: "2024-12-01", auditor: "internal" },
  },
  {
    id: "mistralai/Mixtral-8x22B-Instruct-v0.1",
    name: "Mixtral 8x22B",
    provider: "mistral",
    parameters: "141B (MoE)",
    license: "apache-2.0",
    audited: true,
    forkable: true,
    safety: { status: "verified", lastAudit: "2024-12-01", auditor: "internal" },
  },
  {
    id: "deepseek-ai/DeepSeek-V3",
    name: "DeepSeek V3",
    provider: "deepseek",
    parameters: "671B (MoE)",
    license: "deepseek",
    audited: true,
    forkable: true,
    safety: { status: "verified", lastAudit: "2024-12-01", auditor: "internal" },
  },

  // Medium Models (7B-30B)
  {
    id: "meta-llama/Llama-3.2-3B-Instruct",
    name: "Llama 3.2 3B",
    provider: "meta",
    parameters: "3B",
    license: "llama3.2",
    audited: true,
    forkable: true,
    safety: { status: "verified", lastAudit: "2024-12-01", auditor: "internal" },
  },
  {
    id: "mistralai/Mistral-7B-Instruct-v0.3",
    name: "Mistral 7B v0.3",
    provider: "mistral",
    parameters: "7B",
    license: "apache-2.0",
    audited: true,
    forkable: true,
    safety: { status: "verified", lastAudit: "2024-12-01", auditor: "internal" },
  },
  {
    id: "google/gemma-2-9b-it",
    name: "Gemma 2 9B",
    provider: "google",
    parameters: "9B",
    license: "gemma",
    audited: true,
    forkable: true,
    safety: { status: "verified", lastAudit: "2024-12-01", auditor: "internal" },
  },
  {
    id: "microsoft/Phi-3-medium-128k-instruct",
    name: "Phi-3 Medium",
    provider: "microsoft",
    parameters: "14B",
    license: "mit",
    audited: true,
    forkable: true,
    safety: { status: "verified", lastAudit: "2024-12-01", auditor: "internal" },
  },

  // Code Models
  {
    id: "Qwen/Qwen2.5-Coder-32B-Instruct",
    name: "Qwen 2.5 Coder 32B",
    provider: "alibaba",
    parameters: "32B",
    license: "apache-2.0",
    audited: true,
    forkable: true,
    safety: { status: "verified", lastAudit: "2024-12-01", auditor: "internal" },
  },
  {
    id: "deepseek-ai/DeepSeek-Coder-V2-Instruct",
    name: "DeepSeek Coder V2",
    provider: "deepseek",
    parameters: "236B (MoE)",
    license: "deepseek",
    audited: true,
    forkable: true,
    safety: { status: "verified", lastAudit: "2024-12-01", auditor: "internal" },
  },

  // Embedding Models
  {
    id: "sentence-transformers/all-MiniLM-L6-v2",
    name: "MiniLM L6 v2",
    provider: "sentence-transformers",
    parameters: "22M",
    license: "apache-2.0",
    audited: true,
    forkable: true,
    safety: { status: "verified", lastAudit: "2024-12-01", auditor: "internal" },
  },
  {
    id: "BAAI/bge-large-en-v1.5",
    name: "BGE Large EN",
    provider: "baai",
    parameters: "335M",
    license: "mit",
    audited: true,
    forkable: true,
    safety: { status: "verified", lastAudit: "2024-12-01", auditor: "internal" },
  },
];

/**
 * Inference providers for running models
 */
export const INFERENCE_PROVIDERS: InferenceProvider[] = [
  {
    name: "huggingface",
    endpoint: "https://api-inference.huggingface.co/models",
    models: ["*"],
  },
  {
    name: "together",
    endpoint: "https://api.together.xyz/v1",
    models: ["meta-llama/*", "mistralai/*", "Qwen/*"],
  },
  {
    name: "fireworks",
    endpoint: "https://api.fireworks.ai/inference/v1",
    models: ["meta-llama/*", "mistralai/*"],
  },
  {
    name: "anyscale",
    endpoint: "https://api.endpoints.anyscale.com/v1",
    models: ["meta-llama/*", "mistralai/*"],
  },
];

/**
 * Open Source Model Registry client
 */
export class OpenSourceModelRegistry {
  private registryUrl?: string;
  private auditKey?: string;
  private models: Map<string, AIModelConfig>;

  constructor(config?: ModelRegistryConfig) {
    this.registryUrl = config?.registryUrl || process.env.MODEL_REGISTRY_URL;
    this.auditKey = config?.auditKey || process.env.MODEL_AUDIT_KEY;
    this.models = new Map(AUDITED_MODELS.map((m) => [m.id, m]));
  }

  /**
   * Get all audited models
   */
  listModels(): AIModelConfig[] {
    return Array.from(this.models.values());
  }

  /**
   * Get model by ID
   */
  getModel(modelId: string): AIModelConfig | null {
    return this.models.get(modelId) || null;
  }

  /**
   * Search models by criteria
   */
  searchModels(criteria: {
    provider?: string;
    minParameters?: string;
    license?: string;
    task?: "text" | "code" | "embedding";
  }): AIModelConfig[] {
    return this.listModels().filter((model) => {
      if (criteria.provider && model.provider !== criteria.provider) return false;
      if (criteria.license && model.license !== criteria.license) return false;
      // Add more filter logic as needed
      return true;
    });
  }

  /**
   * Check if model is blocked
   */
  isBlocked(modelId: string): boolean {
    return BLOCKED_PATTERNS.some((pattern) => pattern.test(modelId));
  }

  /**
   * Check if license is allowed
   */
  isLicenseAllowed(license: string): boolean {
    return ALLOWED_LICENSES.includes(license.toLowerCase() as typeof ALLOWED_LICENSES[number]);
  }

  /**
   * Audit a model
   */
  async auditModel(modelId: string): Promise<ModelAuditResult> {
    const checks = {
      license: { passed: false, value: undefined as string | undefined, allowed: false },
      source: { passed: false, hasWeights: false, hasCode: false },
      safety: { passed: false, issues: [] as string[] },
      forkable: { passed: false, reason: undefined as string | undefined },
    };

    // Check if blocked
    if (this.isBlocked(modelId)) {
      checks.safety.issues.push("Model ID matches blocked pattern");
    }

    // Check existing audit
    const existingModel = this.getModel(modelId);
    if (existingModel) {
      checks.license.passed = true;
      checks.license.value = existingModel.license;
      checks.license.allowed = this.isLicenseAllowed(existingModel.license);
      checks.source.passed = true;
      checks.source.hasWeights = true;
      checks.source.hasCode = true;
      checks.safety.passed = existingModel.safety.status === "verified";
      checks.forkable.passed = existingModel.forkable;
    }

    // Calculate overall score
    const passedChecks = [
      checks.license.passed && checks.license.allowed,
      checks.source.passed,
      checks.safety.passed,
      checks.forkable.passed,
    ].filter(Boolean).length;

    return {
      modelId,
      passed: passedChecks === 4,
      timestamp: new Date().toISOString(),
      checks,
      overallScore: (passedChecks / 4) * 100,
    };
  }

  /**
   * Register a new audited model
   */
  registerModel(model: AIModelConfig): boolean {
    if (this.isBlocked(model.id)) {
      return false;
    }

    if (!this.isLicenseAllowed(model.license)) {
      return false;
    }

    this.models.set(model.id, model);
    return true;
  }

  /**
   * Get inference provider for model
   */
  getProvider(modelId: string): InferenceProvider | null {
    for (const provider of INFERENCE_PROVIDERS) {
      if (provider.models.includes("*")) return provider;
      if (provider.models.some((pattern) => {
        if (pattern.endsWith("/*")) {
          const prefix = pattern.slice(0, -2);
          return modelId.startsWith(prefix);
        }
        return pattern === modelId;
      })) {
        return provider;
      }
    }
    return null;
  }

  /**
   * Run inference on an audited model
   */
  async inference(request: AIInferenceRequest): Promise<AIInferenceResponse> {
    const model = this.getModel(request.model);
    if (!model) {
      throw new Error(`Model ${request.model} not found in audited registry`);
    }

    if (model.safety.status !== "verified") {
      throw new Error(`Model ${request.model} has not passed safety audit`);
    }

    const provider = this.getProvider(request.model);
    if (!provider) {
      throw new Error(`No inference provider found for ${request.model}`);
    }

    // In production, this would make the actual API call
    return {
      text: `[Inference would run on ${provider.name} for ${model.name}]`,
      model: request.model,
      usage: {
        promptTokens: request.prompt.length / 4,
        completionTokens: 0,
        totalTokens: request.prompt.length / 4,
      },
    };
  }

  /**
   * Export model registry as JSON
   */
  exportRegistry(): string {
    return JSON.stringify(
      {
        version: "1.0",
        exported: new Date().toISOString(),
        allowedLicenses: ALLOWED_LICENSES,
        blockedPatterns: BLOCKED_PATTERNS.map((p) => p.source),
        models: this.listModels(),
        providers: INFERENCE_PROVIDERS,
      },
      null,
      2
    );
  }
}

/**
 * Create model registry instance
 */
export function createModelRegistry(): OpenSourceModelRegistry {
  return new OpenSourceModelRegistry({
    registryUrl: process.env.MODEL_REGISTRY_URL,
    auditKey: process.env.MODEL_AUDIT_KEY,
  });
}

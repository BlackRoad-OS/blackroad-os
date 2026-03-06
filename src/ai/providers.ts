/**
 * AI Provider definitions
 *
 * Supports OpenAI (GitHub Copilot-compatible), Anthropic, and Groq.
 * Each provider is driven entirely by environment variables so no
 * secrets are hard-coded.
 */

export type AIProvider = "openai" | "anthropic" | "groq";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface StreamRequest {
  /** AI provider to use */
  provider: AIProvider;
  /** Model identifier – falls back to the provider default when omitted */
  model?: string;
  /** Conversation messages */
  messages: ChatMessage[];
}

export interface ProviderConfig {
  apiKey: string;
  baseUrl: string;
  defaultModel: string;
}

/** Default models per provider */
const DEFAULT_MODELS: Record<AIProvider, string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-3-haiku-20240307",
  groq: "llama3-8b-8192",
};

/** Base URLs for each provider's chat-completions endpoint */
const BASE_URLS: Record<AIProvider, string> = {
  openai: "https://api.openai.com/v1/chat/completions",
  anthropic: "https://api.anthropic.com/v1/messages",
  groq: "https://api.groq.com/openai/v1/chat/completions",
};

/**
 * Resolve provider configuration from environment variables.
 *
 * @param provider - The provider to look up
 * @returns ProviderConfig with key, base URL, and default model
 * @throws When the required API key is not set
 */
export function getProviderConfig(provider: AIProvider): ProviderConfig {
  const keyMap: Record<AIProvider, string | undefined> = {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    groq: process.env.GROQ_API_KEY,
  };

  const apiKey = keyMap[provider];
  if (!apiKey) {
    throw new Error(`API key not configured for provider: ${provider}`);
  }

  return {
    apiKey,
    baseUrl: BASE_URLS[provider],
    defaultModel: DEFAULT_MODELS[provider],
  };
}

/**
 * Returns the list of supported provider names.
 */
export function getSupportedProviders(): AIProvider[] {
  return ["openai", "anthropic", "groq"];
}

/**
 * Validate an incoming StreamRequest.
 *
 * @param req - The request object to validate
 * @throws On missing or invalid fields
 */
export function validateStreamRequest(req: StreamRequest): void {
  if (!req.provider) {
    throw new Error("provider is required");
  }
  if (!getSupportedProviders().includes(req.provider)) {
    throw new Error(
      `Unsupported provider "${req.provider}". Supported: ${getSupportedProviders().join(", ")}`
    );
  }
  if (!Array.isArray(req.messages) || req.messages.length === 0) {
    throw new Error("messages array is required and must not be empty");
  }
  for (const msg of req.messages) {
    if (!msg.role || !msg.content) {
      throw new Error('Each message must have "role" and "content" fields');
    }
  }
}

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  getProviderConfig,
  getSupportedProviders,
  validateStreamRequest,
} from "../src/ai/providers";
import type { StreamRequest } from "../src/ai/providers";
import { collectStreamedText } from "../src/ai/stream";

// ---------------------------------------------------------------------------
// providers.ts tests
// ---------------------------------------------------------------------------

describe("getProviderConfig", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns config for openai when key is set", () => {
    process.env.OPENAI_API_KEY = "sk-test";
    const config = getProviderConfig("openai");
    expect(config.apiKey).toBe("sk-test");
    expect(config.baseUrl).toContain("openai.com");
    expect(config.defaultModel).toBeTruthy();
  });

  it("returns config for anthropic when key is set", () => {
    process.env.ANTHROPIC_API_KEY = "ant-test";
    const config = getProviderConfig("anthropic");
    expect(config.apiKey).toBe("ant-test");
    expect(config.baseUrl).toContain("anthropic.com");
  });

  it("returns config for groq when key is set", () => {
    process.env.GROQ_API_KEY = "gsk-test";
    const config = getProviderConfig("groq");
    expect(config.apiKey).toBe("gsk-test");
    expect(config.baseUrl).toContain("groq.com");
  });

  it("throws when API key is missing", () => {
    delete process.env.OPENAI_API_KEY;
    expect(() => getProviderConfig("openai")).toThrow(
      "API key not configured for provider: openai"
    );
  });
});

describe("getSupportedProviders", () => {
  it("returns all three providers", () => {
    expect(getSupportedProviders()).toEqual(
      expect.arrayContaining(["openai", "anthropic", "groq"])
    );
  });
});

describe("validateStreamRequest", () => {
  const validRequest: StreamRequest = {
    provider: "openai",
    messages: [{ role: "user", content: "Hello" }],
  };

  it("passes for valid request", () => {
    expect(() => validateStreamRequest(validRequest)).not.toThrow();
  });

  it("throws when provider is missing", () => {
    expect(() =>
      validateStreamRequest({ ...validRequest, provider: "" as never })
    ).toThrow("provider is required");
  });

  it("throws for unsupported provider", () => {
    expect(() =>
      validateStreamRequest({ ...validRequest, provider: "unknown" as never })
    ).toThrow("Unsupported provider");
  });

  it("throws when messages array is empty", () => {
    expect(() =>
      validateStreamRequest({ ...validRequest, messages: [] })
    ).toThrow("messages array is required and must not be empty");
  });

  it("throws when a message is missing content", () => {
    expect(() =>
      validateStreamRequest({
        ...validRequest,
        messages: [{ role: "user", content: "" }],
      })
    ).toThrow('Each message must have "role" and "content" fields');
  });

  it("accepts an optional model field", () => {
    expect(() =>
      validateStreamRequest({ ...validRequest, model: "gpt-4o" })
    ).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// stream.ts tests – uses a mocked fetch so no real API calls are made
// ---------------------------------------------------------------------------

describe("collectStreamedText", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, OPENAI_API_KEY: "sk-test" };
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("collects openai streamed content", async () => {
    const sseChunks = [
      'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":" world"}}]}\n\n',
      "data: [DONE]\n\n",
    ];

    const encoder = new TextEncoder();
    let chunkIndex = 0;

    const mockReader = {
      read: vi.fn().mockImplementation(async () => {
        if (chunkIndex < sseChunks.length) {
          return {
            done: false,
            value: encoder.encode(sseChunks[chunkIndex++]),
          };
        }
        return { done: true, value: undefined };
      }),
      releaseLock: vi.fn(),
    };

    const mockBody = { getReader: () => mockReader };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, body: mockBody })
    );

    const result = await collectStreamedText({
      provider: "openai",
      messages: [{ role: "user", content: "Hi" }],
    });

    expect(result).toBe("Hello world");
  });

  it("collects anthropic streamed content", async () => {
    process.env.ANTHROPIC_API_KEY = "ant-test";

    const sseChunks = [
      'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Hi"}}\n\n',
      'data: {"type":"message_stop"}\n\n',
    ];

    const encoder = new TextEncoder();
    let chunkIndex = 0;

    const mockReader = {
      read: vi.fn().mockImplementation(async () => {
        if (chunkIndex < sseChunks.length) {
          return {
            done: false,
            value: encoder.encode(sseChunks[chunkIndex++]),
          };
        }
        return { done: true, value: undefined };
      }),
      releaseLock: vi.fn(),
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, body: { getReader: () => mockReader } })
    );

    const result = await collectStreamedText({
      provider: "anthropic",
      messages: [{ role: "user", content: "Hi" }],
    });

    expect(result).toBe("Hi");
  });

  it("throws when upstream returns an error status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => "Unauthorized",
      })
    );

    await expect(
      collectStreamedText({
        provider: "openai",
        messages: [{ role: "user", content: "Hi" }],
      })
    ).rejects.toThrow("openai API error (401): Unauthorized");
  });

  it("throws when API key is missing", async () => {
    delete process.env.OPENAI_API_KEY;

    await expect(
      collectStreamedText({
        provider: "openai",
        messages: [{ role: "user", content: "Hi" }],
      })
    ).rejects.toThrow("API key not configured");
  });
});

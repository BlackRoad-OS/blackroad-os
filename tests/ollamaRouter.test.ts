import { describe, expect, it, vi, afterEach } from "vitest";
import { shouldRouteToOllama, routeToOllama, ROUTED_HANDLES } from "../src/ollama/router";

// ── shouldRouteToOllama ──────────────────────────────────────────────────────

describe("shouldRouteToOllama", () => {
  it.each(ROUTED_HANDLES as unknown as string[])(
    "returns true for message containing %s",
    (handle: string) => {
      expect(shouldRouteToOllama(`hey ${handle} what is up?`)).toBe(true);
    }
  );

  it("is case-insensitive", () => {
    expect(shouldRouteToOllama("@LUCIDIA help me")).toBe(true);
  });

  it("returns false for messages without any handle", () => {
    expect(shouldRouteToOllama("just a regular message")).toBe(false);
  });
});

// ── routeToOllama ────────────────────────────────────────────────────────────

vi.mock("../src/ollama/client", () => ({
  chatWithOllama: vi.fn().mockResolvedValue({
    model: "llama3",
    message: { role: "assistant", content: "Hello from Ollama!" },
  }),
}));

describe("routeToOllama", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns routed:false for messages without a handle", async () => {
    const result = await routeToOllama("plain message");
    expect(result.routed).toBe(false);
    expect(result.response).toBeUndefined();
  });

  it("returns routed:true with response for messages with @blackboxprogramming", async () => {
    const result = await routeToOllama("@blackboxprogramming help");
    expect(result.routed).toBe(true);
    expect(result.response?.message.content).toBe("Hello from Ollama!");
  });

  it("returns routed:true with response for messages with @lucidia", async () => {
    const result = await routeToOllama("hey @lucidia!");
    expect(result.routed).toBe(true);
    expect(result.response?.model).toBe("llama3");
  });
});

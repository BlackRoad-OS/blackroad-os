import { describe, expect, it, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { containsOllamaHandle, stripHandle, OLLAMA_HANDLES } from "../src/ollama";
import { POST as ollamaNextRoute } from "../app/api/ollama/route";

// ---------------------------------------------------------------------------
// Mock Ollama client so tests do not require a running Ollama server
// ---------------------------------------------------------------------------

vi.mock("../src/ollama/client", () => ({
  ollamaChat: vi.fn(async (prompt: string, cfg?: { model?: string }) => ({
    model: cfg?.model ?? "llama3",
    message: { role: "assistant", content: `Echo: ${prompt}` },
    done: true,
  })),
}));

// ---------------------------------------------------------------------------
// Unit tests – handle detection helpers
// ---------------------------------------------------------------------------

describe("OLLAMA_HANDLES constant", () => {
  it("contains all expected handles", () => {
    expect(OLLAMA_HANDLES).toContain("@copilot");
    expect(OLLAMA_HANDLES).toContain("@lucidia");
    expect(OLLAMA_HANDLES).toContain("@blackboxprogramming");
    expect(OLLAMA_HANDLES).toContain("@ollama");
  });
});

describe("containsOllamaHandle", () => {
  it.each(["@copilot", "@lucidia", "@blackboxprogramming", "@ollama"])(
    "detects %s",
    (handle) => {
      expect(containsOllamaHandle(`${handle} hello`)).toBe(true);
    }
  );

  it("is case-insensitive", () => {
    expect(containsOllamaHandle("@LUCIDIA tell me something")).toBe(true);
  });

  it("returns false when no handle present", () => {
    expect(containsOllamaHandle("just a plain message")).toBe(false);
  });
});

describe("stripHandle", () => {
  it.each([
    ["@copilot What is 2+2?", "What is 2+2?"],
    ["@lucidia   Hello", "Hello"],
    ["@blackboxprogramming explain this", "explain this"],
    ["@ollama write me a poem", "write me a poem"],
  ])("strips '%s' → '%s'", (input, expected) => {
    expect(stripHandle(input)).toBe(expected);
  });

  it("leaves plain messages unchanged", () => {
    expect(stripHandle("no handle here")).toBe("no handle here");
  });
});

// ---------------------------------------------------------------------------
// Express router – POST /api/ollama/chat
// ---------------------------------------------------------------------------

describe("Express POST /api/ollama/chat", () => {
  const app = createApp();

  it("forwards plain message to Ollama", async () => {
    const res = await request(app)
      .post("/api/ollama/chat")
      .send({ message: "Hello" });

    expect(res.status).toBe(200);
    expect(res.body.reply).toBe("Echo: Hello");
    expect(res.body.model).toBe("llama3");
    expect(res.body.handle).toBeUndefined();
  });

  it.each(["@copilot", "@lucidia", "@blackboxprogramming", "@ollama"])(
    "strips %s handle and forwards prompt",
    async (handle) => {
      const res = await request(app)
        .post("/api/ollama/chat")
        .send({ message: `${handle} What is 1+1?` });

      expect(res.status).toBe(200);
      expect(res.body.reply).toBe("Echo: What is 1+1?");
      expect(res.body.handle).toBe(handle);
    }
  );

  it("uses custom model when provided", async () => {
    const res = await request(app)
      .post("/api/ollama/chat")
      .send({ message: "Hi", model: "mistral" });

    expect(res.status).toBe(200);
    expect(res.body.model).toBe("mistral");
  });

  it("returns 400 for empty message", async () => {
    const res = await request(app)
      .post("/api/ollama/chat")
      .send({ message: "  " });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("returns 400 when message is missing", async () => {
    const res = await request(app).post("/api/ollama/chat").send({});
    expect(res.status).toBe(400);
  });

  it("returns 502 when Ollama is unavailable", async () => {
    const { ollamaChat } = await import("../src/ollama/client");
    vi.mocked(ollamaChat).mockRejectedValueOnce(new Error("connect ECONNREFUSED"));

    const res = await request(app)
      .post("/api/ollama/chat")
      .send({ message: "ping" });

    expect(res.status).toBe(502);
    expect(res.body.error).toMatch(/ECONNREFUSED/);
  });
});

// ---------------------------------------------------------------------------
// Next.js App Router – POST /api/ollama/route
// ---------------------------------------------------------------------------

describe("Next.js POST /api/ollama/chat", () => {
  function makeRequest(body: unknown) {
    return new Request("http://localhost/api/ollama/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("forwards message to Ollama", async () => {
    const res = await ollamaNextRoute(makeRequest({ message: "Hello" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.reply).toBe("Echo: Hello");
  });

  it("detects @copilot handle", async () => {
    const res = await ollamaNextRoute(
      makeRequest({ message: "@copilot explain async/await" })
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.handle).toBe("@copilot");
    expect(json.reply).toBe("Echo: explain async/await");
  });

  it("returns 400 for missing message", async () => {
    const res = await ollamaNextRoute(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid JSON", async () => {
    const req = new Request("http://localhost/api/ollama/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });
    const res = await ollamaNextRoute(req);
    expect(res.status).toBe(400);
  });

  it("returns 502 when Ollama is unavailable", async () => {
    const { ollamaChat } = await import("../src/ollama/client");
    vi.mocked(ollamaChat).mockRejectedValueOnce(new Error("connect ECONNREFUSED"));

    const res = await ollamaNextRoute(makeRequest({ message: "ping" }));
    expect(res.status).toBe(502);
  });
});

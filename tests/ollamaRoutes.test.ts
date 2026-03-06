import request from "supertest";
import { describe, expect, it, vi, afterEach } from "vitest";
import { createApp } from "../src/app";

vi.mock("../src/ollama/client", () => ({
  chatWithOllama: vi.fn().mockResolvedValue({
    model: "llama3",
    message: { role: "assistant", content: "Routed response" },
  }),
}));

describe("Express /api/ollama/chat route", () => {
  const app = createApp();

  afterEach(() => {
    delete process.env.OAUTH_TOKEN;
    vi.clearAllMocks();
  });

  it("returns 400 when message field is missing", async () => {
    const res = await request(app).post("/api/ollama/chat").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/message/i);
  });

  it("returns 400 when message has no recognised handle", async () => {
    const res = await request(app)
      .post("/api/ollama/chat")
      .send({ message: "just plain text" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/not routed/i);
  });

  it("returns Ollama response for messages with @blackboxprogramming", async () => {
    const res = await request(app)
      .post("/api/ollama/chat")
      .send({ message: "@blackboxprogramming what is 2+2?" });
    expect(res.status).toBe(200);
    expect(res.body.message.content).toBe("Routed response");
  });

  it("returns Ollama response for messages with @lucidia", async () => {
    const res = await request(app)
      .post("/api/ollama/chat")
      .send({ message: "hey @lucidia can you help?" });
    expect(res.status).toBe(200);
    expect(res.body.model).toBe("llama3");
  });

  it("returns 401 when OAUTH_TOKEN is set and token is missing", async () => {
    process.env.OAUTH_TOKEN = "mysecret";
    const res = await request(app)
      .post("/api/ollama/chat")
      .send({ message: "@blackboxprogramming hello" });
    expect(res.status).toBe(401);
  });

  it("returns 200 when OAUTH_TOKEN is set and correct token is supplied", async () => {
    process.env.OAUTH_TOKEN = "mysecret";
    const res = await request(app)
      .post("/api/ollama/chat")
      .set("Authorization", "Bearer mysecret")
      .send({ message: "@blackboxprogramming hello" });
    expect(res.status).toBe(200);
  });
});

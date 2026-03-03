import request from "supertest";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { createApp } from "../src/app";
import { createServer } from "../src/index";
import * as fs from "fs/promises";

vi.mock("../src/utils/buildInfo", () => ({
  getBuildInfo: () => ({ version: "test-version", commit: "test-commit", buildTime: "now" })
}));

describe("Express internal routes", () => {
  const app = createApp();

  it("returns health", async () => {
    const response = await request(app).get("/internal/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("returns version", async () => {
    const response = await request(app).get("/internal/version");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ version: "test-version", commit: "test-commit" });
  });
});

describe("Fastify public routes", () => {
  let server: Awaited<ReturnType<typeof createServer>>;

  beforeEach(async () => {
    server = await createServer();
  });

  it("returns health", async () => {
    const response = await server.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok", service: "blackroad-os" });
  });

  it("returns version", async () => {
    const response = await server.inject({ method: "GET", url: "/version" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ version: "test-version", commit: "test-commit" });
  });
});

describe("Chronicles API endpoint", () => {
  let server: Awaited<ReturnType<typeof createServer>>;
  let readFileSpy: any;

  beforeEach(async () => {
    server = await createServer();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns chronicles data successfully", async () => {
    const mockChronicles = {
      episodes: [
        {
          id: "001",
          title: "Test Episode",
          series: "Test Series",
          subtitle: "Episode 001",
          narrator: "Test Narrator",
          date: "2025-01-01",
          duration: "00:05:00",
          audioFile: "/audio/test.mp3",
          tags: ["test"],
          status: "active",
          contentPath: "/chronicles/test.mdx"
        }
      ]
    };

    readFileSpy = vi.spyOn(fs, "readFile").mockResolvedValue(JSON.stringify(mockChronicles));

    const response = await server.inject({ method: "GET", url: "/api/chronicles" });
    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.episodes).toHaveLength(1);
    expect(body.total).toBe(1);
    expect(body.episodes[0].id).toBe("001");
  });

  it("returns 500 when file read fails", async () => {
    readFileSpy = vi.spyOn(fs, "readFile").mockRejectedValue(new Error("File not found"));

    const response = await server.inject({ method: "GET", url: "/api/chronicles" });
    expect(response.statusCode).toBe(500);
    const body = response.json();
    expect(body.error).toBeDefined();
    expect(body.episodes).toEqual([]);
  });

  it("returns 500 when JSON is malformed", async () => {
    readFileSpy = vi.spyOn(fs, "readFile").mockResolvedValue("invalid json{");

    const response = await server.inject({ method: "GET", url: "/api/chronicles" });
    expect(response.statusCode).toBe(500);
    const body = response.json();
    expect(body.error).toBeDefined();
  });

  it("filters out invalid episodes", async () => {
    const mockChronicles = {
      episodes: [
        {
          id: "001",
          title: "Valid Episode",
          series: "Test Series",
          subtitle: "Episode 001",
          narrator: "Test Narrator",
          date: "2025-01-01",
          duration: "00:05:00",
          audioFile: "/audio/test.mp3",
          tags: ["test"],
          status: "active",
          contentPath: "/chronicles/test.mdx"
        },
        {
          id: "002",
          title: "Invalid Episode - missing required fields"
        }
      ]
    };

    readFileSpy = vi.spyOn(fs, "readFile").mockResolvedValue(JSON.stringify(mockChronicles));

    const response = await server.inject({ method: "GET", url: "/api/chronicles" });
    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.episodes).toHaveLength(1);
    expect(body.episodes[0].id).toBe("001");
  });

  it("returns 500 when episodes is not an array", async () => {
    const mockChronicles = {
      episodes: "not an array"
    };

    readFileSpy = vi.spyOn(fs, "readFile").mockResolvedValue(JSON.stringify(mockChronicles));

    const response = await server.inject({ method: "GET", url: "/api/chronicles" });
    expect(response.statusCode).toBe(500);
    const body = response.json();
    expect(body.error).toContain("episodes must be an array");
  });
});

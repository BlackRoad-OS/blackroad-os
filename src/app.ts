import express from "express";
import { createMetaRouter } from "./routes/meta";
import { createDigestRouter } from "./routes/digest";
import { createOllamaRouter } from "./routes/ollama";
import { oauthMiddleware } from "./auth/oauth";

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/internal", createMetaRouter());
  app.use("/api/digest", createDigestRouter());
  app.use("/api/ollama", oauthMiddleware, createOllamaRouter());
  return app;
}

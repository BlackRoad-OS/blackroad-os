import express from "express";
import { createMetaRouter } from "./routes/meta";
import { createDigestRouter } from "./routes/digest";
import { createOllamaRouter } from "./ollama";

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/internal", createMetaRouter());
  app.use("/api/digest", createDigestRouter());
  app.use("/api/ollama", createOllamaRouter());
  return app;
}

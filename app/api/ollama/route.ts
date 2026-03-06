/**
 * POST /api/ollama/chat
 *
 * Accepts a JSON body `{ message: string, model?: string }` and routes
 * the request through the Ollama router.  Only messages mentioning a
 * recognised agent handle (@blackboxprogramming, @lucidia, @ollama,
 * @copilot) are forwarded to the local Ollama instance; other messages
 * receive a 400 response.
 *
 * Authentication: Bearer token from the `OAUTH_TOKEN` environment
 * variable.  Omit the variable to disable auth in development.
 */

import { routeToOllama } from "../../../src/ollama/router";

function getToken(req: Request): string | null {
  const auth = req.headers.get("authorization") ?? "";
  const parts = auth.split(" ");
  if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
    return parts[1];
  }
  return null;
}

function isAuthorized(req: Request): boolean {
  const expected = process.env.OAUTH_TOKEN;
  if (!expected) return true; // no token configured → open
  return getToken(req) === expected;
}

export async function POST(req: Request): Promise<Response> {
  if (!isAuthorized(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { message?: string; model?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { message, model } = body;
  if (!message || typeof message !== "string") {
    return Response.json(
      { error: "Missing required field: message" },
      { status: 400 }
    );
  }

  try {
    const result = await routeToOllama(message, model ? { model } : {});
    if (!result.routed) {
      return Response.json(
        {
          error:
            "Message not routed. Mention @blackboxprogramming, @lucidia, @ollama, or @copilot.",
        },
        { status: 400 }
      );
    }

    return Response.json(result.response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: errorMessage }, { status: 502 });
  }
}

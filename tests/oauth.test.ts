import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { validateBearerToken, oauthMiddleware } from "../src/auth/oauth";
import type { Request, Response, NextFunction } from "express";

// ── validateBearerToken ──────────────────────────────────────────────────────

describe("validateBearerToken", () => {
  afterEach(() => {
    delete process.env.OAUTH_TOKEN;
  });

  it("returns true when OAUTH_TOKEN is not set (dev/test mode)", () => {
    delete process.env.OAUTH_TOKEN;
    const req = {
      headers: { authorization: "" },
    } as unknown as Request;
    expect(validateBearerToken(req)).toBe(true);
  });

  it("returns true for a matching Bearer token", () => {
    process.env.OAUTH_TOKEN = "secret123";
    const req = {
      headers: { authorization: "Bearer secret123" },
    } as unknown as Request;
    expect(validateBearerToken(req)).toBe(true);
  });

  it("returns false for a wrong token", () => {
    process.env.OAUTH_TOKEN = "secret123";
    const req = {
      headers: { authorization: "Bearer wrong" },
    } as unknown as Request;
    expect(validateBearerToken(req)).toBe(false);
  });

  it("returns false when Authorization header is missing", () => {
    process.env.OAUTH_TOKEN = "secret123";
    const req = { headers: {} } as unknown as Request;
    expect(validateBearerToken(req)).toBe(false);
  });

  it("returns false when scheme is not Bearer", () => {
    process.env.OAUTH_TOKEN = "secret123";
    const req = {
      headers: { authorization: "Basic secret123" },
    } as unknown as Request;
    expect(validateBearerToken(req)).toBe(false);
  });
});

// ── oauthMiddleware ──────────────────────────────────────────────────────────

describe("oauthMiddleware", () => {
  afterEach(() => {
    delete process.env.OAUTH_TOKEN;
  });

  it("calls next() when OAUTH_TOKEN is not configured", () => {
    delete process.env.OAUTH_TOKEN;
    const req = { headers: {} } as unknown as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
    const next = vi.fn() as unknown as NextFunction;

    oauthMiddleware(req, res, next);
    expect(next).toHaveBeenCalledOnce();
  });

  it("calls next() for a valid Bearer token", () => {
    process.env.OAUTH_TOKEN = "tok";
    const req = {
      headers: { authorization: "Bearer tok" },
    } as unknown as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
    const next = vi.fn() as unknown as NextFunction;

    oauthMiddleware(req, res, next);
    expect(next).toHaveBeenCalledOnce();
  });

  it("responds 401 for an invalid token and does not call next()", () => {
    process.env.OAUTH_TOKEN = "tok";
    const req = {
      headers: { authorization: "Bearer bad" },
    } as unknown as Request;
    const jsonMock = vi.fn();
    const statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    const res = { status: statusMock, json: jsonMock } as unknown as Response;
    const next = vi.fn() as unknown as NextFunction;

    oauthMiddleware(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(401);
  });
});

import { describe, expect, it } from "vitest";
import { validateMetrics, ValidationError } from "../src/lucidia";
import type { Metrics } from "../src/lucidia";

describe("validateMetrics", () => {
  const validMetrics: Metrics = {
    escalations_last_3_days: 5,
    agent_load: 75,
    blocked_prs: 3,
    avg_review_time: 12,
    unmapped_repos: 2,
    repo_activity_score: 85,
    open_issues: 10,
    avg_issue_age: 5,
    unowned_workflows: 1,
  };

  it("validates complete metrics object", () => {
    expect(() => validateMetrics(validMetrics)).not.toThrow();
  });

  it("throws ValidationError for undefined body", () => {
    expect(() => validateMetrics(undefined)).toThrow(ValidationError);
    expect(() => validateMetrics(undefined)).toThrow(
      "Request body must be a valid metrics object"
    );
  });

  it("throws ValidationError for null body", () => {
    expect(() => validateMetrics(null)).toThrow(ValidationError);
    expect(() => validateMetrics(null)).toThrow(
      "Request body must be a valid metrics object"
    );
  });

  it("throws ValidationError for non-object body", () => {
    expect(() => validateMetrics("invalid")).toThrow(ValidationError);
    expect(() => validateMetrics("invalid")).toThrow(
      "Request body must be a valid metrics object"
    );
  });

  it("throws ValidationError for missing required field", () => {
    const incomplete = { ...validMetrics };
    delete (incomplete as Partial<Metrics>).escalations_last_3_days;
    expect(() => validateMetrics(incomplete)).toThrow(ValidationError);
    expect(() => validateMetrics(incomplete)).toThrow(
      "Missing required metrics field: escalations_last_3_days"
    );
  });

  it("throws ValidationError for non-number field", () => {
    const invalid = { ...validMetrics, agent_load: "75" };
    expect(() => validateMetrics(invalid)).toThrow(ValidationError);
    expect(() => validateMetrics(invalid)).toThrow(
      "Metrics field 'agent_load' must be a number"
    );
  });

  it("validates all required fields are present", () => {
    const requiredFields: (keyof Metrics)[] = [
      "escalations_last_3_days",
      "agent_load",
      "blocked_prs",
      "avg_review_time",
      "unmapped_repos",
      "repo_activity_score",
      "open_issues",
      "avg_issue_age",
      "unowned_workflows",
    ];

    for (const field of requiredFields) {
      const incomplete = { ...validMetrics };
      delete (incomplete as Partial<Metrics>)[field];
      expect(() => validateMetrics(incomplete)).toThrow(
        `Missing required metrics field: ${field}`
      );
    }
  });
});

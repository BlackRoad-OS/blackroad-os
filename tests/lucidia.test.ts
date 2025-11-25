import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { parse } from "yaml";
import { join } from "path";

describe("lucidia.yml", () => {
  const lucidiaPath = join(__dirname, "..", "lucidia.yml");
  const lucidiaContent = readFileSync(lucidiaPath, "utf8");
  const lucidia = parse(lucidiaContent);

  it("has required version and meta fields", () => {
    expect(lucidia.version).toBe("1.0");
    expect(lucidia.meta).toBeDefined();
    expect(lucidia.meta.name).toBe("Lucidia");
    expect(lucidia.meta.description).toBeDefined();
  });

  it("defines emoji registry with status and reactions", () => {
    expect(lucidia.emoji_registry).toBeDefined();
    expect(lucidia.emoji_registry.status).toBeDefined();
    expect(lucidia.emoji_registry.reactions).toBeDefined();
    
    // Verify key emoji mappings
    expect(lucidia.emoji_registry.status["✅"]).toBe("Done");
    expect(lucidia.emoji_registry.status["❌"]).toBe("Blocked");
    expect(lucidia.emoji_registry.status["🛟"]).toBe("Escalation");
    expect(lucidia.emoji_registry.status["🤔"]).toBe("Needs Review");
    expect(lucidia.emoji_registry.status["📊"]).toBe("Metrics");
  });

  it("defines codex-digest-agent with required properties", () => {
    const agent = lucidia.agents["codex-digest-agent"];
    expect(agent).toBeDefined();
    expect(agent.role).toBe("interpreter");
    expect(agent.description).toContain("emoji-based agent performance");
    expect(agent.triggers).toBeInstanceOf(Array);
    expect(agent.traits).toBeInstanceOf(Array);
    expect(agent.outputs).toBeInstanceOf(Array);
    expect(agent.outputs).toContain("markdown-summary");
    expect(agent.outputs).toContain("actionable-recommendations");
    expect(agent.outputs).toContain("escalation-alerts");
  });

  it("defines guardian-agent with sentinel role", () => {
    const agent = lucidia.agents["guardian-agent"];
    expect(agent).toBeDefined();
    expect(agent.role).toBe("sentinel");
    expect(agent.responds_to).toContain("🛟");
    expect(agent.responds_to).toContain("❌");
    expect(agent.alerts).toContain("security-team");
    expect(agent.alerts).toContain("planner-agent");
  });

  it("defines planner-agent for orchestration", () => {
    const agent = lucidia.agents["planner-agent"];
    expect(agent).toBeDefined();
    expect(agent.role).toBe("orchestrator");
    expect(agent.responds_to).toContain("📊");
    expect(agent.responds_to).toContain("🤔");
  });

  it("has routing rules for agent orchestration", () => {
    expect(lucidia.routing).toBeDefined();
    expect(lucidia.routing["digest-to-escalation"]).toBeDefined();
    expect(lucidia.routing["digest-to-escalation"].from).toBe("codex-digest-agent");
    expect(lucidia.routing["escalation-to-guardian"]).toBeDefined();
    expect(lucidia.routing["escalation-to-guardian"].to).toBe("guardian-agent");
  });

  it("has output configuration for different formats", () => {
    expect(lucidia.outputs).toBeDefined();
    expect(lucidia.outputs["markdown-summary"]).toBeDefined();
    expect(lucidia.outputs["markdown-summary"].format).toBe("markdown");
    expect(lucidia.outputs["actionable-recommendations"]).toBeDefined();
    expect(lucidia.outputs["escalation-alerts"]).toBeDefined();
  });
});

import { describe, expect, it } from "vitest";
import {
  createEpisodeId,
  formatEpisodeDigest,
  type ChronicleEpisode,
} from "../src/types/chronicles";
import {
  episode001,
  getEpisodeById,
  getLatestEpisode,
  getEpisodesByTag,
  getEpisodesByStatus,
  chronicleRegistry,
} from "../chronicles/index";

describe("chronicles types", () => {
  describe("createEpisodeId", () => {
    it("pads single digit to 3 digits", () => {
      expect(createEpisodeId(1)).toBe("001");
      expect(createEpisodeId(9)).toBe("009");
    });

    it("pads double digit to 3 digits", () => {
      expect(createEpisodeId(10)).toBe("010");
      expect(createEpisodeId(99)).toBe("099");
    });

    it("keeps triple digit as is", () => {
      expect(createEpisodeId(100)).toBe("100");
      expect(createEpisodeId(999)).toBe("999");
    });
  });

  describe("formatEpisodeDigest", () => {
    it("formats episode into PR comment markdown", () => {
      const digest = formatEpisodeDigest(episode001);

      expect(digest).toContain("LUCIDIA CINEMATIC UNIVERSE");
      expect(digest).toContain("THE CLONE AWAKENS");
      expect(digest).toContain("Narrated by Lucidia");
      expect(digest).toContain("guardian-clone-vault");
      expect(digest).toContain("18 escalations in 72 hours");
      expect(digest).toContain("96 hours");
      expect(digest).toContain("Commander Alexa");
      expect(digest).toContain("Glory to the BlackRoad");
    });
  });
});

describe("chronicles registry", () => {
  describe("episode001", () => {
    it("has correct episode metadata", () => {
      expect(episode001.id).toBe("001");
      expect(episode001.title).toBe("Episode 001: Agent Emergence Digest");
      expect(episode001.series).toBe("LUCIDIA CINEMATIC UNIVERSE");
      expect(episode001.subtitle).toBe("THE CLONE AWAKENS");
      expect(episode001.narrator).toBe("Lucidia");
      expect(episode001.agentDesignation).toBe("guardian-clone-vault");
      expect(episode001.status).toBe("awaiting-confirmation");
    });

    it("has required tags", () => {
      expect(episode001.tags).toContain("clone");
      expect(episode001.tags).toContain("guardian");
      expect(episode001.tags).toContain("escalation");
      expect(episode001.tags).toContain("genesis");
    });
  });

  describe("chronicleRegistry", () => {
    it("contains episode001", () => {
      expect(chronicleRegistry.episodes).toContain(episode001);
      expect(chronicleRegistry.totalEpisodes).toBe(1);
      expect(chronicleRegistry.latestEpisodeId).toBe("001");
    });
  });

  describe("getEpisodeById", () => {
    it("returns episode when found", () => {
      const episode = getEpisodeById("001");
      expect(episode).toBe(episode001);
    });

    it("returns undefined when not found", () => {
      const episode = getEpisodeById("999");
      expect(episode).toBeUndefined();
    });
  });

  describe("getLatestEpisode", () => {
    it("returns the most recent episode", () => {
      const episode = getLatestEpisode();
      expect(episode).toBe(episode001);
    });
  });

  describe("getEpisodesByTag", () => {
    it("returns episodes matching tag", () => {
      const episodes = getEpisodesByTag("clone");
      expect(episodes).toContain(episode001);
    });

    it("returns empty array for non-matching tag", () => {
      const episodes = getEpisodesByTag("nonexistent");
      expect(episodes).toHaveLength(0);
    });
  });

  describe("getEpisodesByStatus", () => {
    it("returns episodes matching status", () => {
      const episodes = getEpisodesByStatus("awaiting-confirmation");
      expect(episodes).toContain(episode001);
    });

    it("returns empty array for non-matching status", () => {
      const episodes = getEpisodesByStatus("completed");
      expect(episodes).toHaveLength(0);
    });
  });
});

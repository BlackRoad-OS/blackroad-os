"use client";

import { useState, useEffect } from "react";
import { EnvCard } from "../components/EnvCard";
import { ChronicleCard } from "../components/ChronicleCard";
import type { Environment } from "../src/types";
import type { ChronicleEpisode } from "../src/types/chronicles";

// Sample chronicle episode - in production, fetch from /api/chronicles
const sampleEpisode: ChronicleEpisode = {
  id: "003",
  title: "The Scribe's Awakening",
  series: "Lucidia Chronicles",
  subtitle: "Episode 003",
  narrator: "Lucidia Prime",
  date: "2025-11-24",
  duration: "00:04:32",
  audioFile: "/audio/episode-003.mp3",
  tags: ["spawn", "scribe-agent", "digest"],
  agentDesignation: "scribe-agent-alpha",
  triggerEvent: "digest_count > 4",
  ttl: "14d",
  status: "active",
  commander: "BlackRoad Founders",
  contentPath: "/chronicles/episode-003.mdx",
};

export default function DashboardPage() {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEnvironments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/environments");
      if (!response.ok) {
        throw new Error(`Failed to fetch environments: ${response.statusText}`);
      }
      const data = await response.json();
      setEnvironments(data.environments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load environments");
      console.error("Error fetching environments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnvironments();
  }, []);

  return (
    <div>
      <header className="header">
        <h1>
          <span>{"// "}</span>BlackRoad OS
        </h1>
        <nav className="nav-links">
          <a href="/" className="active">Dashboard</a>
          <a href="/chronicles">Chronicles</a>
          <a href="/agents">Agents</a>
          <a href="/api/health">Health</a>
        </nav>
      </header>

      <main className="container">
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Environment Status</h2>
            <button className="btn btn-secondary" onClick={fetchEnvironments} disabled={isLoading}>
              {isLoading ? "Loading..." : "Refresh"}
            </button>
          </div>
          {error && (
            <div style={{ padding: "12px", marginBottom: "16px", background: "var(--error-bg, #fee)", color: "var(--error-text, #c00)", borderRadius: "4px" }}>
              {error}
            </div>
          )}
          <div className="grid grid-cols-2">
            {isLoading && environments.length === 0 ? (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "24px", color: "var(--text-secondary)" }}>
                Loading environments...
              </div>
            ) : !error && environments.length === 0 ? (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "24px", color: "var(--text-secondary)" }}>
                No environments found
              </div>
            ) : (
              environments.map((env) => (
                <EnvCard key={env.id} env={env} />
              ))
            )}
          </div>
        </section>

        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Latest Chronicle</h2>
            <a href="/chronicles" className="btn btn-secondary">View All</a>
          </div>
          <div className="chronicle-grid">
            <ChronicleCard
              episode={sampleEpisode}
              onPlay={() => console.log("Playing episode:", sampleEpisode.id)}
              onViewTranscript={() => console.log("Viewing transcript:", sampleEpisode.id)}
            />
          </div>
        </section>

        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Quick Actions</h2>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button className="btn btn-primary">Generate Digest</button>
            <button className="btn btn-secondary">Trigger Spawn Check</button>
            <button className="btn btn-secondary">View Metrics</button>
          </div>
        </section>
      </main>
    </div>
  );
}

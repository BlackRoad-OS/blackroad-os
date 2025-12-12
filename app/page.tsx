"use client";

import { EnvCard } from "../components/EnvCard";
import { ChronicleCard } from "../components/ChronicleCard";
import type { Environment } from "../src/types";
import type { ChronicleEpisode } from "../src/types/chronicles";

// Sample environment data - in production, fetch from /api/environments
const environments: Environment[] = [
  { id: "prod-us-east", name: "Production US", region: "us-east-1", status: "healthy" },
  { id: "prod-eu-west", name: "Production EU", region: "eu-west-1", status: "healthy" },
  { id: "staging", name: "Staging", region: "us-west-2", status: "degraded" },
  { id: "dev", name: "Development", region: "us-east-2", status: "healthy" },
];

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
            <button className="btn btn-secondary">Refresh</button>
          </div>
          <div className="grid grid-cols-2">
            {environments.map((env) => (
              <EnvCard key={env.id} env={env} />
            ))}
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

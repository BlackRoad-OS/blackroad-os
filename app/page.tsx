"use client";

import { useEffect, useState } from "react";
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

export default function DashboardPage() {
  const [latestEpisode, setLatestEpisode] = useState<ChronicleEpisode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLatestEpisode() {
      try {
        const response = await fetch("/api/chronicles");
        const data = await response.json();
        if (data.episodes && data.episodes.length > 0) {
          setLatestEpisode(data.episodes[0]); // First episode is the latest
        }
      } catch (error) {
        console.error("Failed to fetch latest episode:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLatestEpisode();
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
            {loading ? (
              <p style={{ color: "var(--text-secondary)" }}>Loading latest episode...</p>
            ) : latestEpisode ? (
              <ChronicleCard
                episode={latestEpisode}
                onPlay={() => console.log("Playing episode:", latestEpisode.id)}
                onViewTranscript={() => console.log("Viewing transcript:", latestEpisode.id)}
              />
            ) : (
              <p style={{ color: "var(--text-secondary)" }}>No episodes available</p>
            )}
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

"use client";

import { useEffect, useState } from "react";
import { ChronicleCard } from "../../components/ChronicleCard";
import type { ChronicleEpisode } from "../../src/types/chronicles";

interface ChroniclesResponse {
  episodes: ChronicleEpisode[];
  totalEpisodes: number;
}

export default function ChroniclesPage() {
  const [episodes, setEpisodes] = useState<ChronicleEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEpisodes() {
      try {
        const response = await fetch("/api/chronicles");
        if (!response.ok) {
          throw new Error("Failed to fetch episodes");
        }
        const data: ChroniclesResponse = await response.json();
        setEpisodes(data.episodes);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchEpisodes();
  }, []);

  const handlePlay = (episodeId: string) => {
    console.log("Playing episode:", episodeId);
    // In production: integrate with audio player
  };

  const handleViewTranscript = (episodeId: string) => {
    console.log("Viewing transcript:", episodeId);
    // In production: navigate to episode detail page
    window.location.href = `/chronicles/${episodeId}`;
  };

  let content;
  if (loading) {
    content = (
      <section className="section">
        <p style={{ color: "var(--text-secondary)" }}>Loading chronicles...</p>
      </section>
    );
  } else if (error) {
    content = (
      <section className="section">
        <p style={{ color: "var(--accent-red)" }}>Error: {error}</p>
      </section>
    );
  } else {
    content = (
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Lucidia Chronicles</h2>
          <span style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            {episodes.length} episodes
          </span>
        </div>
        <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
          The canonical narrative archive of BlackRoad-OS agent evolution.
          Each episode documents the spawning, awakening, and mission of our autonomous agents.
        </p>
        <div className="chronicle-grid">
          {episodes.map((episode) => (
            <ChronicleCard
              key={episode.id}
              episode={episode}
              onPlay={() => handlePlay(episode.id)}
              onViewTranscript={() => handleViewTranscript(episode.id)}
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <div>
      <header className="header">
        <h1>
          <span>{"// "}</span>BlackRoad OS
        </h1>
        <nav className="nav-links">
          <a href="/">Dashboard</a>
          <a href="/chronicles" className="active">Chronicles</a>
          <a href="/agents">Agents</a>
          <a href="/api/health">Health</a>
        </nav>
      </header>
      <main className="container">{content}</main>
    </div>
  );
}

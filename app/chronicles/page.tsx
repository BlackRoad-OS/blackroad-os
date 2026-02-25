"use client";

import { useEffect, useState } from "react";
import { ChronicleCard } from "../../components/ChronicleCard";
import type { ChronicleEpisode } from "../../src/types/chronicles";

export default function ChroniclesPage() {
  const [episodes, setEpisodes] = useState<ChronicleEpisode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEpisodes() {
      try {
        const response = await fetch("/api/chronicles");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.episodes) {
          setEpisodes(data.episodes);
        }
      } catch (error) {
        console.error("Failed to fetch episodes:", error);
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

      <main className="container">
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Lucidia Chronicles</h2>
            <span style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
              {loading ? "Loading..." : `${episodes.length} episodes`}
            </span>
          </div>
          <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
            The canonical narrative archive of BlackRoad-OS agent evolution.
            Each episode documents the spawning, awakening, and mission of our autonomous agents.
          </p>
          <div className="chronicle-grid">
            {loading ? (
              <p style={{ color: "var(--text-secondary)" }}>Loading episodes...</p>
            ) : episodes.length > 0 ? (
              episodes.map((episode) => (
                <ChronicleCard
                  key={episode.id}
                  episode={episode}
                  onPlay={() => handlePlay(episode.id)}
                  onViewTranscript={() => handleViewTranscript(episode.id)}
                />
              ))
            ) : (
              <p style={{ color: "var(--text-secondary)" }}>No episodes available</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChronicleCard } from "../../components/ChronicleCard";
import type { ChronicleEpisode } from "../../src/types/chronicles";

interface ChroniclesResponse {
  episodes: ChronicleEpisode[];
  totalEpisodes: number;
}

export default function ChroniclesPage() {
  const router = useRouter();

  const handlePlay = (episodeId: string) => {
    console.log("Playing episode:", episodeId);
    // In production: integrate with audio player
  };

  const handleViewTranscript = (episodeId: string) => {
    console.log("Viewing transcript:", episodeId);
    // In production: navigate to episode detail page
    router.push(`/chronicles/${episodeId}`);
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
          <Link href="/">Dashboard</Link>
          <Link href="/chronicles" className="active">Chronicles</Link>
          <Link href="/agents">Agents</Link>
          <Link href="/api/health">Health</Link>
        </nav>
      </header>
      <main className="container">{content}</main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChronicleCard } from "../../components/ChronicleCard";
import type { ChronicleEpisode } from "../../src/types/chronicles";

// Sample chronicle episodes - in production, fetch from /api/chronicles
const episodes: ChronicleEpisode[] = [
  {
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
  },
  {
    id: "002",
    title: "The Digest Protocol",
    series: "Lucidia Chronicles",
    subtitle: "Episode 002",
    narrator: "Lucidia Prime",
    date: "2025-11-23",
    duration: "00:03:45",
    audioFile: "/audio/episode-002.mp3",
    tags: ["digest", "voice", "automation"],
    agentDesignation: "guardian-clone-vault",
    triggerEvent: "pr_merge",
    status: "completed",
    contentPath: "/chronicles/episode-002.mdx",
  },
  {
    id: "001",
    title: "The Clone Awakens",
    series: "Lucidia Chronicles",
    subtitle: "Episode 001",
    narrator: "Lucidia Prime",
    date: "2025-11-22",
    duration: "00:05:12",
    audioFile: "/audio/episode-001.mp3",
    tags: ["origin", "guardian", "clone"],
    agentDesignation: "guardian-clone-vault",
    triggerEvent: "system_init",
    status: "completed",
    commander: "BlackRoad Founders",
    contentPath: "/chronicles/episode-001.mdx",
  },
  {
    id: "000",
    title: "BlackRoad Origin",
    series: "Lucidia Chronicles",
    subtitle: "Episode 000",
    narrator: "The Architect",
    date: "2025-11-21",
    duration: "00:06:00",
    audioFile: "/audio/episode-000.mp3",
    tags: ["origin", "blackroad", "founding"],
    status: "archived",
    contentPath: "/chronicles/episode-000.mdx",
  },
];

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

      <main className="container">
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
      </main>
    </div>
  );
}

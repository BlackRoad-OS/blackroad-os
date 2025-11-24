import React from "react";
import type { ChronicleEpisode, ChronicleStatus } from "../src/types/chronicles";

interface ChronicleCardProps {
  episode: ChronicleEpisode;
  onPlay?: () => void;
  onViewTranscript?: () => void;
}

const statusColors: Record<ChronicleStatus, string> = {
  "awaiting-confirmation": "#f59e0b", // amber
  "active": "#10b981", // green
  "completed": "#3b82f6", // blue
  "archived": "#6b7280", // gray
  "expired": "#ef4444", // red
};

const statusLabels: Record<ChronicleStatus, string> = {
  "awaiting-confirmation": "⏳ Awaiting Confirmation",
  "active": "🟢 Active",
  "completed": "✅ Completed",
  "archived": "📦 Archived",
  "expired": "⏰ Expired",
};

export function ChronicleCard({ episode, onPlay, onViewTranscript }: ChronicleCardProps) {
  const statusColor = statusColors[episode.status];
  const statusLabel = statusLabels[episode.status];

  return (
    <div
      className="chronicle-card"
      style={{
        border: `2px solid ${statusColor}`,
        borderRadius: "12px",
        padding: "20px",
        backgroundColor: "#0d1117",
        color: "#e6edf3",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        maxWidth: "480px",
      }}
    >
      <div className="chronicle-header" style={{ marginBottom: "16px" }}>
        <span
          style={{
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "1px",
            color: "#8b949e",
          }}
        >
          {episode.series}
        </span>
        <h2
          style={{
            margin: "8px 0",
            fontSize: "24px",
            fontWeight: 600,
            color: "#58a6ff",
          }}
        >
          {episode.subtitle}
        </h2>
        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 400, color: "#c9d1d9" }}>
          {episode.title}
        </h3>
      </div>

      <div
        className="chronicle-status"
        style={{
          display: "inline-block",
          padding: "4px 12px",
          borderRadius: "16px",
          backgroundColor: `${statusColor}20`,
          color: statusColor,
          fontSize: "12px",
          fontWeight: 500,
          marginBottom: "16px",
        }}
      >
        {statusLabel}
      </div>

      <div className="chronicle-meta" style={{ marginBottom: "16px", fontSize: "14px" }}>
        <div style={{ display: "flex", gap: "16px", marginBottom: "8px" }}>
          <span>🎙️ {episode.narrator}</span>
          <span>📅 {episode.date}</span>
          <span>⏱️ {episode.duration}</span>
        </div>
        {episode.agentDesignation && (
          <div style={{ marginBottom: "4px" }}>
            🤖 Agent: <code style={{ color: "#7ee787" }}>{episode.agentDesignation}</code>
          </div>
        )}
        {episode.triggerEvent && (
          <div style={{ marginBottom: "4px" }}>⚡ Trigger: {episode.triggerEvent}</div>
        )}
        {episode.ttl && (
          <div style={{ marginBottom: "4px" }}>⏳ TTL: {episode.ttl}</div>
        )}
        {episode.commander && (
          <div>👤 Commander: {episode.commander}</div>
        )}
      </div>

      <div className="chronicle-tags" style={{ marginBottom: "16px" }}>
        {episode.tags.map((tag) => (
          <span
            key={tag}
            style={{
              display: "inline-block",
              padding: "2px 8px",
              marginRight: "8px",
              marginBottom: "4px",
              borderRadius: "4px",
              backgroundColor: "#21262d",
              color: "#8b949e",
              fontSize: "12px",
            }}
          >
            #{tag}
          </span>
        ))}
      </div>

      <div className="chronicle-actions" style={{ display: "flex", gap: "12px" }}>
        <button
          onClick={onPlay}
          style={{
            flex: 1,
            padding: "10px 16px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#238636",
            color: "#ffffff",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          ▶️ Play Episode
        </button>
        <button
          onClick={onViewTranscript}
          style={{
            flex: 1,
            padding: "10px 16px",
            borderRadius: "8px",
            border: "1px solid #30363d",
            backgroundColor: "transparent",
            color: "#c9d1d9",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          📜 Transcript
        </button>
      </div>
    </div>
  );
}

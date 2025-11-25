import React from "react";
import type { ChronicleEpisode, ChronicleStatus } from "../src/types/chronicles";

interface ChronicleCardProps {
  episode: ChronicleEpisode;
  onPlay?: () => void;
  onViewTranscript?: () => void;
}

interface StatusStyle {
  color: string;
  backgroundColor: string;
}

const statusStyles: Record<ChronicleStatus, StatusStyle> = {
  "awaiting-confirmation": { color: "#f59e0b", backgroundColor: "rgba(245, 158, 11, 0.12)" },
  "active": { color: "#10b981", backgroundColor: "rgba(16, 185, 129, 0.12)" },
  "completed": { color: "#3b82f6", backgroundColor: "rgba(59, 130, 246, 0.12)" },
  "archived": { color: "#6b7280", backgroundColor: "rgba(107, 114, 128, 0.12)" },
  "expired": { color: "#ef4444", backgroundColor: "rgba(239, 68, 68, 0.12)" },
};

const statusLabels: Record<ChronicleStatus, string> = {
  "awaiting-confirmation": "⏳ Awaiting Confirmation",
  "active": "🟢 Active",
  "completed": "✅ Completed",
  "archived": "📦 Archived",
  "expired": "⏰ Expired",
};

const baseButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: "10px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: 500,
};

export function ChronicleCard({ episode, onPlay, onViewTranscript }: ChronicleCardProps) {
  const statusStyle = statusStyles[episode.status];
  const statusLabel = statusLabels[episode.status];

  return (
    <div
      className="chronicle-card"
      style={{
        border: `2px solid ${statusStyle.color}`,
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
          backgroundColor: statusStyle.backgroundColor,
          color: statusStyle.color,
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
            ...baseButtonStyle,
            border: "none",
            backgroundColor: "#238636",
            color: "#ffffff",
          }}
        >
          ▶️ Play Episode
        </button>
        <button
          onClick={onViewTranscript}
          style={{
            ...baseButtonStyle,
            border: "1px solid #30363d",
            backgroundColor: "transparent",
            color: "#c9d1d9",
          }}
        >
          📜 Transcript
        </button>
      </div>
    </div>
  );
}

import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChronicleCard } from "../components/ChronicleCard";
import { episode001 } from "../chronicles/index";

describe("ChronicleCard", () => {
  it("renders episode title and subtitle", () => {
    render(<ChronicleCard episode={episode001} />);

    expect(screen.getByText("THE CLONE AWAKENS")).toBeInTheDocument();
    expect(screen.getByText("Episode 001: Agent Emergence Digest")).toBeInTheDocument();
  });

  it("renders series name", () => {
    render(<ChronicleCard episode={episode001} />);

    expect(screen.getByText("LUCIDIA CINEMATIC UNIVERSE")).toBeInTheDocument();
  });

  it("renders narrator and date", () => {
    render(<ChronicleCard episode={episode001} />);

    expect(screen.getByText(/Lucidia/)).toBeInTheDocument();
    expect(screen.getByText(/2025-01-01/)).toBeInTheDocument();
  });

  it("renders agent designation", () => {
    render(<ChronicleCard episode={episode001} />);

    expect(screen.getByText("guardian-clone-vault")).toBeInTheDocument();
  });

  it("renders status badge", () => {
    render(<ChronicleCard episode={episode001} />);

    expect(screen.getByText(/Awaiting Confirmation/)).toBeInTheDocument();
  });

  it("renders tags", () => {
    render(<ChronicleCard episode={episode001} />);

    expect(screen.getByText("#clone")).toBeInTheDocument();
    expect(screen.getByText("#guardian")).toBeInTheDocument();
    expect(screen.getByText("#escalation")).toBeInTheDocument();
    expect(screen.getByText("#genesis")).toBeInTheDocument();
  });

  it("calls onPlay when play button clicked", () => {
    const onPlay = vi.fn();
    render(<ChronicleCard episode={episode001} onPlay={onPlay} />);

    fireEvent.click(screen.getByText(/Play Episode/));
    expect(onPlay).toHaveBeenCalledTimes(1);
  });

  it("calls onViewTranscript when transcript button clicked", () => {
    const onViewTranscript = vi.fn();
    render(<ChronicleCard episode={episode001} onViewTranscript={onViewTranscript} />);

    fireEvent.click(screen.getByText(/Transcript/));
    expect(onViewTranscript).toHaveBeenCalledTimes(1);
  });
});

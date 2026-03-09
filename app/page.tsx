import TopNav from "@/components/TopNav";
import AgentPanel from "@/components/AgentPanel";
import Workspace from "@/components/Workspace";
import WorldsGrid from "@/components/WorldsGrid";
import TerminalBar from "@/components/TerminalBar";

export default function Home() {
  return (
    <main className="h-screen flex flex-col">
      <TopNav />

      <div className="flex flex-1 overflow-hidden">
        <AgentPanel />
        <Workspace />
        <WorldsGrid />
      </div>

      <TerminalBar />
    </main>
  );
}

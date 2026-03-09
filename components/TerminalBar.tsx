export default function TerminalBar() {
  return (
    <div className="h-10 border-t border-neutral-800 bg-black px-4 flex items-center font-mono text-xs text-neutral-400">
      <span className="mr-2 text-green-500">●</span>
      BlackRoad CLI v3 › layers loaded: agents · orchestration · memory · network
    </div>
  );
}

export default function WorldsGrid() {
  return (
    <aside className="w-80 border-l border-neutral-800 p-3 overflow-auto">
      <h3 className="text-sm font-semibold mb-3 px-1">Worlds</h3>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-lg border border-neutral-800 bg-neutral-900 flex items-center justify-center text-xs text-neutral-500 hover:border-neutral-600 transition-colors cursor-pointer"
          >
            <div className="text-center">
              <div className="text-2xl mb-1">🌍</div>
              <div>World {i + 1}</div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

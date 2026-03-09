export default function TopNav() {
  const tabs = ["Dashboard", "Repositories", "Files", "Terminal", "Tools", "Agents"];

  return (
    <div className="relative h-12 flex items-center px-4 border-b border-neutral-800 bg-neutral-900">
      <span className="mr-6 font-semibold">BlackRoad OS</span>

      <nav className="flex gap-6 text-sm">
        {tabs.map(tab => (
          <button key={tab} className="hover:text-white text-neutral-400 transition-colors">
            {tab}
          </button>
        ))}
      </nav>

      <div className="absolute h-1 w-full bottom-0 left-0 bg-gradient-to-r from-orange-500 via-pink-500 to-blue-500" />
    </div>
  );
}

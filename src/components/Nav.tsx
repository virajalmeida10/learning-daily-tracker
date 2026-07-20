export type View = 'home' | 'log' | 'browse' | 'subjects' | 'checklist' | 'goals' | 'settings'

const ITEMS: { key: View; label: string }[] = [
  { key: 'home', label: 'Home' },
  { key: 'log', label: 'Log topic' },
  { key: 'browse', label: 'Browse' },
  { key: 'subjects', label: 'Subjects' },
  { key: 'checklist', label: 'Checklist' },
  { key: 'goals', label: 'Goals' },
  { key: 'settings', label: 'Settings' },
]

export function Nav({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  return (
    <nav className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center gap-1 overflow-x-auto px-4 py-2 sm:gap-2">
        <span className="mr-2 shrink-0 text-sm font-semibold text-stone-900">Learning Tracker</span>
        {ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            className={`shrink-0 rounded-md px-2.5 py-1 text-sm font-medium transition-colors ${
              view === item.key
                ? 'bg-accent-600 text-white'
                : 'text-stone-500 hover:bg-stone-100'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  )
}

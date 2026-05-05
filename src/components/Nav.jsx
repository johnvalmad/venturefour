export default function Nav() {
  const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-paper/90 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-accent rounded-sm flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6h8M6 2v8" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="font-display font-bold text-sm tracking-tight">AI Venture Board</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {['Team', 'Ideas', 'Tasks'].map(s => (
            <a key={s} href={`#${s.toLowerCase()}`} className="nav-link text-muted hover:text-ink transition-colors">
              {s}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
          <span className="text-xs text-muted">{date}</span>
        </div>
      </div>
    </nav>
  )
}

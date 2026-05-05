import { TEAM } from '../data/constants'

export default function TeamSection() {
  return (
    <section id="team" className="max-w-6xl mx-auto px-6 py-14 border-b border-border">
      <p className="tag text-accent mb-8">01 — Team</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {TEAM.map(m => (
          <div key={m.initials} className="bg-white border border-border rounded-2xl p-5 flex flex-col gap-3 hover:border-accent transition-colors duration-200">
            <div className={`w-12 h-12 rounded-xl ${m.color} flex items-center justify-center font-display font-bold text-sm`}>
              {m.initials}
            </div>
            <div>
              <p className="font-display font-bold text-base">{m.name}</p>
              <p className="text-xs text-muted mt-0.5">{m.role}</p>
            </div>
            <span className="tag text-accent self-start">{m.title}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

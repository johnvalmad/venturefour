const revealStyle = (delay = 0) => ({
  display: 'block',
  animation: `reveal 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s both`,
})

export default function Hero({ ideasCount, tasksDone, tasksTotal }) {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-16 pb-12 border-b border-border">
      <div className="flex items-start justify-between flex-wrap gap-6">
        <div>
          <p className="tag text-accent mb-4">AI Business Meeting · Session 01</p>
          <div className="overflow-hidden">
            <span className="font-display text-5xl md:text-7xl leading-none tracking-tight" style={revealStyle(0)}>Build.</span>
          </div>
          <div className="overflow-hidden">
            <span className="font-display text-5xl md:text-7xl leading-none tracking-tight text-muted" style={revealStyle(0.08)}>Ship.</span>
          </div>
          <div className="overflow-hidden">
            <span className="font-display text-5xl md:text-7xl leading-none tracking-tight" style={revealStyle(0.16)}>Repeat.</span>
          </div>
        </div>
        <div className="flex flex-col gap-3 pt-2">
          {[
            { label: 'Ideas', value: ideasCount },
            { label: 'Team', value: 4 },
            { label: 'Tasks done', value: `${tasksDone} / ${tasksTotal}` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface border border-border rounded-xl px-5 py-4 min-w-[180px]">
              <p className="tag text-muted mb-1">{label}</p>
              <p className="font-display text-3xl font-bold">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

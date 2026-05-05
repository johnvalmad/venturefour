import { useMemo } from 'react'

const STATUS_COLORS = {
  todo:        { bg: '#EDEAE2', border: '#8A8680' },
  in_progress: { bg: '#DBEAFE', border: '#1D4ED8' },
  blocked:     { bg: '#FEE2E2', border: '#B91C1C' },
  done:        { bg: '#DCFCE7', border: '#15803D' },
}

const STATUS_LABELS = {
  todo: 'To Do', in_progress: 'In Progress', blocked: 'Blocked', done: 'Done',
}

const ROW_H = 38
const LABEL_W = 220

export default function GanttSection({ ideas, tasks }) {
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const rangeEnd = useMemo(() => {
    const dates = []
    ideas.forEach(i => { if (i.deadline) dates.push(new Date(i.deadline + 'T00:00:00')) })
    tasks.forEach(t => { if (t.due) dates.push(new Date(t.due + 'T00:00:00')) })
    const minEnd = new Date(today)
    minEnd.setDate(minEnd.getDate() + 90)
    dates.push(minEnd)
    return new Date(Math.max(...dates.map(d => d.getTime())))
  }, [ideas, tasks, today])

  const totalMs = rangeEnd.getTime() - today.getTime()

  function toPct(dateStr) {
    if (!dateStr) return null
    const d = new Date(dateStr + 'T00:00:00')
    const raw = (d.getTime() - today.getTime()) / totalMs * 100
    return Math.max(0, Math.min(100, raw))
  }

  // Month labels for header
  const monthMarkers = useMemo(() => {
    const markers = []
    const cur = new Date(today)
    cur.setDate(1)
    cur.setMonth(cur.getMonth() + 1) // start from next month boundary
    while (cur <= rangeEnd) {
      const p = (cur.getTime() - today.getTime()) / totalMs * 100
      if (p >= 0 && p <= 100) {
        markers.push({
          label: cur.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          pct: p,
        })
      }
      cur.setMonth(cur.getMonth() + 1)
    }
    return markers
  }, [today, rangeEnd, totalMs])

  // Week grid lines
  const weekLines = useMemo(() => {
    const lines = []
    const cur = new Date(today)
    cur.setDate(cur.getDate() + 7)
    while (cur <= rangeEnd) {
      lines.push((cur.getTime() - today.getTime()) / totalMs * 100)
      cur.setDate(cur.getDate() + 7)
    }
    return lines
  }, [today, rangeEnd, totalMs])

  // Build rows: ideas + their linked tasks, then standalone tasks
  const rows = useMemo(() => {
    const result = []
    ideas.forEach(idea => {
      result.push({ type: 'idea', item: idea })
      tasks
        .filter(t => t.idea_id === idea.id)
        .forEach(t => result.push({ type: 'task', item: t }))
    })
    const standalone = tasks.filter(t => !t.idea_id)
    if (standalone.length > 0) {
      if (ideas.length > 0) result.push({ type: 'divider' })
      standalone.forEach(t => result.push({ type: 'task', item: t }))
    }
    return result
  }, [ideas, tasks])

  if (ideas.length === 0 && tasks.length === 0) return null

  return (
    <section id="timeline" className="max-w-6xl mx-auto px-6 py-14 border-t border-border">
      <p className="tag text-accent mb-8">04 — Timeline</p>

      <div className="border border-border rounded-2xl overflow-hidden">

        {/* Header */}
        <div className="flex bg-surface border-b border-border" style={{ height: 36 }}>
          <div
            style={{ width: LABEL_W, minWidth: LABEL_W }}
            className="shrink-0 border-r border-border flex items-center px-4"
          >
            <span className="text-xs font-display font-semibold text-muted">Item</span>
          </div>
          <div className="flex-1 relative overflow-hidden">
            {weekLines.map((p, i) => (
              <div
                key={i}
                className="absolute top-0 h-full border-l border-border/40"
                style={{ left: `${p}%` }}
              />
            ))}
            {monthMarkers.map((m, i) => (
              <div
                key={i}
                className="absolute top-0 h-full flex items-center"
                style={{ left: `${m.pct}%` }}
              >
                <span className="text-xs font-display text-muted pl-1.5 whitespace-nowrap select-none">
                  {m.label}
                </span>
              </div>
            ))}
            {/* Today label */}
            <div className="absolute top-0 h-full flex items-center" style={{ left: '0.5%' }}>
              <span className="text-xs font-display font-semibold text-accent whitespace-nowrap select-none">
                Today
              </span>
            </div>
          </div>
        </div>

        {/* Rows */}
        {rows.map((row, i) => {
          if (row.type === 'divider') {
            return (
              <div key={`divider-${i}`} className="flex border-b border-border bg-surface/60" style={{ height: 28 }}>
                <div
                  style={{ width: LABEL_W, minWidth: LABEL_W }}
                  className="shrink-0 border-r border-border flex items-center px-4"
                >
                  <span className="text-xs font-display font-semibold text-muted/60 uppercase tracking-widest">
                    Other Tasks
                  </span>
                </div>
                <div className="flex-1 relative overflow-hidden">
                  {weekLines.map((p, wi) => (
                    <div key={wi} className="absolute top-0 h-full border-l border-border/30" style={{ left: `${p}%` }} />
                  ))}
                  <div className="absolute top-0 h-full border-l-2 border-accent/50" style={{ left: '0%' }} />
                </div>
              </div>
            )
          }

          const { type, item } = row
          const isIdea = type === 'idea'
          const isBanded = i % 2 === 0

          return (
            <div
              key={item.id}
              className={`flex border-b border-border last:border-b-0 ${isBanded ? '' : 'bg-surface/30'}`}
              style={{ height: ROW_H }}
            >
              {/* Label */}
              <div
                style={{ width: LABEL_W, minWidth: LABEL_W }}
                className={`shrink-0 border-r border-border flex items-center overflow-hidden ${isIdea ? 'px-3' : 'pl-7 pr-3'}`}
              >
                {isIdea && (
                  <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mr-2" />
                )}
                <span className={`text-xs truncate ${isIdea ? 'font-display font-semibold' : 'text-muted'}`}>
                  {isIdea ? (item.title || 'Untitled') : (item.text || 'Untitled task')}
                </span>
              </div>

              {/* Timeline area */}
              <div className="flex-1 relative overflow-hidden">
                {/* Week grid */}
                {weekLines.map((p, wi) => (
                  <div key={wi} className="absolute top-0 h-full border-l border-border/30" style={{ left: `${p}%` }} />
                ))}

                {/* Today line */}
                <div className="absolute top-0 h-full border-l-2 border-accent/50 z-10" style={{ left: '0%' }} />

                {/* Idea bar */}
                {isIdea && item.deadline && (() => {
                  const endPct = toPct(item.deadline)
                  if (endPct === null || endPct <= 0) return null
                  const progress = Math.max(0, Math.min(100, item.progress || 0))
                  return (
                    <div
                      className="absolute rounded-full overflow-hidden z-20"
                      style={{
                        left: '1%',
                        width: `${endPct - 1}%`,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        height: 14,
                        background: '#EDEAE2',
                        border: '1px solid #D8D4CC',
                      }}
                    >
                      <div
                        style={{
                          width: `${progress}%`,
                          height: '100%',
                          background: '#FF4D1C',
                          borderRadius: 9999,
                        }}
                      />
                    </div>
                  )
                })()}

                {/* Idea deadline flag (when no deadline, show nothing) */}
                {isIdea && !item.deadline && (
                  <span
                    className="absolute text-xs text-muted/50 italic"
                    style={{ left: '1%', top: '50%', transform: 'translateY(-50%)' }}
                  >
                    no deadline
                  </span>
                )}

                {/* Task diamond marker */}
                {!isIdea && item.due && (() => {
                  const p = toPct(item.due)
                  if (p === null) return null
                  const status = item.status || (item.done ? 'done' : 'todo')
                  const col = STATUS_COLORS[status] || STATUS_COLORS.todo
                  return (
                    <div
                      className="absolute z-20"
                      style={{
                        left: `${p}%`,
                        top: '50%',
                        transform: 'translate(-50%, -50%) rotate(45deg)',
                        width: 10,
                        height: 10,
                        background: col.bg,
                        border: `2px solid ${col.border}`,
                        borderRadius: 2,
                      }}
                    />
                  )
                })()}

                {/* Task with no due date */}
                {!isIdea && !item.due && (
                  <span
                    className="absolute text-xs text-muted/40 italic"
                    style={{ left: '1%', top: '50%', transform: 'translateY(-50%)' }}
                  >
                    no date
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-4 flex-wrap">
        <span className="tag text-muted">Tasks:</span>
        {Object.entries(STATUS_LABELS).map(([val, label]) => {
          const col = STATUS_COLORS[val]
          return (
            <div key={val} className="flex items-center gap-1.5">
              <div style={{
                width: 9, height: 9,
                background: col.bg,
                border: `2px solid ${col.border}`,
                borderRadius: 2,
                transform: 'rotate(45deg)',
              }} />
              <span className="tag text-muted">{label}</span>
            </div>
          )
        })}
        <span className="tag text-muted ml-4">Ideas:</span>
        <div className="flex items-center gap-1.5">
          <div className="rounded-full overflow-hidden" style={{ width: 28, height: 10, background: '#EDEAE2', border: '1px solid #D8D4CC' }}>
            <div style={{ width: '50%', height: '100%', background: '#FF4D1C', borderRadius: 9999 }} />
          </div>
          <span className="tag text-muted">Progress to deadline</span>
        </div>
      </div>
    </section>
  )
}

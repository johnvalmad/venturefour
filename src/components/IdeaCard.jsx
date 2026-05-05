import { useState, useCallback, Fragment } from 'react'
import { db } from '../lib/supabase'
import EditableField from './EditableField'

const EFFORT_COLORS = {
  Low: 'bg-green-100 text-green-700',
  Medium: 'bg-amber-100 text-amber-700',
  High: 'bg-red-100 text-red-700',
}

const debounceTimers = {}
function debounce(key, fn, ms = 600) {
  clearTimeout(debounceTimers[key])
  debounceTimers[key] = setTimeout(fn, ms)
}

function calcProgress(fields, effort) {
  const filled = Object.values(fields).filter(v => (v || '').trim()).length
  const total = Object.keys(fields).length + 1 // +1 for effort
  return Math.round(((filled + (effort ? 1 : 0)) / total) * 100)
}

export default function IdeaCard({ idea, index, onDelete, tasks = [], setTasks }) {
  const [isOpen, setIsOpen] = useState(false)
  const [effort, setEffort] = useState(idea.effort || '')
  const [fields, setFields] = useState({
    title: idea.title || '',
    concept: idea.concept || '',
    description: idea.description || '',
    market: idea.market || '',
    revenue: idea.revenue || '',
    deadline: idea.deadline || '',
  })

  const progress = calcProgress(fields, effort)

  const handleField = useCallback((field, value) => {
    setFields(prev => {
      const next = { ...prev, [field]: value }
      const newProgress = calcProgress(next, effort)
      debounce(`idea-${idea.id}-${field}`, () => {
        db.from('ideas').update({ [field]: value, progress: newProgress }).eq('id', idea.id)
      })
      return next
    })
  }, [idea.id, effort])

  const handleEffort = (val) => {
    setEffort(val)
    setFields(prev => {
      const newProgress = calcProgress(prev, val)
      db.from('ideas').update({ effort: val, progress: newProgress }).eq('id', idea.id)
      return prev
    })
  }

  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-5 cursor-pointer hover:bg-surface/50 transition-colors"
        onClick={() => setIsOpen(o => !o)}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <span className="font-display font-bold text-2xl text-border w-8 shrink-0">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="min-w-0">
            <p className="font-display font-bold text-base leading-tight">{fields.title || 'Untitled'}</p>
            <p className="text-xs text-muted mt-0.5 truncate">{fields.concept}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-4 shrink-0">
          <div className="hidden md:flex gap-1">
            {(idea.tags || []).map(t => (
              <span key={t} className="tag px-2 py-0.5 rounded border border-border text-muted">{t}</span>
            ))}
          </div>
          {effort && (
            <span className={`tag px-2 py-0.5 rounded-full ${EFFORT_COLORS[effort] || 'bg-surface text-muted'}`}>
              {effort}
            </span>
          )}
          <svg
            width="16" height="16" viewBox="0 0 16 16" fill="none"
            style={{ transition: 'transform 0.25s ease', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-surface mx-6 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full"
          style={{ width: `${progress}%`, transition: 'width 0.4s ease' }}
        />
      </div>

      {/* Expandable body */}
      <div style={{
        maxHeight: isOpen ? '1000px' : '0',
        opacity: isOpen ? 1 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.35s ease, opacity 0.3s ease',
      }}>
        <div className="px-6 py-6 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-5">

          <div>
            <label className="tag text-muted block mb-2">Title</label>
            <EditableField
              value={fields.title}
              onInput={v => handleField('title', v)}
              placeholder="Idea name"
              className="text-sm font-display font-bold border border-border rounded-xl px-4 py-3 min-h-[44px]"
            />
          </div>

          <div>
            <label className="tag text-muted block mb-2">One-liner</label>
            <EditableField
              value={fields.concept}
              onInput={v => handleField('concept', v)}
              placeholder="One sentence concept"
              className="text-sm border border-border rounded-xl px-4 py-3 min-h-[44px]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="tag text-muted block mb-2">Description</label>
            <EditableField
              value={fields.description}
              onInput={v => handleField('description', v)}
              placeholder="Add a full description of this idea…"
              className="min-h-[72px] text-sm leading-relaxed border border-border rounded-xl px-4 py-3"
            />
          </div>

          <div>
            <label className="tag text-muted block mb-2">Target Market</label>
            <EditableField
              value={fields.market}
              onInput={v => handleField('market', v)}
              placeholder="Who is this for?"
              className="text-sm border border-border rounded-xl px-4 py-3 min-h-[44px]"
            />
          </div>

          <div>
            <label className="tag text-muted block mb-2">Revenue Model</label>
            <EditableField
              value={fields.revenue}
              onInput={v => handleField('revenue', v)}
              placeholder="How does this make money?"
              className="text-sm border border-border rounded-xl px-4 py-3 min-h-[44px]"
            />
          </div>

          <div>
            <label className="tag text-muted block mb-2">Effort Estimate</label>
            <div className="flex border border-border rounded-xl overflow-hidden">
              {['Low', 'Medium', 'High'].map((e, i) => (
                <Fragment key={e}>
                  {i > 0 && <div className="w-px bg-border" />}
                  <button
                    className="flex-1 py-2 text-xs font-display font-semibold hover:bg-surface"
                    style={{
                      background: effort === e ? '#0A0A0A' : '',
                      color: effort === e ? '#F5F2EB' : '',
                      transition: 'background 0.15s, color 0.15s',
                    }}
                    onClick={ev => { ev.stopPropagation(); handleEffort(e) }}
                  >
                    {e}
                  </button>
                </Fragment>
              ))}
            </div>
          </div>

          <div>
            <label className="tag text-muted block mb-2">MVP Deadline</label>
            <EditableField
              value={fields.deadline}
              onInput={v => handleField('deadline', v)}
              placeholder="Week # or date"
              className="text-sm border border-border rounded-xl px-4 py-3 min-h-[44px]"
            />
          </div>

          <div className="md:col-span-2 border-t border-border pt-5">
            <div className="flex items-center justify-between mb-3">
              <label className="tag text-muted">Tasks ({tasks.length})</label>
              <button
                onClick={async (e) => {
                  e.stopPropagation()
                  const newTask = { text: '', owner: '', due: '', done: false, idea_id: idea.id, sort_order: 0 }
                  const { data, error } = await db.from('tasks').insert(newTask).select().single()
                  if (!error && data) setTasks(prev => [...prev, data])
                }}
                className="text-xs font-display font-semibold text-muted hover:text-accent transition-colors"
              >
                + Add task
              </button>
            </div>
            {tasks.length === 0 ? (
              <p className="text-xs text-muted italic">No tasks linked — assign from the Tasks section or add one here.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {tasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 bg-surface rounded-xl px-4 py-2.5 group/task">
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={async () => {
                        const newDone = !task.done
                        const newStatus = newDone ? 'done' : 'todo'
                        await db.from('tasks').update({ done: newDone, status: newStatus }).eq('id', task.id)
                        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: newDone, status: newStatus } : t))
                      }}
                      className="w-4 h-4 rounded shrink-0 cursor-pointer accent-[#FF4D1C]"
                    />
                    <span className={`text-sm flex-1 ${task.done ? 'line-through text-muted' : ''}`}>
                      {task.text || <span className="text-muted italic">Untitled task</span>}
                    </span>
                    {task.owner && (
                      <span className="tag text-muted">{task.owner}</span>
                    )}
                    <button
                      onClick={async (e) => {
                        e.stopPropagation()
                        await db.from('tasks').delete().eq('id', task.id)
                        setTasks(prev => prev.filter(t => t.id !== task.id))
                      }}
                      className="opacity-0 group-hover/task:opacity-100 text-muted hover:text-accent transition-all"
                    >
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M2 3.5h9M5 3.5V2.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M10.5 3.5l-.6 7a.5.5 0 01-.5.5H3.6a.5.5 0 01-.5-.5l-.6-7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full"
                  style={{ width: `${progress}%`, transition: 'width 0.4s ease' }}
                />
              </div>
              <span className="tag text-muted">{progress}% filled</span>
            </div>
            <button
              onClick={() => onDelete(idea.id)}
              className="text-xs text-muted hover:text-accent transition-colors tag"
            >
              Delete
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

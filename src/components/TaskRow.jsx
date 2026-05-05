import { useState, useEffect, useRef, useCallback } from 'react'
import { OWNERS } from '../data/constants'
import { db } from '../lib/supabase'

const STATUS_OPTIONS = [
  { value: 'todo',        label: 'To Do',      color: 'bg-surface text-muted' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  { value: 'blocked',     label: 'Blocked',     color: 'bg-red-100 text-red-700' },
  { value: 'done',        label: 'Done',        color: 'bg-green-100 text-green-700' },
]

const PRIORITY_OPTIONS = [
  { value: 'Low',    color: 'bg-green-100 text-green-700' },
  { value: 'Medium', color: 'bg-amber-100 text-amber-700' },
  { value: 'High',   color: 'bg-red-100 text-red-700' },
]

export default function TaskRow({ task, onUpdate, onDelete, ideas = [] }) {
  const [isOpen,   setIsOpen]   = useState(false)
  const [status,   setStatus]   = useState(task.status || (task.done ? 'done' : 'todo'))
  const [priority, setPriority] = useState(task.priority || '')
  const [owner,    setOwner]    = useState(task.owner || '')
  const [due,      setDue]      = useState(task.due || '')
  const [ideaId,   setIdeaId]   = useState(task.idea_id || '')
  const [notes,    setNotes]    = useState(task.notes || '')
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const textRef    = useRef(null)
  const pendingRef = useRef({})
  const timerRef   = useRef(null)

  useEffect(() => {
    if (textRef.current) textRef.current.textContent = task.text ?? ''
  }, [])

  const flushSave = useCallback(async () => {
    const updates = pendingRef.current
    if (!Object.keys(updates).length) return
    pendingRef.current = {}
    setSaving(true)
    const { error } = await db.from('tasks').update(updates).eq('id', task.id)
    setSaving(false)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    }
  }, [task.id])

  function autoSave(updates) {
    pendingRef.current = { ...pendingRef.current, ...updates }
    onUpdate(task.id, updates)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(flushSave, 600)
  }

  function handleStatus(val) {
    setStatus(val)
    autoSave({ status: val, done: val === 'done' })
  }

  function handlePriority(val) {
    setPriority(prev => {
      const next = prev === val ? '' : val
      autoSave({ priority: next })
      return next
    })
  }

  function handleOwner(val) {
    setOwner(val)
    autoSave({ owner: val })
  }

  function handleDue(val) {
    setDue(val)
    autoSave({ due: val })
  }

  function handleIdeaId(val) {
    setIdeaId(val)
    autoSave({ idea_id: val || null })
  }

  function handleNotes(val) {
    setNotes(val)
    autoSave({ notes: val })
  }

  function handleTextInput() {
    const text = textRef.current?.textContent ?? ''
    autoSave({ text })
  }

  function quickToggle() {
    const next   = status === 'done' ? 'todo' : 'done'
    setStatus(next)
    autoSave({ status: next, done: next === 'done' })
  }

  const statusConfig   = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0]
  const priorityConfig = PRIORITY_OPTIONS.find(p => p.value === priority)

  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden animate-fade-in">

      {/* ── Collapsed row ── */}
      <div className="flex items-center gap-3 px-5 py-3 group">
        <input
          type="checkbox"
          checked={status === 'done'}
          onChange={quickToggle}
          className="w-4 h-4 rounded shrink-0 cursor-pointer accent-[#FF4D1C]"
        />

        <div
          ref={textRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleTextInput}
          data-placeholder="Describe this task…"
          className={`flex-1 text-sm focus:outline-none ${status === 'done' ? 'line-through text-muted' : ''}`}
        />

        <div className="hidden sm:flex items-center gap-2 shrink-0">
          {saving && <span className="tag text-muted animate-pulse">saving…</span>}
          {saved  && !saving && <span className="tag text-green-600">✓</span>}
          {priorityConfig && (
            <span className={`tag px-2 py-0.5 rounded-full ${priorityConfig.color}`}>{priority}</span>
          )}
          <span className={`tag px-2 py-0.5 rounded-full ${statusConfig.color}`}>{statusConfig.label}</span>
          {owner && <span className="tag text-muted">{owner}</span>}
          {due   && <span className="tag text-muted">{due}</span>}
        </div>

        <button
          onClick={() => setIsOpen(o => !o)}
          className="opacity-0 group-hover:opacity-100 text-muted hover:text-accent transition-all shrink-0"
          title={isOpen ? 'Collapse' : 'Expand'}
        >
          <svg
            width="14" height="14" viewBox="0 0 16 16" fill="none"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
          >
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 text-muted hover:text-accent transition-all shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* ── Expanded panel ── */}
      <div style={{
        maxHeight: isOpen ? '700px' : '0',
        opacity:   isOpen ? 1 : 0,
        overflow:  'hidden',
        transition: 'max-height 0.35s ease, opacity 0.25s ease',
      }}>
        <div className="px-5 pt-4 pb-5 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Status */}
          <div>
            <label className="tag text-muted block mb-2">Status</label>
            <div className="flex border border-border rounded-xl overflow-hidden">
              {STATUS_OPTIONS.map((s, i) => (
                <button
                  key={s.value}
                  className="flex-1 py-2 text-xs font-display font-semibold transition-colors hover:bg-surface"
                  style={{
                    background: status === s.value ? '#0A0A0A' : '',
                    color:      status === s.value ? '#F5F2EB' : '',
                    borderLeft: i > 0 ? '1px solid #D8D4CC' : 'none',
                  }}
                  onClick={() => handleStatus(s.value)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="tag text-muted block mb-2">Priority</label>
            <div className="flex border border-border rounded-xl overflow-hidden">
              {PRIORITY_OPTIONS.map((p, i) => (
                <button
                  key={p.value}
                  className="flex-1 py-2 text-xs font-display font-semibold transition-colors hover:bg-surface"
                  style={{
                    background: priority === p.value ? '#0A0A0A' : '',
                    color:      priority === p.value ? '#F5F2EB' : '',
                    borderLeft: i > 0 ? '1px solid #D8D4CC' : 'none',
                  }}
                  onClick={() => handlePriority(p.value)}
                >
                  {p.value}
                </button>
              ))}
            </div>
          </div>

          {/* Owner */}
          <div>
            <label className="tag text-muted block mb-2">Owner</label>
            <select
              value={owner}
              onChange={e => handleOwner(e.target.value)}
              className="w-full text-sm border border-border rounded-xl px-4 py-2.5 bg-transparent font-display font-semibold cursor-pointer"
            >
              <option value="">No owner</option>
              {OWNERS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>

          {/* Due date */}
          <div>
            <label className="tag text-muted block mb-2">Due Date</label>
            <input
              type="date"
              value={due}
              onChange={e => handleDue(e.target.value)}
              className="w-full text-sm border border-border rounded-xl px-4 py-2.5 bg-transparent cursor-pointer"
            />
          </div>

          {/* Linked idea */}
          <div>
            <label className="tag text-muted block mb-2">Linked Idea</label>
            <select
              value={ideaId}
              onChange={e => handleIdeaId(e.target.value)}
              className="w-full text-sm border border-border rounded-xl px-4 py-2.5 bg-transparent font-display font-semibold cursor-pointer"
            >
              <option value="">No idea</option>
              {ideas.map(idea => (
                <option key={idea.id} value={idea.id}>{idea.title || 'Untitled'}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="tag text-muted block mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={e => handleNotes(e.target.value)}
              placeholder="Add context, links, or details…"
              rows={3}
              className="w-full text-sm border border-border rounded-xl px-4 py-3 bg-transparent resize-none focus:outline-none leading-relaxed placeholder:text-muted/60"
            />
          </div>

        </div>
      </div>
    </div>
  )
}

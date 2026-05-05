import { useEffect, useRef } from 'react'
import { OWNERS } from '../data/constants'
import { db } from '../lib/supabase'

const debounceTimers = {}
function debounce(key, fn, ms = 600) {
  clearTimeout(debounceTimers[key])
  debounceTimers[key] = setTimeout(fn, ms)
}

export default function TaskRow({ task, onToggle, onDelete }) {
  const textRef = useRef(null)

  useEffect(() => {
    if (textRef.current) textRef.current.textContent = task.text ?? ''
  }, []) // mount only

  return (
    <div className="flex items-center gap-3 bg-white border border-border rounded-xl px-5 py-3 group animate-fade-in">
      <input
        type="checkbox"
        defaultChecked={task.done}
        onChange={() => onToggle(task.id)}
        className="w-4 h-4 rounded shrink-0 cursor-pointer accent-[#FF4D1C]"
      />
      <div
        ref={textRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Describe this task…"
        className={`flex-1 text-sm focus:outline-none ${task.done ? 'line-through text-muted' : ''}`}
        onInput={e => {
          const val = e.currentTarget.textContent
          debounce(`task-${task.id}-text`, () => {
            db.from('tasks').update({ text: val }).eq('id', task.id)
          })
        }}
      />
      <select
        defaultValue={task.owner}
        onChange={e => db.from('tasks').update({ owner: e.target.value }).eq('id', task.id)}
        className="text-xs border border-border rounded-lg px-2 py-1 bg-transparent font-display font-semibold cursor-pointer"
      >
        <option value="">Owner</option>
        {OWNERS.map(o => <option key={o}>{o}</option>)}
      </select>
      <input
        type="text"
        defaultValue={task.due}
        placeholder="Due date"
        onChange={e => {
          const val = e.target.value
          debounce(`task-${task.id}-due`, () => {
            db.from('tasks').update({ due: val }).eq('id', task.id)
          }, 400)
        }}
        className="text-xs border border-border rounded-lg px-2 py-1 w-28 text-center bg-transparent"
      />
      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 text-muted hover:text-accent transition-all ml-1"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

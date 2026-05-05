import { db } from '../lib/supabase'
import TaskRow from './TaskRow'

export default function TasksSection({ tasks, setTasks }) {
  async function addTask() {
    const newTask = { text: '', owner: '', due: '', done: false, sort_order: tasks.length }
    const { data, error } = await db.from('tasks').insert(newTask).select().single()
    if (error) {
      console.error('Failed to add task:', error)
      alert(`Could not add task: ${error.message}`)
      return
    }
    setTasks(prev => [...prev, data])
  }

  async function toggleTask(id) {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    const newDone = !task.done
    await db.from('tasks').update({ done: newDone }).eq('id', id)
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: newDone } : t))
  }

  async function deleteTask(id) {
    await db.from('tasks').delete().eq('id', id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  return (
    <section id="tasks" className="max-w-6xl mx-auto px-6 py-14">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <p className="tag text-accent">03 — Action Items</p>
        <button
          onClick={addTask}
          className="flex items-center gap-2 text-xs font-display font-semibold border border-border rounded-lg px-4 py-2 hover:bg-surface transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6h8M6 2v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Add task
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {tasks.map(task => (
          <TaskRow key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
        ))}
      </div>
      {tasks.length === 0 && (
        <p className="text-xs text-muted mt-6 italic">No tasks yet — click "Add task" to get started.</p>
      )}
    </section>
  )
}

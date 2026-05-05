import { useState, useEffect } from 'react'
import { db } from './lib/supabase'
import Nav from './components/Nav'
import Hero from './components/Hero'
import TeamSection from './components/TeamSection'
import IdeasSection from './components/IdeasSection'
import TasksSection from './components/TasksSection'

export default function App() {
  const [ideas, setIdeas] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      const [{ data: ideasData, error: e1 }, { data: tasksData, error: e2 }] = await Promise.all([
        db.from('ideas').select('*').order('sort_order'),
        db.from('tasks').select('*').order('sort_order'),
      ])
      if (e1 || e2) {
        setError((e1 || e2).message)
        setLoading(false)
        return
      }
      setIdeas(ideasData || [])
      setTasks(tasksData || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="fixed inset-0 bg-paper flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 bg-accent rounded-sm animate-pulse" />
          <p className="tag text-muted">Loading board…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-paper flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center max-w-sm px-6">
          <div className="w-6 h-6 bg-accent rounded-sm" />
          <p className="font-display font-bold">Could not connect</p>
          <p className="text-xs text-muted">{error}</p>
        </div>
      </div>
    )
  }

  const tasksDone = tasks.filter(t => t.done).length

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="noise" />
      <Nav />
      <Hero ideasCount={ideas.length} tasksDone={tasksDone} tasksTotal={tasks.length} />
      <TeamSection />
      <IdeasSection ideas={ideas} setIdeas={setIdeas} />
      <TasksSection tasks={tasks} setTasks={setTasks} />
      <footer className="border-t border-border py-8 text-center">
        <p className="text-xs text-muted">AI Venture Board · VentureFour · 2026</p>
      </footer>
    </div>
  )
}

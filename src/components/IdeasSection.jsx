import { db } from '../lib/supabase'
import IdeaCard from './IdeaCard'

export default function IdeasSection({ ideas, setIdeas, tasks = [], setTasks }) {
  async function addIdea() {
    const id = 'idea-' + Date.now()
    const newIdea = {
      id, title: 'New Idea', concept: '', description: '',
      market: '', revenue: '', effort: '', deadline: '',
      tags: [], progress: 0, sort_order: ideas.length,
    }
    const { data, error } = await db.from('ideas').insert(newIdea).select().single()
    if (error) {
      console.error('Failed to add idea:', error)
      alert(`Could not add idea: ${error.message}`)
      return
    }
    setIdeas(prev => [...prev, data])
  }

  async function deleteIdea(id) {
    if (!confirm('Delete this idea?')) return
    const { error } = await db.from('ideas').delete().eq('id', id)
    if (error) { console.error('Failed to delete idea:', error); return }
    setIdeas(prev => prev.filter(i => i.id !== id))
  }

  return (
    <section id="ideas" className="max-w-6xl mx-auto px-6 py-14 border-b border-border">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <p className="tag text-accent">02 — Project Ideas</p>
        <button
          onClick={addIdea}
          className="flex items-center gap-2 text-xs font-display font-semibold border border-border rounded-lg px-4 py-2 hover:bg-surface transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6h8M6 2v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Add idea
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {ideas.map((idea, index) => (
          <IdeaCard
            key={idea.id}
            idea={idea}
            index={index}
            onDelete={deleteIdea}
            tasks={tasks.filter(t => t.idea_id === idea.id)}
            setTasks={setTasks}
          />
        ))}
      </div>
    </section>
  )
}

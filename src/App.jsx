import { useEffect, useMemo, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'taskmate-tasks'

function readTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(saved) ? saved.filter((task) => task && typeof task.title === 'string') : []
  } catch {
    return []
  }
}

function makeTaskId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `task-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function App() {
  const [tasks, setTasks] = useState(readTasks)
  const [draft, setDraft] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    } catch {
      // Tasks remain usable for this session even when browser storage is unavailable.
    }
  }, [tasks])

  const completed = tasks.filter((task) => task.done).length
  const remaining = tasks.length - completed
  const visibleTasks = useMemo(() => tasks.filter((task) => filter === 'all' || (filter === 'active' ? !task.done : task.done)), [tasks, filter])

  function addTask(event) {
    event?.preventDefault()
    const title = draft.trim()
    if (!title) return
    setTasks((current) => [{ id: makeTaskId(), title, done: false, createdAt: new Date().toISOString() }, ...current])
    setDraft('')
    setFilter('all')
  }

  function toggleTask(id) {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, done: !task.done } : task))
  }

  function deleteTask(id) {
    setTasks((current) => current.filter((task) => task.id !== id))
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="TaskMate home"><span className="brand-mark">✓</span>TaskMate</a>
        <a className="nav-link" href="#tasks">MY TASK MANAGER <span aria-hidden="true">↗</span></a>
      </header>

      <main className="workspace" id="home">
        <section className="intro">
          <p className="eyebrow"><span className="eyebrow-dot" /> YOUR PERSONAL WORKSPACE</p>
          <h1>Make today <span>count.</span></h1>
          <p className="subtitle">Small steps every day lead to big results.</p>
        </section>

        <section className="stats" aria-label="Task summary">
          <article className="stat-card"><div className="stat-icon lavender">▤</div><div><p>Total Tasks</p><strong>{tasks.length}</strong></div><span className="stat-spark">↗</span></article>
          <article className="stat-card"><div className="stat-icon peach">⌛</div><div><p>Remaining</p><strong>{remaining}</strong></div><span className="stat-spark">◷</span></article>
          <article className="stat-card"><div className="stat-icon mint">✿</div><div><p>Completed</p><strong>{completed}</strong></div><span className="stat-spark">✦</span></article>
        </section>

        <section className="task-panel" id="tasks">
          <div className="panel-heading"><div><h2>My Tasks <span className="task-count">{tasks.length}</span></h2><p>Keep track of what matters today.</p></div><span className="today-pill"><span /> TODAY</span></div>
          <form className="add-form" onSubmit={addTask}>
            <label className="sr-only" htmlFor="new-task">What do you need to do?</label>
            <span className="input-icon" aria-hidden="true">✎</span>
            <input id="new-task" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="What do you need to do?" maxLength={160} />
            <button type="button" onClick={addTask}><span aria-hidden="true">＋</span> Add Task</button>
          </form>

          <div className="list-toolbar"><div className="filter-tabs" aria-label="Filter tasks">
            {[['all', 'All tasks'], ['active', 'To do'], ['completed', 'Completed']].map(([key, label]) => <button key={key} type="button" className={filter === key ? 'filter-tab selected' : 'filter-tab'} onClick={() => setFilter(key)}>{label}{key === 'active' && remaining > 0 ? <span className="filter-count">{remaining}</span> : null}</button>)}
          </div><span className="list-total">{visibleTasks.length} {visibleTasks.length === 1 ? 'task' : 'tasks'}</span></div>

          <div className="task-list" aria-live="polite">
            {visibleTasks.length ? visibleTasks.map((task) => <article className={`task-row${task.done ? ' is-done' : ''}`} key={task.id}>
              <button className="check-button" type="button" onClick={() => toggleTask(task.id)} aria-label={task.done ? `Mark ${task.title} as not done` : `Complete ${task.title}`}>{task.done ? '✓' : ''}</button>
              <div className="task-copy"><p>{task.title}</p><span><i className={task.done ? 'status-dot done' : 'status-dot'} />{task.done ? 'Completed' : 'In progress'}</span></div>
              <span className="task-date">{new Date(task.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              <button className="delete-button" type="button" onClick={() => deleteTask(task.id)} aria-label={`Delete ${task.title}`}>×</button>
            </article>) : <div className="empty-state"><div className="empty-icon">{filter === 'completed' ? '✦' : '✎'}</div><h3>{filter === 'completed' ? 'Nothing completed yet' : filter === 'active' ? 'You’re all caught up' : 'A fresh start'}</h3><p>{filter === 'completed' ? 'Finish a task and it’ll show up here.' : filter === 'active' ? 'Enjoy the breathing room, or add another task.' : 'Add your first task above and make today count.'}</p></div>}
          </div>
          {tasks.length > 0 && <footer className="panel-footer"><span><span className="footer-check">✓</span> Keep going, you’re doing great!</span><span>{completed} of {tasks.length} completed</span></footer>}
        </section>
        <p className="page-note">One thing at a time. You’ve got this. <span>✦</span></p>
      </main>
    </div>
  )
}

export default App

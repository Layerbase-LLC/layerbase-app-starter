import { useEffect, useState } from 'react'

type Todo = { id: number; title: string; done: boolean }

export function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [title, setTitle] = useState('')

  useEffect(() => {
    async function fetchAndSetTodos() {
      try {
        const res = await fetch('/api/todos')
        setTodos(await res.json())
      } catch (error: unknown) {
        console.error(error)
      }
    }
    fetchAndSetTodos()
  }, [])

  async function addTodo() {
    const trimmed = title.trim()
    if (!trimmed) return
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: trimmed }),
    })
    setTodos([...todos, await res.json()])
    setTitle('')
  }

  async function toggleTodo(id: number) {
    const res = await fetch(`/api/todos/${id}`, { method: 'PATCH' })
    const updated = await res.json()
    setTodos(todos.map((t) => (t.id === id ? updated : t)))
  }

  async function deleteTodo(id: number) {
    await fetch(`/api/todos/${id}`, { method: 'DELETE' })
    setTodos(todos.filter((t) => t.id !== id))
  }

  return (
    <main style={styles.main}>
      <h1 style={styles.heading}>Todos</h1>
      <p style={styles.sub}>
        A minimal Layerbase app: this page, its API, and a Postgres backing
        store, all in one container.
      </p>
      <div style={styles.row}>
        <input
          style={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          placeholder="What needs doing?"
        />
        <button style={styles.button} onClick={addTodo}>
          Add
        </button>
      </div>
      <ul style={styles.list}>
        {todos.map((todo) => (
          <li key={todo.id} style={styles.item}>
            <label style={styles.label}>
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggleTodo(todo.id)}
              />
              <span style={todo.done ? styles.doneText : undefined}>
                {todo.title}
              </span>
            </label>
            <button style={styles.delete} onClick={() => deleteTodo(todo.id)}>
              x
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    maxWidth: 480,
    margin: '10vh auto',
    padding: '0 1rem',
    fontFamily: 'system-ui, sans-serif',
  },
  heading: { margin: 0, fontSize: '1.5rem' },
  sub: { color: '#666', fontSize: '0.875rem', lineHeight: 1.5 },
  row: { display: 'flex', gap: 8, marginTop: '1.5rem' },
  input: {
    flex: 1,
    padding: '0.5rem 0.75rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: 6,
  },
  button: {
    padding: '0.5rem 1rem',
    fontSize: '1rem',
    border: 'none',
    borderRadius: 6,
    background: '#111',
    color: '#fff',
    cursor: 'pointer',
  },
  list: { listStyle: 'none', padding: 0, marginTop: '1.5rem' },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0',
    borderBottom: '1px solid #eee',
  },
  label: { display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' },
  doneText: { textDecoration: 'line-through', color: '#999' },
  delete: {
    border: 'none',
    background: 'none',
    color: '#999',
    cursor: 'pointer',
    fontSize: '1rem',
  },
}

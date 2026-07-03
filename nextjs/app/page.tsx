import { getPool } from '@/lib/db'
import { TodoList } from '@/components/todo-list'

// A server component reads the initial list straight from the backing store;
// the client component takes over for interactions via /api/todos.
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const { rows } = await getPool().query(
    'SELECT id, title, done FROM todo ORDER BY id',
  )
  return <TodoList initialTodos={rows} />
}

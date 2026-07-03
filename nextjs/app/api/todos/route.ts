import { getPool } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { rows } = await getPool().query(
    'SELECT id, title, done FROM todo ORDER BY id',
  )
  return Response.json(rows)
}

export async function POST(request: Request) {
  const body = (await request.json()) as { title?: string }
  const title = body.title?.trim()
  if (!title)
    return Response.json({ error: 'title is required' }, { status: 400 })
  const { rows } = await getPool().query(
    'INSERT INTO todo (title) VALUES ($1) RETURNING id, title, done',
    [title],
  )
  return Response.json(rows[0], { status: 201 })
}

import { getPool } from '@/lib/db'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(_request: Request, { params }: Params) {
  const { id } = await params
  const { rows } = await getPool().query(
    'UPDATE todo SET done = NOT done WHERE id = $1 RETURNING id, title, done',
    [id],
  )
  if (rows.length === 0) {
    return Response.json({ error: 'not found' }, { status: 404 })
  }
  return Response.json(rows[0])
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params
  await getPool().query('DELETE FROM todo WHERE id = $1', [id])
  return Response.json({ ok: true })
}

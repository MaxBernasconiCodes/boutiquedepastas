const { neon } = require('@neondatabase/serverless')

async function getSql() {
  const conn = process.env.NETLIFY_DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
  if (!conn) throw new Error('NETLIFY_DATABASE_URL_UNPOOLED or DATABASE_URL is not set')
  return neon(conn)
}

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }
}

exports.handler = async (event) => {
  const headers = cors()
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' }
  }

  try {
    const sql = await getSql()
    const method = event.httpMethod

    if (method === 'GET') {
      const rows = await sql`SELECT id, titulo, descripcion, costo, foto, archivado FROM products ORDER BY created_at DESC`
      const items = rows.map((r) => ({
        id: r.id,
        titulo: r.titulo,
        descripcion: r.descripcion || '',
        costo: Number(r.costo),
        foto: r.foto || undefined,
        archivado: Boolean(r.archivado),
      }))
      return { statusCode: 200, headers, body: JSON.stringify(items) }
    }

    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}')
      const id = String(Date.now())
      await sql`
        INSERT INTO products (id, titulo, descripcion, costo, foto, archivado)
        VALUES (${id}, ${body.titulo ?? ''}, ${body.descripcion ?? ''}, ${Number(body.costo) ?? 0}, ${body.foto ?? null}, false)
      `
      const item = {
        id,
        titulo: body.titulo ?? '',
        descripcion: body.descripcion ?? '',
        costo: Number(body.costo) ?? 0,
        foto: body.foto || undefined,
        archivado: false,
      }
      return { statusCode: 201, headers, body: JSON.stringify(item) }
    }

    if (method === 'PATCH') {
      const body = JSON.parse(event.body || '{}')
      const id = event.queryStringParameters?.id
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'id required' }) }
      if (typeof body.archivado !== 'undefined') {
        await sql`UPDATE products SET archivado = ${body.archivado} WHERE id = ${id}`
      }
      const [row] = await sql`SELECT id, titulo, descripcion, costo, foto, archivado FROM products WHERE id = ${id}`
      if (!row) return { statusCode: 404, headers, body: JSON.stringify({ error: 'not found' }) }
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          id: row.id,
          titulo: row.titulo,
          descripcion: row.descripcion || '',
          costo: Number(row.costo),
          foto: row.foto || undefined,
          archivado: Boolean(row.archivado),
        }),
      }
    }

    if (method === 'DELETE') {
      const id = event.queryStringParameters?.id
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'id required' }) }
      await sql`DELETE FROM products WHERE id = ${id}`
      return { statusCode: 204, headers, body: '' }
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'method not allowed' }) }
  } catch (err) {
    console.error('products function error:', err)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'Internal server error' }),
    }
  }
}

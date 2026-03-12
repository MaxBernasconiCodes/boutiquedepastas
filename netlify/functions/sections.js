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
      const rows = await sql`SELECT id, titulo, orden FROM sections ORDER BY orden ASC, id ASC`
      const items = rows.map((r) => ({
        id: r.id,
        titulo: r.titulo,
        orden: Number(r.orden),
      }))
      return { statusCode: 200, headers, body: JSON.stringify(items) }
    }

    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}')
      const id = String(Date.now())
      const orden = Number(body.orden) ?? 0
      await sql`
        INSERT INTO sections (id, titulo, orden)
        VALUES (${id}, ${body.titulo ?? ''}, ${orden})
      `
      const item = { id, titulo: body.titulo ?? '', orden }
      return { statusCode: 201, headers, body: JSON.stringify(item) }
    }

    if (method === 'PATCH') {
      const body = JSON.parse(event.body || '{}')
      const id = event.queryStringParameters?.id
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'id required' }) }
      if (body.titulo !== undefined) await sql`UPDATE sections SET titulo = ${body.titulo} WHERE id = ${id}`
      if (typeof body.orden === 'number') await sql`UPDATE sections SET orden = ${body.orden} WHERE id = ${id}`
      const [row] = await sql`SELECT id, titulo, orden FROM sections WHERE id = ${id}`
      if (!row) return { statusCode: 404, headers, body: JSON.stringify({ error: 'not found' }) }
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ id: row.id, titulo: row.titulo, orden: Number(row.orden) }),
      }
    }

    if (method === 'DELETE') {
      const id = event.queryStringParameters?.id
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'id required' }) }
      await sql`UPDATE products SET seccion_id = NULL WHERE seccion_id = ${id}`
      await sql`DELETE FROM sections WHERE id = ${id}`
      return { statusCode: 204, headers, body: '' }
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'method not allowed' }) }
  } catch (err) {
    console.error('sections function error:', err)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'Internal server error' }),
    }
  }
}

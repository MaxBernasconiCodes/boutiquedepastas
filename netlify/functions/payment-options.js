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
      const rows = await sql`SELECT id, nombre, descripcion FROM payment_options ORDER BY id`
      const items = rows.map((r) => ({
        id: r.id,
        nombre: r.nombre,
        descripcion: r.descripcion || undefined,
      }))
      return { statusCode: 200, headers, body: JSON.stringify(items) }
    }

    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}')
      const id = String(Date.now())
      await sql`
        INSERT INTO payment_options (id, nombre, descripcion)
        VALUES (${id}, ${body.nombre ?? ''}, ${body.descripcion ? body.descripcion : null})
      `
      const item = { id, nombre: body.nombre ?? '', descripcion: body.descripcion || undefined }
      return { statusCode: 201, headers, body: JSON.stringify(item) }
    }

    if (method === 'DELETE') {
      const id = event.queryStringParameters?.id
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'id required' }) }
      await sql`DELETE FROM payment_options WHERE id = ${id}`
      return { statusCode: 204, headers, body: '' }
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'method not allowed' }) }
  } catch (err) {
    console.error('payment-options function error:', err)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'Internal server error' }),
    }
  }
}

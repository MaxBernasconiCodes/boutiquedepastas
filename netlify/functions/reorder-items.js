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

/**
 * POST body: { items: [ { type: 'section', id }, { type: 'product', id }, ... ] }
 * Updates orden (0,1,2,...) for each and sets product.seccion_id to the section id immediately above.
 */
exports.handler = async (event) => {
  const headers = cors()
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' }
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'method not allowed' }) }
  }

  try {
    const body = JSON.parse(event.body || '{}')
    const items = Array.isArray(body.items) ? body.items : []
    if (items.length === 0) {
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) }
    }

    const sql = await getSql()
    let lastSectionId = null
    for (let i = 0; i < items.length; i++) {
      const { type, id } = items[i]
      if (!id) continue
      if (type === 'section') {
        await sql`UPDATE sections SET orden = ${i} WHERE id = ${id}`
        lastSectionId = id
      } else if (type === 'product') {
        await sql`UPDATE products SET orden = ${i}, seccion_id = ${lastSectionId} WHERE id = ${id}`
      }
    }

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) }
  } catch (err) {
    console.error('reorder-items error:', err)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'Internal server error' }),
    }
  }
}

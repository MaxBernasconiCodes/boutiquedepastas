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
      const rows = await sql`
        SELECT p.id, p.titulo, p.descripcion, p.costo, p.foto, p.archivado, p.seccion_id, p.orden
        FROM products p
        LEFT JOIN sections s ON p.seccion_id = s.id
        ORDER BY COALESCE(s.orden, 999), p.orden ASC, p.created_at DESC
      `
      const items = rows.map((r) => ({
        id: r.id,
        titulo: r.titulo,
        descripcion: r.descripcion || '',
        costo: Number(r.costo),
        foto: r.foto || undefined,
        archivado: Boolean(r.archivado),
        seccion_id: r.seccion_id || undefined,
        orden: Number(r.orden),
      }))
      return { statusCode: 200, headers, body: JSON.stringify(items) }
    }

    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}')
      const id = String(Date.now())
      const orden = typeof body.orden === 'number' ? body.orden : 0
      const seccionId = body.seccion_id || null
      await sql`
        INSERT INTO products (id, titulo, descripcion, costo, foto, archivado, seccion_id, orden)
        VALUES (${id}, ${body.titulo ?? ''}, ${body.descripcion ?? ''}, ${Number(body.costo) ?? 0}, ${body.foto ?? null}, false, ${seccionId}, ${orden})
      `
      const item = {
        id,
        titulo: body.titulo ?? '',
        descripcion: body.descripcion ?? '',
        costo: Number(body.costo) ?? 0,
        foto: body.foto || undefined,
        archivado: false,
        seccion_id: body.seccion_id || undefined,
        orden,
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
      if (body.seccion_id !== undefined) {
        await sql`UPDATE products SET seccion_id = ${body.seccion_id || null} WHERE id = ${id}`
      }
      if (typeof body.orden === 'number') {
        await sql`UPDATE products SET orden = ${body.orden} WHERE id = ${id}`
      }
      if (body.titulo !== undefined) {
        await sql`UPDATE products SET titulo = ${body.titulo} WHERE id = ${id}`
      }
      if (body.descripcion !== undefined) {
        await sql`UPDATE products SET descripcion = ${body.descripcion} WHERE id = ${id}`
      }
      if (body.costo !== undefined) {
        const costo = Number(body.costo)
        if (!Number.isNaN(costo)) await sql`UPDATE products SET costo = ${costo} WHERE id = ${id}`
      }
      if (body.foto !== undefined) {
        await sql`UPDATE products SET foto = ${body.foto || null} WHERE id = ${id}`
      }
      const [row] = await sql`
        SELECT id, titulo, descripcion, costo, foto, archivado, seccion_id, orden
        FROM products WHERE id = ${id}
      `
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
          seccion_id: row.seccion_id || undefined,
          orden: Number(row.orden),
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

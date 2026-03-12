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
      const [row] = await sql`SELECT titulo, descripcion, foto, telefono, email, instagram, facebook FROM about_us WHERE id = 1`
      if (!row) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            titulo: '',
            descripcion: '',
            foto: '',
            telefono: '',
            email: '',
            redes: { instagram: '', facebook: '' },
          }),
        }
      }
      const data = {
        titulo: row.titulo || '',
        descripcion: row.descripcion || '',
        foto: row.foto || '',
        telefono: row.telefono || '',
        email: row.email || '',
        redes: {
          instagram: row.instagram || '',
          facebook: row.facebook || '',
        },
      }
      return { statusCode: 200, headers, body: JSON.stringify(data) }
    }

    if (method === 'PUT') {
      const body = JSON.parse(event.body || '{}')
      const redes = body.redes || {}
      await sql`
        UPDATE about_us SET
          titulo = ${body.titulo ?? ''},
          descripcion = ${body.descripcion ?? ''},
          foto = ${body.foto ?? ''},
          telefono = ${body.telefono ?? ''},
          email = ${body.email ?? ''},
          instagram = ${redes.instagram ?? ''},
          facebook = ${redes.facebook ?? ''},
          updated_at = NOW()
        WHERE id = 1
      `
      const [row] = await sql`SELECT titulo, descripcion, foto, telefono, email, instagram, facebook FROM about_us WHERE id = 1`
      const data = {
        titulo: row?.titulo || '',
        descripcion: row?.descripcion || '',
        foto: row?.foto || '',
        telefono: row?.telefono || '',
        email: row?.email || '',
        redes: { instagram: row?.instagram || '', facebook: row?.facebook || '' },
      }
      return { statusCode: 200, headers, body: JSON.stringify(data) }
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'method not allowed' }) }
  } catch (err) {
    console.error('about function error:', err)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'Internal server error' }),
    }
  }
}

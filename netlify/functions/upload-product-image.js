const { getStore } = require('@netlify/blobs')

const STORE_NAME = 'product-images'

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }
}

function randomKey() {
  return `product-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`
}

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
    const dataUrl = body.base64 || body.fotoBase64
    if (!dataUrl || typeof dataUrl !== 'string') {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'base64 (data URL) required' }) }
    }

    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
    const base64 = match ? match[2] : dataUrl
    const contentType = (match && match[1]) || body.contentType || 'image/jpeg'
    const buffer = Buffer.from(base64, 'base64')

    const store = getStore({ name: STORE_NAME, consistency: 'strong' })
    const key = randomKey()
    await store.set(key, buffer, { metadata: { contentType } })

    const origin = event.headers['x-nf-request-url'] ? new URL(event.headers['x-nf-request-url']).origin : ''
    const url = `${origin}/.netlify/functions/serve-product-image?key=${encodeURIComponent(key)}`

    return { statusCode: 200, headers, body: JSON.stringify({ url, key }) }
  } catch (err) {
    console.error('upload-product-image error:', err)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'upload failed' }),
    }
  }
}

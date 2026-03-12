const { getStore } = require('@netlify/blobs')

const STORE_NAME = 'product-images'

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: '' }
  }
  const key = event.queryStringParameters?.key
  if (!key) {
    return { statusCode: 400, body: 'key required' }
  }

  try {
    const store = getStore({ name: STORE_NAME, consistency: 'strong' })
    const result = await store.getWithMetadata(key, { type: 'arrayBuffer' })
    if (!result || !result.data) {
      return { statusCode: 404, body: 'not found' }
    }

    const data = result.data
    const buf = Buffer.from(data)
    const base64 = buf.toString('base64')
    const contentType = result.metadata?.contentType || 'image/jpeg'

    return {
      statusCode: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
      body: base64,
      isBase64Encoded: true,
    }
  } catch (err) {
    console.error('serve-product-image error:', err)
    return { statusCode: 500, body: err.message || 'error' }
  }
}

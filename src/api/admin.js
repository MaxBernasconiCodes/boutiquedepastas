/**
 * Cliente para la API del panel de administración (Netlify Functions + Neon).
 * Base URL: /.netlify/functions (mismo origen en producción).
 */

const BASE = import.meta.env.VITE_API_BASE || ''

function request(path, options = {}) {
  const url = `${BASE}${path}`
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
}

/** Productos */
export async function apiProductsGet() {
  const res = await request('/.netlify/functions/products')
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function apiProductsPost(body) {
  const res = await request('/.netlify/functions/products', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function apiProductsPatch(id, body) {
  const res = await request(`/.netlify/functions/products?id=${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function apiProductsDelete(id) {
  const res = await request(`/.netlify/functions/products?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
  if (!res.ok && res.status !== 204) throw new Error(await res.text())
}

/** Secciones (títulos que agrupan productos) */
export async function apiSectionsGet() {
  const res = await request('/.netlify/functions/sections')
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function apiSectionsPost(body) {
  const res = await request('/.netlify/functions/sections', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function apiSectionsPatch(id, body) {
  const res = await request(`/.netlify/functions/sections?id=${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function apiSectionsDelete(id) {
  const res = await request(`/.netlify/functions/sections?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
  if (!res.ok && res.status !== 204) throw new Error(await res.text())
}

/** Subir imagen de producto a Netlify Blobs; devuelve la URL para guardar en Neon (campo foto). */
export async function apiUploadProductImage(base64DataUrl) {
  const res = await request('/.netlify/functions/upload-product-image', {
    method: 'POST',
    body: JSON.stringify({ base64: base64DataUrl }),
  })
  if (!res.ok) throw new Error(await res.text())
  const data = await res.json()
  return data.url
}

/** Opciones de pago */
export async function apiPaymentOptionsGet() {
  const res = await request('/.netlify/functions/payment-options')
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function apiPaymentOptionsPost(body) {
  const res = await request('/.netlify/functions/payment-options', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function apiPaymentOptionsDelete(id) {
  const res = await request(`/.netlify/functions/payment-options?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
  if (!res.ok && res.status !== 204) throw new Error(await res.text())
}

/** Opciones de envío */
export async function apiShippingOptionsGet() {
  const res = await request('/.netlify/functions/shipping-options')
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function apiShippingOptionsPost(body) {
  const res = await request('/.netlify/functions/shipping-options', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function apiShippingOptionsDelete(id) {
  const res = await request(`/.netlify/functions/shipping-options?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
  if (!res.ok && res.status !== 204) throw new Error(await res.text())
}

/** Sobre nosotros */
export async function apiAboutGet() {
  const res = await request('/.netlify/functions/about')
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function apiAboutPut(body) {
  const res = await request('/.netlify/functions/about', {
    method: 'PUT',
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

/**
 * Hidrata todos los stores desde la API (Neon).
 * Si falla (ej. sin DATABASE_URL o red), devuelve false y se pueden usar mocks.
 */
export async function hydrateFromApi() {
  try {
    const [products, sections, paymentOptions, shippingOptions, about] = await Promise.all([
      apiProductsGet(),
      apiSectionsGet(),
      apiPaymentOptionsGet(),
      apiShippingOptionsGet(),
      apiAboutGet(),
    ])
    return {
      products,
      sections,
      paymentOptions,
      shippingOptions,
      about,
    }
  } catch (e) {
    console.warn('API hydration failed, using local/mock data:', e.message)
    return null
  }
}

<script setup>
import { ref, computed } from 'vue'
import { useProductsStore } from '@/stores/products'
import { useSectionsStore } from '@/stores/sections'
import {
  apiProductsPost,
  apiProductsPatch,
  apiProductsDelete,
  apiUploadProductImage,
  apiSectionsGet,
  apiSectionsPost,
  apiSectionsPatch,
  apiSectionsDelete,
} from '@/api/admin'

const productsStore = useProductsStore()
const sectionsStore = useSectionsStore()
const form = ref({
  titulo: '',
  descripcion: '',
  costo: '',
  foto: '',
  seccion_id: '',
  orden: 0,
})
const sectionForm = ref({ titulo: '' })
const error = ref('')
const uploading = ref(false)
const editingProductId = ref(null)
const editForm = ref({
  titulo: '',
  descripcion: '',
  costo: '',
  foto: '',
  seccion_id: '',
  orden: 0,
})
const uploadingEdit = ref(false)

/** Productos agrupados por sección (para listar y reordenar) */
const itemsPorSeccion = computed(() => {
  const map = new Map()
  const sinSeccion = { section: null, products: [] }
  for (const p of productsStore.items) {
    const sid = p.seccion_id || null
    if (!sid) {
      sinSeccion.products.push(p)
      continue
    }
    if (!map.has(sid)) map.set(sid, { sectionId: sid, products: [] })
    map.get(sid).products.push(p)
  }
  const result = []
  const seccionesOrdenadas = [...sectionsStore.items].sort((a, b) => a.orden - b.orden)
  for (const sec of seccionesOrdenadas) {
    const block = map.get(sec.id)
    if (block) {
      block.section = sec
      block.products.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
      result.push(block)
    }
  }
  sinSeccion.products.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
  result.push({ section: null, sectionId: null, products: sinSeccion.products })
  return result
})

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function onFileChange(e) {
  const file = e.target?.files?.[0]
  if (!file || !file.type.startsWith('image/')) return
  error.value = ''
  uploading.value = true
  try {
    const dataUrl = await readFileAsDataUrl(file)
    const url = await apiUploadProductImage(dataUrl)
    form.value.foto = url
  } catch (err) {
    error.value = err.message || 'Error al subir la imagen. ¿Netlify Blobs está disponible?'
  } finally {
    uploading.value = false
    e.target.value = ''
  }
}

async function onFileChangeEdit(e) {
  const file = e.target?.files?.[0]
  if (!file || !file.type.startsWith('image/')) return
  error.value = ''
  uploadingEdit.value = true
  try {
    const dataUrl = await readFileAsDataUrl(file)
    const url = await apiUploadProductImage(dataUrl)
    editForm.value.foto = url
  } catch (err) {
    error.value = err.message || 'Error al subir la imagen.'
  } finally {
    uploadingEdit.value = false
    e.target.value = ''
  }
}

function startEdit(p) {
  editingProductId.value = p.id
  editForm.value = {
    titulo: p.titulo ?? '',
    descripcion: p.descripcion ?? '',
    costo: String(p.costo ?? ''),
    foto: p.foto ?? '',
    seccion_id: p.seccion_id ?? '',
    orden: p.orden ?? 0,
  }
  error.value = ''
}

function cancelEdit() {
  editingProductId.value = null
  error.value = ''
}

async function submitEdit() {
  const id = editingProductId.value
  if (!id) return
  const costo = Number(editForm.value.costo)
  if (!editForm.value.titulo?.trim() || Number.isNaN(costo)) return
  error.value = ''
  try {
    const payload = {
      titulo: editForm.value.titulo.trim(),
      descripcion: editForm.value.descripcion?.trim() ?? '',
      costo,
      foto: editForm.value.foto?.trim() || undefined,
      seccion_id: editForm.value.seccion_id || undefined,
      orden: Number(editForm.value.orden) || 0,
    }
    const updated = await apiProductsPatch(id, payload)
    productsStore.update(id, {
      ...updated,
      seccion_id: updated.seccion_id ?? undefined,
      orden: updated.orden ?? 0,
    })
    editingProductId.value = null
  } catch (e) {
    error.value = e.message || 'Error al guardar.'
  }
}

async function submit() {
  const costo = Number(form.value.costo)
  if (!form.value.titulo || Number.isNaN(costo)) return
  error.value = ''
  try {
    const payload = {
      titulo: form.value.titulo.trim(),
      descripcion: form.value.descripcion.trim(),
      costo,
      foto: form.value.foto.trim() || undefined,
      seccion_id: form.value.seccion_id || undefined,
      orden: Number(form.value.orden) || 0,
    }
    const item = await apiProductsPost(payload)
    productsStore.add(item, item.id)
    form.value = { titulo: '', descripcion: '', costo: '', foto: '', seccion_id: '', orden: 0 }
  } catch (e) {
    error.value = e.message || 'Error al crear. ¿Está configurada la base de datos (Neon)?'
  }
}

async function addSection() {
  const titulo = sectionForm.value.titulo?.trim()
  if (!titulo) return
  error.value = ''
  try {
    const orden = sectionsStore.items.length
    const item = await apiSectionsPost({ titulo, orden })
    sectionsStore.add(item, item.id)
    sectionForm.value.titulo = ''
  } catch (e) {
    error.value = e.message || 'Error al crear sección.'
  }
}

async function removeSection(id) {
  if (!confirm('¿Eliminar esta sección? Los productos quedarán sin sección.')) return
  error.value = ''
  try {
    await apiSectionsDelete(id)
    sectionsStore.remove(id)
    productsStore.items.forEach((p) => {
      if (p.seccion_id === id) productsStore.setSeccion(p.id, null)
    })
  } catch (e) {
    error.value = e.message || 'Error al eliminar sección.'
  }
}

async function sectionSubir(id) {
  const idx = sectionsStore.items.findIndex((s) => s.id === id)
  if (idx <= 0) return
  const prev = sectionsStore.items[idx - 1]
  const curr = sectionsStore.items[idx]
  const newOrdenCurr = prev.orden
  const newOrdenPrev = curr.orden
  error.value = ''
  try {
    await Promise.all([
      apiSectionsPatch(id, { orden: newOrdenCurr }),
      apiSectionsPatch(prev.id, { orden: newOrdenPrev }),
    ])
    sectionsStore.setOrden(id, newOrdenCurr)
    sectionsStore.setOrden(prev.id, newOrdenPrev)
  } catch (e) {
    error.value = e.message || 'Error al reordenar.'
  }
}

async function sectionBajar(id) {
  const idx = sectionsStore.items.findIndex((s) => s.id === id)
  if (idx < 0 || idx >= sectionsStore.items.length - 1) return
  const next = sectionsStore.items[idx + 1]
  const curr = sectionsStore.items[idx]
  const newOrdenCurr = next.orden
  const newOrdenNext = curr.orden
  error.value = ''
  try {
    await Promise.all([
      apiSectionsPatch(id, { orden: newOrdenCurr }),
      apiSectionsPatch(next.id, { orden: newOrdenNext }),
    ])
    sectionsStore.setOrden(id, newOrdenCurr)
    sectionsStore.setOrden(next.id, newOrdenNext)
  } catch (e) {
    error.value = e.message || 'Error al reordenar.'
  }
}

function getFlatProductList() {
  const out = []
  for (const group of itemsPorSeccion.value) {
    for (const p of group.products) out.push({ ...p, _sectionId: group.sectionId })
  }
  return out
}

async function productSubir(p) {
  const flat = getFlatProductList()
  const idx = flat.findIndex((x) => x.id === p.id)
  if (idx <= 0) return
  const prev = flat[idx - 1]
  if (prev._sectionId !== p.seccion_id) return
  const newOrdenCurr = prev.orden
  const newOrdenPrev = p.orden
  error.value = ''
  try {
    await Promise.all([
      apiProductsPatch(p.id, { orden: newOrdenCurr }),
      apiProductsPatch(prev.id, { orden: newOrdenPrev }),
    ])
    productsStore.setOrden(p.id, newOrdenCurr)
    productsStore.setOrden(prev.id, newOrdenPrev)
  } catch (e) {
    error.value = e.message || 'Error al reordenar.'
  }
}

async function productBajar(p) {
  const flat = getFlatProductList()
  const idx = flat.findIndex((x) => x.id === p.id)
  if (idx < 0 || idx >= flat.length - 1) return
  const next = flat[idx + 1]
  if (next._sectionId !== p.seccion_id) return
  const newOrdenCurr = next.orden
  const newOrdenNext = p.orden
  error.value = ''
  try {
    await Promise.all([
      apiProductsPatch(p.id, { orden: newOrdenCurr }),
      apiProductsPatch(next.id, { orden: newOrdenNext }),
    ])
    productsStore.setOrden(p.id, newOrdenCurr)
    productsStore.setOrden(next.id, newOrdenNext)
  } catch (e) {
    error.value = e.message || 'Error al reordenar.'
  }
}

async function archive(id) {
  error.value = ''
  try {
    await apiProductsPatch(id, { archivado: true })
    productsStore.setArchived(id, true)
  } catch (e) {
    error.value = e.message || 'Error al archivar.'
  }
}

async function unarchive(id) {
  error.value = ''
  try {
    await apiProductsPatch(id, { archivado: false })
    productsStore.setArchived(id, false)
  } catch (e) {
    error.value = e.message || 'Error al desarchivar.'
  }
}

async function remove(id) {
  if (!confirm('¿Eliminar este producto?')) return
  error.value = ''
  try {
    await apiProductsDelete(id)
    productsStore.remove(id)
  } catch (e) {
    error.value = e.message || 'Error al eliminar.'
  }
}
</script>

<template>
  <div class="admin-productos">
    <h2>Productos</h2>

    <section class="secciones-block">
      <h3>Secciones</h3>
      <p class="hint">Las secciones agrupan productos en la tienda. Ordená las secciones y los productos dentro de cada una.</p>
      <form class="form-inline" @submit.prevent="addSection">
        <input v-model="sectionForm.titulo" type="text" placeholder="Título de la sección" />
        <button type="submit">Crear sección</button>
      </form>
      <ul class="secciones-list">
        <li v-for="(sec, i) in [...sectionsStore.items].sort((a,b) => a.orden - b.orden)" :key="sec.id" class="section-row">
          <span class="section-titulo">{{ sec.titulo }}</span>
          <span class="section-orden">Orden {{ sec.orden }}</span>
          <div class="acciones">
            <button type="button" class="btn-small" :disabled="i === 0" title="Subir" @click="sectionSubir(sec.id)">↑</button>
            <button type="button" class="btn-small" :disabled="i === sectionsStore.items.length - 1" title="Bajar" @click="sectionBajar(sec.id)">↓</button>
            <button type="button" class="btn-small danger" @click="removeSection(sec.id)">Eliminar</button>
          </div>
        </li>
      </ul>
      <p v-if="sectionsStore.items.length === 0" class="empty">No hay secciones. Creá una para agrupar productos.</p>
    </section>

    <section class="form-nuevo">
      <h3>Nuevo producto</h3>
      <form @submit.prevent="submit">
        <label>
          Título
          <input v-model="form.titulo" type="text" required />
        </label>
        <label>
          Descripción
          <textarea v-model="form.descripcion" rows="2" />
        </label>
        <label>
          Costo ($)
          <input v-model="form.costo" type="number" step="0.01" min="0" required />
        </label>
        <label>
          Sección
          <select v-model="form.seccion_id">
            <option value="">— Sin sección —</option>
            <option v-for="s in [...sectionsStore.items].sort((a,b) => a.orden - b.orden)" :key="s.id" :value="s.id">{{ s.titulo }}</option>
          </select>
        </label>
        <label>
          Posición (orden dentro de la sección)
          <input v-model.number="form.orden" type="number" min="0" />
        </label>
        <label>
          URL de la foto
          <input v-model="form.foto" type="url" placeholder="https://... o subir archivo abajo" />
        </label>
        <label>
          O subir imagen
          <input
            type="file"
            accept="image/*"
            :disabled="uploading"
            @change="onFileChange"
          />
          <span v-if="uploading" class="uploading-hint">Subiendo…</span>
        </label>
        <button type="submit">Crear producto</button>
      </form>
      <p v-if="error" class="form-error">{{ error }}</p>
      <p class="netlify-hint">
        Los productos se guardan en Neon. La foto puede ser una URL o un archivo subido (Netlify Blobs). En local usá <code>netlify dev</code> para que la subida funcione.
      </p>
    </section>

    <section class="lista">
      <h3>Listado por sección</h3>
      <div v-for="group in itemsPorSeccion" :key="group.sectionId ?? 'sin-seccion'" class="product-group">
        <h4 class="group-title">{{ group.section?.titulo ?? 'Sin sección' }}</h4>
        <ul>
          <template v-for="p in group.products" :key="p.id">
            <li v-if="editingProductId === p.id" class="product-row product-edit-row">
              <form class="edit-form" @submit.prevent="submitEdit">
                <div class="edit-fields">
                  <label>
                    Título
                    <input v-model="editForm.titulo" type="text" required />
                  </label>
                  <label>
                    Descripción
                    <textarea v-model="editForm.descripcion" rows="2" />
                  </label>
                  <label>
                    Costo ($)
                    <input v-model="editForm.costo" type="number" step="0.01" min="0" required />
                  </label>
                  <label>
                    Sección
                    <select v-model="editForm.seccion_id">
                      <option value="">— Sin sección —</option>
                      <option v-for="s in [...sectionsStore.items].sort((a,b) => a.orden - b.orden)" :key="s.id" :value="s.id">{{ s.titulo }}</option>
                    </select>
                  </label>
                  <label>
                    Posición
                    <input v-model.number="editForm.orden" type="number" min="0" />
                  </label>
                  <label>
                    URL foto
                    <input v-model="editForm.foto" type="url" placeholder="URL o subir abajo" />
                  </label>
                  <label>
                    Subir imagen
                    <input type="file" accept="image/*" :disabled="uploadingEdit" @change="onFileChangeEdit" />
                    <span v-if="uploadingEdit" class="uploading-hint">Subiendo…</span>
                  </label>
                </div>
                <div class="edit-actions">
                  <button type="submit" class="btn-small">Guardar</button>
                  <button type="button" class="btn-small" @click="cancelEdit">Cancelar</button>
                </div>
              </form>
            </li>
            <li v-else class="product-row">
              <span class="pos">#{{ (p.orden ?? 0) }}</span>
              <span class="titulo">{{ p.titulo }}</span>
              <span class="costo">${{ p.costo }}</span>
              <span class="estado">{{ p.archivado ? 'Archivado' : 'Activo' }}</span>
              <div class="acciones">
                <button type="button" class="btn-small" title="Editar" @click="startEdit(p)">Editar</button>
                <button
                  type="button"
                  class="btn-small"
                  title="Subir"
                  :disabled="group.products[0]?.id === p.id"
                  @click="productSubir(p)"
                >↑</button>
                <button
                  type="button"
                  class="btn-small"
                  title="Bajar"
                  :disabled="group.products[group.products.length - 1]?.id === p.id"
                  @click="productBajar(p)"
                >↓</button>
                <button
                  v-if="p.archivado"
                  type="button"
                  class="btn-small"
                  @click="unarchive(p.id)"
                >
                  Desarchivar
                </button>
                <button
                  v-else
                  type="button"
                  class="btn-small"
                  @click="archive(p.id)"
                >
                  Archivar
                </button>
                <button type="button" class="btn-small danger" @click="remove(p.id)">
                  Eliminar
                </button>
              </div>
            </li>
          </template>
        </ul>
      </div>
      <p v-if="productsStore.items.length === 0" class="empty">No hay productos.</p>
    </section>
  </div>
</template>

<style scoped>
.admin-productos h2 {
  margin-top: 0;
}
.form-nuevo {
  margin-bottom: 2rem;
  padding: 1.25rem 1.5rem;
  background: var(--color-background-soft);
  border-radius: 12px;
}
.form-nuevo h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}
.form-nuevo button[type="submit"] {
  margin-top: 0.25rem;
}
.form-error {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-accent);
}
.uploading-hint {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin-left: 0.5rem;
}
.netlify-hint {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin-top: 0.75rem;
}
.netlify-hint code {
  font-size: 0.8em;
  background: var(--color-background-mute);
  padding: 0.1em 0.3em;
  border-radius: 4px;
}
.lista ul {
  list-style: none;
  padding: 0;
}
.product-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-border);
}
.product-row .titulo {
  flex: 1;
  min-width: 120px;
}
.product-row .costo {
  font-weight: 600;
}
.product-row .estado {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}
.acciones {
  display: flex;
  gap: 0.5rem;
}
.btn-small {
  padding: 0.25rem 0.5rem;
  font-size: 0.85rem;
  cursor: pointer;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background);
}
.btn-small.danger {
  border-color: #c00;
  color: #c00;
}
.empty {
  color: var(--color-text-muted);
}
.secciones-block {
  margin-bottom: 2rem;
  padding: 1.25rem 1.5rem;
  background: var(--color-background-soft);
  border-radius: 12px;
}
.secciones-block h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}
.secciones-block .hint {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  margin-bottom: 1rem;
}
.form-inline {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.form-inline input {
  min-width: 200px;
  padding: 0.4rem 0.6rem;
}
.secciones-list {
  list-style: none;
  padding: 0;
}
.section-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-border);
}
.section-titulo {
  flex: 1;
  min-width: 120px;
  font-weight: 600;
}
.section-orden {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}
.product-group {
  margin-bottom: 1.5rem;
}
.product-group .group-title {
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
  padding-bottom: 0.25rem;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-muted);
}
.product-group ul {
  list-style: none;
  padding: 0;
}
.product-row .pos {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  min-width: 2rem;
}
.product-edit-row {
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-border);
}
.edit-form {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 1rem;
}
.edit-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.25rem;
  flex: 1;
  min-width: 200px;
}
.edit-fields label {
  display: flex;
  flex-direction: column;
  font-size: 0.9rem;
  gap: 0.2rem;
}
.edit-fields input,
.edit-fields select,
.edit-fields textarea {
  padding: 0.35rem 0.5rem;
  min-width: 140px;
}
.edit-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
</style>

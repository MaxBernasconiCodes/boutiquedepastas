<script setup>
import { ref, computed, watch } from 'vue'
import draggable from 'vuedraggable'
import { useProductsStore } from '@/stores/products'
import { useSectionsStore } from '@/stores/sections'
import {
  apiProductsPost,
  apiProductsPatch,
  apiProductsDelete,
  apiUploadProductImage,
  apiSectionsPost,
  apiSectionsPatch,
  apiSectionsDelete,
  apiReorderItems,
} from '@/api/admin'

const productsStore = useProductsStore()
const sectionsStore = useSectionsStore()
const form = ref({
  titulo: '',
  descripcion: '',
  costo: '',
  foto: '',
})
const sectionForm = ref({ titulo: '', subtitulo: '' })
const error = ref('')
const uploading = ref(false)
const editingProductId = ref(null)
const editForm = ref({
  titulo: '',
  descripcion: '',
  costo: '',
  foto: '',
})
const uploadingEdit = ref(false)
/** Preview de imagen antes de confirmar subida (formulario crear) */
const pendingPreviewCreate = ref('')
const pendingFileCreate = ref(null)
const fileInputCreateRef = ref(null)
/** Preview de imagen antes de confirmar subida (formulario editar) */
const pendingPreviewEdit = ref('')
const pendingFileEdit = ref(null)
const fileInputEditRef = ref(null)

/** Lista unificada para el drag (copia de orderedList del store); se reordena con vuedraggable */
const orderedListRef = ref([])
const dragging = ref(false)
watch(
  () => productsStore.orderedList,
  (val) => {
    if (!dragging.value) orderedListRef.value = val.map((i) => ({ ...i }))
  },
  { immediate: true }
)

function getNextGlobalOrden() {
  const s = Math.max(-1, ...sectionsStore.items.map((x) => x.orden ?? 0))
  const p = Math.max(-1, ...productsStore.items.map((x) => x.orden ?? 0))
  return Math.max(s, p) + 1
}

function itemKey(item) {
  return `${item.type}-${item.id}`
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function onFilePickedCreate(e) {
  const file = e.target?.files?.[0]
  if (!file || !file.type.startsWith('image/')) return
  pendingFileCreate.value = file
  readFileAsDataUrl(file).then((dataUrl) => {
    pendingPreviewCreate.value = dataUrl
  })
  e.target.value = ''
}

async function confirmUploadCreate() {
  if (!pendingFileCreate.value) return
  error.value = ''
  uploading.value = true
  try {
    const dataUrl = await readFileAsDataUrl(pendingFileCreate.value)
    const url = await apiUploadProductImage(dataUrl)
    form.value.foto = url
    clearPendingCreate()
  } catch (err) {
    error.value = err.message || 'Error al subir la imagen. ¿Netlify Blobs está disponible?'
  } finally {
    uploading.value = false
  }
}

function clearPendingCreate() {
  pendingPreviewCreate.value = ''
  pendingFileCreate.value = null
  if (fileInputCreateRef.value) fileInputCreateRef.value.value = ''
}

function clearPhotoCreate() {
  form.value.foto = ''
  clearPendingCreate()
}

function onFilePickedEdit(e) {
  const file = e.target?.files?.[0]
  if (!file || !file.type.startsWith('image/')) return
  pendingFileEdit.value = file
  readFileAsDataUrl(file).then((dataUrl) => {
    pendingPreviewEdit.value = dataUrl
  })
  e.target.value = ''
}

async function confirmUploadEdit() {
  if (!pendingFileEdit.value) return
  error.value = ''
  uploadingEdit.value = true
  try {
    const dataUrl = await readFileAsDataUrl(pendingFileEdit.value)
    const url = await apiUploadProductImage(dataUrl)
    editForm.value.foto = url
    clearPendingEdit()
  } catch (err) {
    error.value = err.message || 'Error al subir la imagen.'
  } finally {
    uploadingEdit.value = false
  }
}

function clearPendingEdit() {
  pendingPreviewEdit.value = ''
  pendingFileEdit.value = null
  if (fileInputEditRef.value) fileInputEditRef.value.value = ''
}

function clearPhotoEdit() {
  editForm.value.foto = ''
  clearPendingEdit()
}

function startEdit(p) {
  editingProductId.value = p.id
  editForm.value = {
    titulo: p.titulo ?? '',
    descripcion: p.descripcion ?? '',
    costo: String(p.costo ?? ''),
    foto: p.foto ?? '',
  }
  clearPendingEdit()
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
    }
    const updated = await apiProductsPatch(id, payload)
    productsStore.update(id, updated)
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
    const orden = getNextGlobalOrden()
    const payload = {
      titulo: form.value.titulo.trim(),
      descripcion: form.value.descripcion.trim(),
      costo,
      foto: form.value.foto.trim() || undefined,
      orden,
    }
    const item = await apiProductsPost(payload)
    productsStore.add(item, item.id)
    form.value = { titulo: '', descripcion: '', costo: '', foto: '' }
    clearPendingCreate()
  } catch (e) {
    error.value = e.message || 'Error al crear. ¿Está configurada la base de datos (Neon)?'
  }
}

async function addSection() {
  const titulo = sectionForm.value.titulo?.trim()
  if (!titulo) return
  error.value = ''
  try {
    const orden = getNextGlobalOrden()
    const subtitulo = sectionForm.value.subtitulo?.trim() ?? ''
    const item = await apiSectionsPost({ titulo, subtitulo, orden })
    sectionsStore.add(item, item.id)
    sectionForm.value = { titulo: '', subtitulo: '' }
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

async function onReorderEnd() {
  const list = orderedListRef.value
  let lastSectionId = null
  for (let i = 0; i < list.length; i++) {
    const it = list[i]
    if (it.type === 'section') {
      sectionsStore.setOrden(it.id, i)
      lastSectionId = it.id
    } else {
      productsStore.setOrden(it.id, i)
      productsStore.setSeccion(it.id, lastSectionId)
    }
  }
  dragging.value = false
  error.value = ''
  try {
    await apiReorderItems(list.map((i) => ({ type: i.type, id: i.id })))
  } catch (e) {
    error.value = e.message || 'Error al guardar el orden.'
  }
}

function onDragStart() {
  dragging.value = true
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
      <h3>Nueva sección</h3>
      <p class="hint">Agregá secciones para agrupar productos en la tienda. Arrastrá los ítems en el listado para cambiar el orden.</p>
      <form class="form-section-create" @submit.prevent="addSection">
        <label>
          Título de la sección
          <input v-model="sectionForm.titulo" type="text" placeholder="Ej. Pastas rellenas" required />
        </label>
        <label>
          Subtítulo (opcional)
          <input v-model="sectionForm.subtitulo" type="text" placeholder="Ej. Con relleno de verdura o carne" />
        </label>
        <button type="submit">Crear sección</button>
      </form>
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
          URL de la foto
          <input v-model="form.foto" type="url" placeholder="https://... o elegir archivo abajo" />
        </label>
        <div class="photo-upload-block">
          <input
            ref="fileInputCreateRef"
            id="photo-create"
            type="file"
            accept="image/*"
            class="input-file-hidden"
            :disabled="uploading"
            @change="onFilePickedCreate"
          />
          <label for="photo-create" class="label-file">Elegir imagen desde el dispositivo</label>
          <div v-if="pendingPreviewCreate || form.foto" class="photo-preview-area">
            <img
              :src="pendingPreviewCreate || form.foto"
              alt="Vista previa"
              class="photo-preview-img"
            />
            <div class="photo-preview-actions">
              <template v-if="pendingPreviewCreate">
                <button type="button" class="btn-small" :disabled="uploading" @click="confirmUploadCreate">
                  {{ uploading ? 'Subiendo…' : 'Confirmar subida' }}
                </button>
                <button type="button" class="btn-small" :disabled="uploading" @click="clearPendingCreate">Quitar</button>
              </template>
              <template v-else>
                <button type="button" class="btn-small" @click="clearPhotoCreate">Quitar imagen</button>
              </template>
            </div>
          </div>
        </div>
        <button type="submit">Crear producto</button>
      </form>
      <p v-if="error" class="form-error">{{ error }}</p>
      <p class="netlify-hint">
        Los productos se guardan en Neon. La foto puede ser una URL o un archivo subido (Netlify Blobs). En local usá <code>netlify dev</code> para que la subida funcione.
      </p>
    </section>

    <section class="lista">
      <h3>Orden de secciones y productos</h3>
      <p class="hint">Arrastrá los ítems para cambiar el orden. Las secciones definen los títulos; los productos que queden debajo de una sección se mostrarán en ese grupo en la tienda.</p>
      <draggable
        v-model="orderedListRef"
        :item-key="itemKey"
        handle=".drag-handle"
        ghost-class="drag-ghost"
        chosen-class="drag-chosen"
        drag-class="drag-dragging"
        @start="onDragStart"
        @end="onReorderEnd"
      >
        <template #item="{ element }">
          <div class="list-item-wrap">
            <div v-if="element.type === 'section'" class="list-item list-item-section">
              <div class="drag-handle" aria-label="Arrastrar">⋮⋮</div>
              <div class="section-block">
                <h4 class="section-block-title">{{ element.titulo }}</h4>
                <p v-if="element.subtitulo" class="section-block-subtitle">{{ element.subtitulo }}</p>
                <div class="section-separator" />
              </div>
              <div class="acciones">
                <button type="button" class="btn-small danger" @click="removeSection(element.id)">Eliminar</button>
              </div>
            </div>
            <div v-else-if="editingProductId === element.id" class="list-item product-edit-row">
              <div class="drag-handle" aria-label="Arrastrar">⋮⋮</div>
              <form class="edit-form" @submit.prevent="submitEdit">
                <div class="edit-fields">
                  <label>Título <input v-model="editForm.titulo" type="text" required /></label>
                  <label>Descripción <textarea v-model="editForm.descripcion" rows="2" /></label>
                  <label>Costo ($) <input v-model="editForm.costo" type="number" step="0.01" min="0" required /></label>
                  <label>URL foto <input v-model="editForm.foto" type="url" placeholder="URL o elegir archivo" /></label>
                  <div class="photo-upload-block">
                    <input ref="fileInputEditRef" id="photo-edit" type="file" accept="image/*" class="input-file-hidden" :disabled="uploadingEdit" @change="onFilePickedEdit" />
                    <label for="photo-edit" class="label-file">Elegir imagen</label>
                    <div v-if="pendingPreviewEdit || editForm.foto" class="photo-preview-area">
                      <img :src="pendingPreviewEdit || editForm.foto" alt="Vista previa" class="photo-preview-img" />
                      <div class="photo-preview-actions">
                        <template v-if="pendingPreviewEdit">
                          <button type="button" class="btn-small" :disabled="uploadingEdit" @click="confirmUploadEdit">{{ uploadingEdit ? 'Subiendo…' : 'Confirmar subida' }}</button>
                          <button type="button" class="btn-small" :disabled="uploadingEdit" @click="clearPendingEdit">Quitar</button>
                        </template>
                        <template v-else>
                          <button type="button" class="btn-small" @click="clearPhotoEdit">Quitar imagen</button>
                        </template>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="edit-actions">
                  <button type="submit" class="btn-small">Guardar</button>
                  <button type="button" class="btn-small" @click="cancelEdit">Cancelar</button>
                </div>
              </form>
            </div>
            <div v-else class="list-item product-row">
              <div class="drag-handle" aria-label="Arrastrar">⋮⋮</div>
              <span class="titulo">{{ element.titulo }}</span>
              <span class="costo">${{ element.costo }}</span>
              <span class="estado">{{ element.archivado ? 'Archivado' : 'Activo' }}</span>
              <div class="acciones">
                <button type="button" class="btn-small" @click="startEdit(element)">Editar</button>
                <button v-if="element.archivado" type="button" class="btn-small" @click="unarchive(element.id)">Desarchivar</button>
                <button v-else type="button" class="btn-small" @click="archive(element.id)">Archivar</button>
                <button type="button" class="btn-small danger" @click="remove(element.id)">Eliminar</button>
              </div>
            </div>
          </div>
        </template>
      </draggable>
      <p v-if="orderedListRef.length === 0" class="empty">No hay secciones ni productos. Creá una sección o un producto arriba.</p>
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
.lista :deep(.list-item-wrap) {
  margin-bottom: 0.5rem;
}
.list-item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background);
}
.drag-handle {
  cursor: grab;
  padding: 0.25rem 0.35rem;
  color: var(--color-text-muted);
  user-select: none;
  touch-action: none;
}
.drag-handle:active {
  cursor: grabbing;
}
.list-item-section .section-block {
  flex: 1;
  min-width: 0;
}
.section-block-title {
  font-family: var(--font-heading);
  font-size: 1.1rem;
  margin: 0 0 0.2rem;
  color: var(--color-heading);
}
.section-block-subtitle {
  font-family: var(--font-subtitle);
  font-size: 0.9rem;
  color: var(--color-text-muted);
  margin: 0 0 0.5rem;
}
.section-separator {
  width: 100%;
  grid-column: 1 / -1;
  height: 0;
  border-bottom: 2px solid var(--color-border);
  margin-top: 0.25rem;
}
.list-item-section {
  flex-direction: column;
  align-items: stretch;
}
.list-item-section .section-block {
  width: 100%;
}
.list-item-section .acciones {
  align-self: flex-end;
}
.drag-ghost {
  opacity: 0.5;
  background: var(--color-background-mute);
}
.drag-chosen {
  background: var(--color-background-soft);
}
.drag-dragging {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.lista ul {
  list-style: none;
  padding: 0;
}
.product-row {
  border-radius: 8px;
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
.form-section-create {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1rem;
  margin-bottom: 1rem;
}
.form-section-create label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9rem;
}
.form-section-create input {
  min-width: 220px;
  padding: 0.45rem 0.6rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
}
.input-file-hidden {
  position: absolute;
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  z-index: -1;
}
.label-file {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  border: 1px dashed var(--color-border);
  border-radius: 8px;
  background: var(--color-background-mute);
  transition: border-color 0.2s, background 0.2s;
}
.label-file:hover {
  border-color: var(--color-accent);
  background: rgba(192, 47, 54, 0.08);
}
.photo-upload-block {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.photo-preview-area {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 1rem;
}
.photo-preview-img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--color-border);
}
.photo-preview-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
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

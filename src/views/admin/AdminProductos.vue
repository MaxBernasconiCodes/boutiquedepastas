<script setup>
import { ref, watch } from 'vue'
import draggable from 'vuedraggable'
import { useProductsStore } from '@/stores/products'
import { useSectionsStore } from '@/stores/sections'
import {
  apiProductsPost,
  apiProductsPatch,
  apiProductsDelete,
  apiSectionsPost,
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
const editingProductId = ref(null)
const editForm = ref({
  titulo: '',
  descripcion: '',
  costo: '',
  foto: '',
})

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

function startEdit(p) {
  editingProductId.value = p.id
  editForm.value = {
    titulo: p.titulo ?? '',
    descripcion: p.descripcion ?? '',
    costo: String(p.costo ?? ''),
    foto: p.foto ?? '',
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
      <p class="hint">Agregá secciones para agrupar productos en la tienda. Arrastrá los ítems en el listado para
        cambiar el orden.</p>
      <form class="form-section-create" @submit.prevent="addSection">
        <div class="form-section-fields">
          <label>
            Título de la sección
            <input v-model="sectionForm.titulo" type="text" placeholder="Ej. Pastas rellenas" required />
          </label>
          <label>
            Subtítulo (opcional)
            <input v-model="sectionForm.subtitulo" type="text" placeholder="Ej. Con relleno de verdura o carne" />
          </label>
        </div>
        <div class="form-section-actions">
          <button type="submit">Crear sección</button>
        </div>
      </form>
    </section>

    <section class="form-nuevo">
      <h3>Nuevo producto</h3>
      <form class="form-nuevo-producto" @submit.prevent="submit">
        <div class="form-nuevo-fields">
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
            <input v-model="form.foto" type="url" placeholder="https://..." />
          </label>
        </div>
        <div class="form-nuevo-actions">
          <button type="submit">Crear producto</button>
        </div>
      </form>
      <p v-if="error" class="form-error">{{ error }}</p>
      <p class="netlify-hint">Ingresá la URL de la imagen del producto. Los productos se guardan en Neon.</p>
    </section>

    <section class="lista">
      <h3>Orden de secciones y productos</h3>
      <p class="hint">Arrastrá los ítems para cambiar el orden. Las secciones definen los títulos; los productos que
        queden debajo de una sección se mostrarán en ese grupo en la tienda.</p>
      <draggable v-model="orderedListRef" :item-key="itemKey" handle=".drag-handle" ghost-class="drag-ghost"
        chosen-class="drag-chosen" drag-class="drag-dragging" @start="onDragStart" @end="onReorderEnd">
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
                <button type="button" class="btn-small danger" @click="removeSection(element.id)" title="Eliminar">
                  <span class="material-symbols-rounded btn-icon">close</span>
                  Eliminar
                </button>
              </div>
            </div>
            <div v-else-if="editingProductId === element.id" class="list-item list-item-editing product-edit-row">
              <div class="drag-handle" aria-label="Arrastrar">⋮⋮</div>
              <form class="edit-form" @submit.prevent="submitEdit">
                <div class="edit-fields">
                  <label>Título <input v-model="editForm.titulo" type="text" required /></label>
                  <label>Descripción <textarea v-model="editForm.descripcion" rows="2" /></label>
                  <label>Costo ($) <input v-model="editForm.costo" type="number" step="0.01" min="0" required /></label>
                  <label>URL de la foto <input v-model="editForm.foto" type="url" placeholder="https://..." /></label>
                </div>
                <div class="edit-actions">
                  <button type="button" class="btn-small" @click="cancelEdit">Cancelar</button>
                  <button type="submit" class="btn-small">Guardar</button>
                </div>
              </form>
            </div>
            <div v-else class="list-item product-row">
              <div class="drag-handle" aria-label="Arrastrar">⋮⋮</div>
              <span class="titulo">{{ element.titulo }}</span>
              <span class="costo">${{ element.costo }}</span>
              <span class="estado-indicator" :class="element.archivado ? 'estado-archivado' : 'estado-activo'"
                :title="element.archivado ? 'Archivado' : 'Activo'">
                <span class="estado-dot" />
                <span class="material-symbols-rounded estado-icon">{{ element.archivado ? 'archive' : 'visibility'
                  }}</span>
              </span>
              <div class="acciones">
                <button type="button" class="btn-small" @click="startEdit(element)">
                  <span class="material-symbols-rounded btn-icon">edit</span>
                  Editar
                </button>
                <button v-if="element.archivado" type="button" class="btn-small" @click="unarchive(element.id)"
                  title="Desarchivar">
                  <span class="material-symbols-rounded btn-icon">unarchive</span>
                  Desarchivar
                </button>
                <button v-else type="button" class="btn-small" @click="archive(element.id)" title="Archivar">
                  <span class="material-symbols-rounded btn-icon">archive</span>
                  Archivar
                </button>
                <button type="button" class="btn-small danger" @click="remove(element.id)" title="Eliminar">
                  <span class="material-symbols-rounded btn-icon">close</span>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </template>
      </draggable>
      <p v-if="orderedListRef.length === 0" class="empty">No hay secciones ni productos. Creá una sección o un producto
        arriba.</p>
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
  box-sizing: border-box;
}

.form-nuevo h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.form-nuevo-producto {
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  gap: 1rem;
}

.form-nuevo-fields {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem 1.25rem;
  width: 100%;
}

@media (min-width: 1024px) {
  .form-nuevo-fields {
    grid-template-columns: 1fr 1fr;
  }
}

.form-nuevo-fields label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.95rem;
}

.form-nuevo-fields input,
.form-nuevo-fields textarea {
  width: 100%;
  padding: 0.45rem 0.6rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  box-sizing: border-box;
}

.form-nuevo-actions {
  display: flex;
  justify-content: flex-end;
}

.form-nuevo-actions button[type="submit"] {
  padding: 0.45rem 1rem;
}

.form-error {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-accent);
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

.list-item-editing {
  background: var(--color-background-soft);
  padding: 1rem 0.75rem;
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

.estado-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
}

.estado-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.estado-activo .estado-dot {
  background: #22c55e;
}

.estado-archivado .estado-dot {
  background: #ef4444;
}

.estado-icon {
  font-size: 18px;
  color: var(--color-text-muted);
}

.estado-activo .estado-icon {
  color: #22c55e;
}

.estado-archivado .estado-icon {
  color: #ef4444;
}

.acciones {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  font-size: 18px;
  vertical-align: middle;
  margin-right: 0.2rem;
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
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 0;
}

.form-section-fields {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem 1.25rem;
  width: 100%;
}

@media (min-width: 1024px) {
  .form-section-fields {
    grid-template-columns: 1fr 1fr;
  }
}

.form-section-fields label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.95rem;
}

.form-section-fields input {
  width: 100%;
  min-width: 0;
  padding: 0.45rem 0.6rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  box-sizing: border-box;
}

.form-section-actions {
  display: flex;
  justify-content: flex-end;
}

.form-section-actions button[type="submit"] {
  padding: 0.45rem 1rem;
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
  border-bottom: none;
}

.product-edit-row .edit-form {
  flex: 1;
  min-width: 0;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  gap: 1rem;
}

.edit-fields {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem 1.25rem;
  width: 100%;
  min-width: 0;
}

@media (min-width: 1024px) {
  .edit-fields {
    grid-template-columns: 1fr 1fr;
  }
}

.edit-fields label {
  display: flex;
  flex-direction: column;
  font-size: 0.9rem;
  gap: 0.25rem;
  min-width: 0;
}

.edit-fields input,
.edit-fields textarea {
  width: 100%;
  min-width: 0;
  padding: 0.45rem 0.6rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  box-sizing: border-box;
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
}
</style>

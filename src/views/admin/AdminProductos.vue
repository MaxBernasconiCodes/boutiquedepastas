<script setup>
import { ref } from 'vue'
import { useProductsStore } from '@/stores/products'
import {
  apiProductsPost,
  apiProductsPatch,
  apiProductsDelete,
} from '@/api/admin'

const productsStore = useProductsStore()
const form = ref({
  titulo: '',
  descripcion: '',
  costo: '',
  foto: '',
})
const error = ref('')

async function submit() {
  const costo = Number(form.value.costo)
  if (!form.value.titulo || Number.isNaN(costo)) return
  error.value = ''
  try {
    const item = await apiProductsPost({
      titulo: form.value.titulo.trim(),
      descripcion: form.value.descripcion.trim(),
      costo,
      foto: form.value.foto.trim() || undefined,
    })
    productsStore.add(item, item.id)
    form.value = { titulo: '', descripcion: '', costo: '', foto: '' }
  } catch (e) {
    error.value = e.message || 'Error al crear. ¿Está configurada la base de datos (Neon)?'
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
          <input v-model="form.foto" type="url" placeholder="https://..." />
        </label>
        <button type="submit">Crear producto</button>
      </form>
      <p v-if="error" class="form-error">{{ error }}</p>
      <p class="netlify-hint">
        Los productos se guardan en la base de datos Neon. Si no está configurada, los datos solo se mantienen en sesión.
      </p>
    </section>

    <section class="lista">
      <h3>Listado</h3>
      <ul>
        <li v-for="p in productsStore.items" :key="p.id" class="product-row">
          <span class="titulo">{{ p.titulo }}</span>
          <span class="costo">${{ p.costo }}</span>
          <span class="estado">{{ p.archivado ? 'Archivado' : 'Activo' }}</span>
          <div class="acciones">
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
      </ul>
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
.netlify-hint {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin-top: 0.75rem;
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
</style>

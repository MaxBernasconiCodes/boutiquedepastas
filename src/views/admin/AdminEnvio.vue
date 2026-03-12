<script setup>
import { ref } from 'vue'
import { useShippingOptionsStore } from '@/stores/shippingOptions'
import { apiShippingOptionsPost, apiShippingOptionsDelete } from '@/api/admin'

const shippingStore = useShippingOptionsStore()
const form = ref({ nombre: '', costo: '', descripcion: '' })
const error = ref('')

async function add() {
  const nombre = form.value.nombre.trim()
  const costo = Number(form.value.costo)
  if (!nombre || Number.isNaN(costo)) return
  error.value = ''
  try {
    const item = await apiShippingOptionsPost({
      nombre,
      costo,
      descripcion: form.value.descripcion.trim() || undefined,
    })
    shippingStore.add(item, item.id)
    form.value = { nombre: '', costo: '', descripcion: '' }
  } catch (e) {
    error.value = e.message || 'Error al agregar.'
  }
}

async function remove(id) {
  error.value = ''
  try {
    await apiShippingOptionsDelete(id)
    shippingStore.remove(id)
  } catch (e) {
    error.value = e.message || 'Error al eliminar.'
  }
}
</script>

<template>
  <div class="admin-envio">
    <h2>Opciones de envío</h2>
    <p class="hint">Nombre, costo y opcionalmente descripción. La descripción se muestra en el carrito debajo de la opción elegida.</p>
    <p v-if="error" class="form-error">{{ error }}</p>

    <section class="admin-form-card">
      <form @submit.prevent="add" class="form-block">
        <div class="form-inline">
          <label>
            Nombre
            <input v-model="form.nombre" type="text" placeholder="Ej: Zona centro" required />
          </label>
          <label>
            Costo ($)
            <input v-model="form.costo" type="number" step="0.01" min="0" placeholder="0" required />
          </label>
        </div>
        <label>
          Descripción (opcional)
          <textarea v-model="form.descripcion" rows="2" placeholder="Ej: Plazo de entrega, dirección..." />
        </label>
        <button type="submit">Agregar</button>
      </form>
    </section>

    <ul class="lista">
      <li v-for="opt in shippingStore.items" :key="opt.id" class="row">
        <div class="row-text">
          <span class="nombre">{{ opt.nombre }} — ${{ opt.costo }}</span>
          <p v-if="opt.descripcion" class="descripcion">{{ opt.descripcion }}</p>
        </div>
        <button type="button" class="btn-small danger" @click="remove(opt.id)">
          Eliminar
        </button>
      </li>
    </ul>
    <p v-if="shippingStore.items.length === 0" class="empty">No hay opciones de envío.</p>
  </div>
</template>

<style scoped>
.admin-envio h2 {
  margin-top: 0;
}
.hint {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  margin-bottom: 1rem;
}
.form-block {
  margin-bottom: 1.5rem;
}
.form-inline {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem 1.5rem;
  align-items: end;
}
.form-inline label {
  min-width: 0;
}
.form-inline label:first-child {
  grid-column: 1;
}
.form-inline label:nth-child(2) {
  grid-column: 2;
  max-width: 120px;
}
.form-inline label:nth-child(2) input {
  width: 100%;
}
.lista {
  list-style: none;
  padding: 0;
}
.row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-border);
}
.row-text {
  min-width: 0;
}
.row-text .nombre {
  font-weight: 500;
}
.row-text .descripcion {
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
  color: var(--color-text-muted);
  white-space: pre-wrap;
}
.btn-small.danger {
  flex-shrink: 0;
  padding: 0.25rem 0.5rem;
  font-size: 0.85rem;
  cursor: pointer;
  border: 1px solid #c00;
  color: #c00;
  border-radius: 4px;
  background: transparent;
}
.form-error {
  font-size: 0.9rem;
  color: var(--color-accent);
  margin-bottom: 0.5rem;
}
.empty {
  color: var(--color-text-muted);
}
</style>

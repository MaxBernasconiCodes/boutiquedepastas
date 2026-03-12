<script setup>
import { ref } from 'vue'
import { usePaymentOptionsStore } from '@/stores/paymentOptions'

const paymentStore = usePaymentOptionsStore()
const form = ref({ nombre: '', descripcion: '' })

function add() {
  const nombre = form.value.nombre.trim()
  if (!nombre) return
  paymentStore.add({
    nombre,
    descripcion: form.value.descripcion.trim() || undefined,
  })
  form.value = { nombre: '', descripcion: '' }
}

function remove(id) {
  paymentStore.remove(id)
}
</script>

<template>
  <div class="admin-pago">
    <h2>Opciones de pago</h2>
    <p class="hint">Nombre y opcionalmente descripción. La descripción se muestra en el carrito debajo de la opción elegida.</p>

    <section class="admin-form-card">
      <form @submit.prevent="add" class="form-block">
        <label>
          Nombre
          <input v-model="form.nombre" type="text" placeholder="Ej: Transferencia bancaria" required />
        </label>
        <label>
          Descripción (opcional)
          <textarea v-model="form.descripcion" rows="2" placeholder="Ej: CBU o instrucciones..." />
        </label>
        <button type="submit">Agregar</button>
      </form>
    </section>

    <ul class="lista">
      <li v-for="opt in paymentStore.items" :key="opt.id" class="row">
        <div class="row-text">
          <span class="nombre">{{ opt.nombre }}</span>
          <p v-if="opt.descripcion" class="descripcion">{{ opt.descripcion }}</p>
        </div>
        <button type="button" class="btn-small danger" @click="remove(opt.id)">
          Eliminar
        </button>
      </li>
    </ul>
    <p v-if="paymentStore.items.length === 0" class="empty">No hay opciones de pago.</p>
  </div>
</template>

<style scoped>
.admin-pago h2 {
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
.empty {
  color: var(--color-text-muted);
}
</style>

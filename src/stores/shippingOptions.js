import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * Opciones de envío (zona, costo, etc.).
 * Admin las crea; se muestran en el pedido para que el cliente elija.
 */
export const useShippingOptionsStore = defineStore('shippingOptions', () => {
  const items = ref([])

  function add(option, id) {
    const newId = id ?? String(Date.now())
    items.value.push({ ...option, id: newId })
  }

  function update(id, data) {
    const i = items.value.findIndex((o) => o.id === id)
    if (i !== -1) items.value[i] = { ...items.value[i], ...data }
  }

  function remove(id) {
    items.value = items.value.filter((o) => o.id !== id)
  }

  /** Carga datos mock (desarrollo/pruebas). Reemplaza la lista actual. */
  function loadMock(data) {
    items.value = data ? [...data] : []
  }

  return { items, add, update, remove, loadMock }
})

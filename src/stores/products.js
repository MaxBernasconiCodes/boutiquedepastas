import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * Producto: { id, titulo, descripcion, costo, foto (url), archivado }
 * Persistencia: solo sesión (refs). Admin cargará/guardará vía Netlify Forms.
 */
export const useProductsStore = defineStore('products', () => {
  const items = ref([])

  const activos = computed(() => items.value.filter((p) => !p.archivado))

  function add(product) {
    const id = String(Date.now())
    items.value.push({ ...product, id, archivado: false })
  }

  function update(id, data) {
    const i = items.value.findIndex((p) => p.id === id)
    if (i !== -1) items.value[i] = { ...items.value[i], ...data }
  }

  function remove(id) {
    items.value = items.value.filter((p) => p.id !== id)
  }

  function setArchived(id, archivado) {
    const i = items.value.findIndex((p) => p.id === id)
    if (i !== -1) items.value[i].archivado = !!archivado
  }

  /** Carga datos mock (desarrollo/pruebas). Reemplaza la lista actual. */
  function loadMock(data) {
    items.value = (data || []).map((p) => ({
      ...p,
      archivado: p.archivado ?? false,
    }))
  }

  return { items, activos, add, update, remove, setArchived, loadMock }
})

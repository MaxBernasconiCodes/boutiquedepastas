import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * Sección: { id, titulo, orden }
 * Agrupa productos en la tienda con un título.
 */
export const useSectionsStore = defineStore('sections', () => {
  const items = ref([])

  function add(section, id) {
    const newId = id ?? String(Date.now())
    items.value.push({
      ...section,
      id: newId,
      orden: section.orden ?? items.value.length,
    })
  }

  function update(id, data) {
    const i = items.value.findIndex((s) => s.id === id)
    if (i !== -1) items.value[i] = { ...items.value[i], ...data }
  }

  function remove(id) {
    items.value = items.value.filter((s) => s.id !== id)
  }

  function setOrden(id, orden) {
    const i = items.value.findIndex((s) => s.id === id)
    if (i !== -1) items.value[i].orden = orden
  }

  /** Carga datos desde API o mock. Reemplaza la lista actual. */
  function loadMock(data) {
    items.value = (data || []).map((s) => ({
      ...s,
      orden: s.orden ?? 0,
    }))
  }

  return {
    items,
    add,
    update,
    remove,
    setOrden,
    loadMock,
  }
})

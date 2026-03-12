import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useSectionsStore } from '@/stores/sections'

/**
 * Producto: { id, titulo, descripcion, costo, foto (url), archivado, seccion_id?, orden }
 */
export const useProductsStore = defineStore('products', () => {
  const items = ref([])

  const activos = computed(() => items.value.filter((p) => !p.archivado))

  const sectionsStore = useSectionsStore()

  /** Lista unificada ordenada: secciones y productos con type 'section'|'product', orden global. */
  const orderedList = computed(() => {
    const sec = sectionsStore.items.map((s) => ({ ...s, type: 'section' }))
    const pro = items.value.map((p) => ({ ...p, type: 'product' }))
    return [...sec, ...pro].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
  })

  /** Productos activos agrupados por sección según el orden de la lista (sección = cabecera, producto = bajo la última sección). */
  const activosPorSeccion = computed(() => {
    const result = []
    let current = { section: null, sectionId: null, products: [] }
    for (const item of orderedList.value) {
      if (item.type === 'section') {
        if (current.products.length > 0 || current.section) result.push(current)
        current = { section: item, sectionId: item.id, products: [] }
      } else if (item.type === 'product' && !item.archivado) {
        current.products.push(item)
      }
    }
    if (current.products.length > 0 || current.section) result.push(current)
    return result
  })

  function add(product, id) {
    const newId = id ?? String(Date.now())
    items.value.push({
      ...product,
      id: newId,
      archivado: product.archivado ?? false,
      seccion_id: product.seccion_id ?? undefined,
      orden: product.orden ?? 0,
    })
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

  function setOrden(id, orden) {
    const i = items.value.findIndex((p) => p.id === id)
    if (i !== -1) items.value[i].orden = orden
  }

  function setSeccion(id, seccion_id) {
    const i = items.value.findIndex((p) => p.id === id)
    if (i !== -1) items.value[i].seccion_id = seccion_id ?? undefined
  }

  /** Carga datos mock (desarrollo/pruebas). Reemplaza la lista actual. */
  function loadMock(data) {
    items.value = (data || []).map((p) => ({
      ...p,
      archivado: p.archivado ?? false,
      seccion_id: p.seccion_id ?? undefined,
      orden: p.orden ?? 0,
    }))
  }

  return {
    items,
    activos,
    orderedList,
    activosPorSeccion,
    add,
    update,
    remove,
    setArchived,
    setOrden,
    setSeccion,
    loadMock,
  }
})

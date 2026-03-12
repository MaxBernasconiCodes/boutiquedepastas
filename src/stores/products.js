import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useSectionsStore } from '@/stores/sections'

/**
 * Producto: { id, titulo, descripcion, costo, foto (url), archivado, seccion_id?, orden }
 */
export const useProductsStore = defineStore('products', () => {
  const items = ref([])

  const activos = computed(() => items.value.filter((p) => !p.archivado))

  /** Productos activos agrupados por sección (orden de sección, luego orden de producto). */
  const activosPorSeccion = computed(() => {
    const seccionesMap = new Map() // id sección -> { section, products: [] }
    const sinSeccion = { section: null, products: [] }
    const activosList = activos.value
    for (const p of activosList) {
      const sid = p.seccion_id || null
      if (!sid) {
        sinSeccion.products.push(p)
        continue
      }
      if (!seccionesMap.has(sid)) {
        seccionesMap.set(sid, { sectionId: sid, products: [] })
      }
      seccionesMap.get(sid).products.push(p)
    }
    const sectionsStore = useSectionsStore()
    const seccionesOrdenadas = [...sectionsStore.items].sort((a, b) => a.orden - b.orden)
    const result = []
    for (const sec of seccionesOrdenadas) {
      const block = seccionesMap.get(sec.id)
      if (block) {
        block.section = sec
        block.products.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
        result.push(block)
      }
    }
    if (sinSeccion.products.length) {
      sinSeccion.products.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
      result.push({ section: null, sectionId: null, products: sinSeccion.products })
    }
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

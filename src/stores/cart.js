import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useProductsStore } from './products'

/**
 * Pedido en sesión. Líneas: { productId, cantidad }.
 */
export const useCartStore = defineStore('cart', () => {
  const lines = ref([]) // { productId, cantidad }

  const productsStore = useProductsStore()

  const total = computed(() => {
    return lines.value.reduce((sum, line) => {
      const p = productsStore.items.find((x) => x.id === line.productId)
      return sum + (p ? p.costo * line.cantidad : 0)
    }, 0)
  })

  function add(productId, cantidad = 1) {
    const line = lines.value.find((l) => l.productId === productId)
    if (line) line.cantidad += cantidad
    else lines.value.push({ productId, cantidad })
  }

  function setQuantity(productId, cantidad) {
    if (cantidad <= 0) {
      lines.value = lines.value.filter((l) => l.productId !== productId)
      return
    }
    const line = lines.value.find((l) => l.productId === productId)
    if (line) line.cantidad = cantidad
  }

  function remove(productId) {
    lines.value = lines.value.filter((l) => l.productId !== productId)
  }

  function clear() {
    lines.value = []
  }

  return { lines, total, add, setQuantity, remove, clear }
})

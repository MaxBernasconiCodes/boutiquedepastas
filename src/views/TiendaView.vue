<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useProductsStore } from '@/stores/products'
import { useCartStore } from '@/stores/cart'

const productsStore = useProductsStore()
const cartStore = useCartStore()
const { activosPorSeccion } = storeToRefs(productsStore)
const { lines } = storeToRefs(cartStore)

const cantidadPorProducto = computed(() => {
  const map = Object.create(null)
  lines.value.forEach((l) => {
    map[l.productId] = l.cantidad
  })
  return map
})

function cantidadEnCarrito(productId) {
  return cantidadPorProducto.value[productId] ?? 0
}

function agregar(productId) {
  cartStore.add(productId, 1)
}

function restar(productId) {
  const q = cantidadEnCarrito(productId)
  if (q <= 1) cartStore.setQuantity(productId, 0)
  else cartStore.setQuantity(productId, q - 1)
}

function sumar(productId) {
  cartStore.add(productId, 1)
}
</script>

<template>
  <div class="tienda">
    <h1>Nuestras Comidas</h1>
    <template v-if="activosPorSeccion.length === 0">
      <div class="empty">No hay productos disponibles.</div>
    </template>
    <template v-else>
      <section v-for="group in activosPorSeccion" :key="group.section?.id ?? 'sin-seccion'" class="product-section">
        <div v-if="group.section" class="section-header">
          <h2 class="section-title">{{ group.section.titulo }}</h2>
          <p v-if="group.section.subtitulo" class="section-subtitle">{{ group.section.subtitulo }}</p>
        </div>
        <ul class="product-list">
          <li v-for="p in group.products" :key="p.id" class="product-card">
            <div class="product-image-wrap">
              <img v-if="p.foto" :src="p.foto" :alt="p.titulo" class="product-image" />
              <span v-else class="no-image">Sin imagen</span>
            </div>
            <div class="product-info">
              <h2 class="product-titulo">{{ p.titulo }}</h2>
              <p class="product-desc">{{ p.descripcion }}</p>
              <p class="product-precio">$ {{ p.costo }}</p>
              <div class="product-actions">
                <template v-if="cantidadEnCarrito(p.id) === 0">
                  <button type="button" class="btn-add" @click="agregar(p.id)">
                    Agregar al carrito
                  </button>
                </template>
                <template v-else>
                  <div class="cantidad-controls">
                    <button
                      type="button"
                      class="btn-qty"
                      aria-label="Quitar uno"
                      @click="restar(p.id)"
                    >
                      <span class="material-symbols-rounded">remove</span>
                    </button>
                    <span class="cantidad-numero">{{ cantidadEnCarrito(p.id) }}</span>
                    <button
                      type="button"
                      class="btn-qty"
                      aria-label="Agregar uno"
                      @click="sumar(p.id)"
                    >
                      <span class="material-symbols-rounded">add</span>
                    </button>
                  </div>
                </template>
              </div>
            </div>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>

<style scoped>
.tienda {
  padding: 1rem;
  max-width: 900px;
  margin: 0 auto;
}
h1 {
  margin-bottom: 1rem;
}
.empty {
  color: var(--color-text-muted);
}
.product-section {
  margin-bottom: 2rem;
}
.product-section:last-child {
  margin-bottom: 0;
}
.section-header {
  margin-bottom: 1rem;
  padding-bottom: 0.35rem;
  border-bottom: 2px solid var(--color-border);
}
.section-title {
  font-family: var(--font-heading);
  font-size: 1.35rem;
  color: var(--color-heading);
  margin: 0 0 0.25rem;
}
.section-subtitle {
  font-family: var(--font-subtitle);
  font-size: 0.95rem;
  color: var(--color-text-muted);
  margin: 0;
  line-height: 1.4;
}
.product-list {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
}
.product-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  background: var(--color-background);
}
.product-image-wrap {
  width: 100%;
  aspect-ratio: 1 / 1;
  background: var(--color-border);
  overflow: hidden;
}
.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.no-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}
.product-info {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  flex: 1;
  min-height: 0;
}
.product-titulo {
  margin: 0 0 0.35rem;
  font-size: 1.1rem;
  line-height: 1.3;
  color: var(--color-heading);
}
.product-desc {
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
  color: var(--color-text-muted);
  line-height: 1.4;
  flex: 1;
}
.product-precio {
  margin: 0 0 0.75rem;
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--color-text);
}
.product-actions {
  margin-top: auto;
}
.btn-add {
  width: 100%;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  background: var(--color-accent);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: background 0.2s, transform 0.1s;
}
.btn-add:hover {
  filter: brightness(0.95);
}
.btn-add:active {
  transform: scale(0.98);
}
.cantidad-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.btn-qty {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.btn-qty:hover {
  background: var(--color-border);
  color: var(--color-accent);
}
.btn-qty .material-symbols-rounded {
  font-size: 22px;
}
.cantidad-numero {
  min-width: 2rem;
  text-align: center;
  font-weight: 600;
  font-size: 1rem;
}
</style>

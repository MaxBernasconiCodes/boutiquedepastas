<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/stores/cart'
import { useProductsStore } from '@/stores/products'
import { usePaymentOptionsStore } from '@/stores/paymentOptions'
import { useShippingOptionsStore } from '@/stores/shippingOptions'
import { useAboutUsStore } from '@/stores/aboutUs'

const cartStore = useCartStore()
const productsStore = useProductsStore()
const paymentStore = usePaymentOptionsStore()
const shippingStore = useShippingOptionsStore()
const aboutStore = useAboutUsStore()

const { lines, total } = storeToRefs(cartStore)

const selectedPaymentId = ref(null)
const selectedShippingId = ref(null)

const lineItems = computed(() => {
  return lines.value
    .map((line) => {
      const p = productsStore.items.find((x) => x.id === line.productId)
      return {
        product: p,
        cantidad: line.cantidad,
        subtotal: p ? p.costo * line.cantidad : 0,
      }
    })
    .filter((x) => x.product && x.cantidad > 0)
})

const selectedShipping = computed(() =>
  shippingStore.items.find((o) => o.id === selectedShippingId.value)
)
const shippingCost = computed(() => selectedShipping.value?.costo ?? 0)
const totalWithShipping = computed(() => total.value + shippingCost.value)
const hasWhatsAppNumber = computed(() =>
  /[0-9]/.test((aboutStore.data?.value?.telefono ?? '').toString().trim())
)

function textoWhatsApp() {
  const payment = paymentStore.items.find((o) => o.id === selectedPaymentId.value)
  const shipping = selectedShipping.value
  let text = '¡Hola! Quiero hacer este pedido:\n\n'
  lineItems.value.forEach(({ product, cantidad, subtotal }) => {
    text += `- ${product.titulo} x ${cantidad}: $${subtotal}\n`
  })
  text += `\nSubtotal: $${total.value}\n`
  if (shipping) text += `Envío (${shipping.nombre || 'Envío'}): $${shipping.costo}\n`
  text += `Total: $${totalWithShipping.value}\n\n`
  if (payment) text += `Medio de pago: ${payment.nombre}\n`
  return encodeURIComponent(text)
}

function openWhatsApp() {
  const tel = (aboutStore.data?.value?.telefono ?? '').toString().trim().replace(/\D/g, '')
  if (!tel) return
  const url = `https://wa.me/${tel}?text=${textoWhatsApp()}`
  window.open(url, '_blank')
}
</script>

<template>
  <div class="carrito">
    <h1>Carrito</h1>

    <section v-if="lineItems.length === 0" class="empty">
      <p>Tu carrito está vacío.</p>
      <router-link to="/">Ver productos</router-link>
    </section>

    <template v-else>
      <section class="carrito-seccion resumen">
        <h2>Resumen</h2>
        <ul class="resumen-lista">
          <li v-for="item in lineItems" :key="item.product.id" class="resumen-item">
            <span class="resumen-item-texto">{{ item.product.titulo }} x {{ item.cantidad }}</span>
            <span class="resumen-item-precio">${{ item.subtotal }}</span>
          </li>
        </ul>
        <p class="subtotal">Subtotal: ${{ total }}</p>
      </section>

      <section class="carrito-seccion opciones opciones-pago">
        <h2>Medio de pago</h2>
        <div v-if="paymentStore.items.length === 0" class="sin-opciones">
          No hay opciones configuradas. (Admin puede agregarlas.)
        </div>
        <ul v-else class="opcion-list">
          <li v-for="opt in paymentStore.items" :key="opt.id" class="opcion-item">
            <label>
              <input v-model="selectedPaymentId" type="radio" :value="opt.id" />
              {{ opt.nombre }}
            </label>
            <p v-if="opt.descripcion && selectedPaymentId === opt.id" class="opcion-descripcion">
              {{ opt.descripcion }}
            </p>
          </li>
        </ul>
      </section>

      <section class="carrito-seccion opciones opciones-envio">
        <h2>Envío</h2>
        <div v-if="shippingStore.items.length === 0" class="sin-opciones">
          No hay opciones de envío. (Admin puede agregarlas.)
        </div>
        <ul v-else class="opcion-list">
          <li v-for="opt in shippingStore.items" :key="opt.id" class="opcion-item">
            <label>
              <input v-model="selectedShippingId" type="radio" :value="opt.id" />
              {{ opt.nombre || 'Envío' }} — ${{ opt.costo }}
            </label>
            <p v-if="opt.descripcion && selectedShippingId === opt.id" class="opcion-descripcion">
              {{ opt.descripcion }}
            </p>
          </li>
        </ul>
        <p v-if="selectedShipping" class="costo-envio">
          Costo de envío: ${{ shippingCost }}
        </p>
      </section>

      <section class="total-final">
        <p><strong>Total: ${{ totalWithShipping }}</strong></p>
        <button
          type="button"
          class="btn-whatsapp"
          :disabled="!hasWhatsAppNumber"
          @click="openWhatsApp"
        >
          Enviar pedido por WhatsApp
        </button>
        <p v-if="!hasWhatsAppNumber" class="whatsapp-hint">
          Para habilitar el enlace, configurá el teléfono en Admin → Sobre nosotros.
        </p>
      </section>
    </template>
  </div>
</template>

<style scoped>
.carrito {
  padding: 1rem;
  max-width: 600px;
  margin: 0 auto;
}
h1 {
  margin-bottom: 1rem;
}
.empty {
  text-align: center;
  padding: 2rem;
}
/* Separador entre secciones (Resumen, Medio de pago, Envío) */
.carrito-seccion {
  margin-bottom: 0;
  padding-top: 1.25rem;
  padding-bottom: 1.25rem;
  border-top: 1px solid var(--color-border);
}
.carrito-seccion:first-child {
  padding-top: 0;
  border-top: none;
}
section {
  margin-bottom: 0;
}

/* Resumen: cada producto en bloque (texto arriba, precio abajo) */
.resumen-lista {
  list-style: none;
  padding: 0;
  margin: 0 0 0.5rem;
}
.resumen-item {
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.resumen-item:last-child {
  border-bottom: none;
}
.resumen-item-texto {
  font-size: 1rem;
  color: var(--color-text);
}
.resumen-item-precio {
  font-weight: 600;
  color: var(--color-text);
  font-size: 1.05rem;
}

.opcion-list {
  list-style: none;
  padding: 0;
}
.opcion-list li {
  margin-bottom: 0.5rem;
}
.opcion-item {
  margin-bottom: 0.75rem;
}
.opcion-descripcion {
  margin: 0.25rem 0 0 1.6rem;
  font-size: 0.9rem;
  color: var(--color-text-muted);
  line-height: 1.4;
}
.subtotal,
.costo-envio {
  margin-top: 0.5rem;
}
.total-final {
  padding-top: 1.25rem;
  border-top: 1px solid var(--color-border);
}
.btn-whatsapp {
  margin-top: 0.5rem;
  padding: 0.6rem 1rem;
  background: #25d366;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.btn-whatsapp:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.whatsapp-hint {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}
.sin-opciones {
  color: var(--color-text-muted);
  font-size: 0.9rem;
}
</style>

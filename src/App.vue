<script setup>
import { computed, ref, onMounted } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/stores/cart'
import { useProductsStore } from '@/stores/products'

const STORAGE_KEY = 'boutiquedepastas-theme'

const cartStore = useCartStore()
const productsStore = useProductsStore()
const { lines, total } = storeToRefs(cartStore)
const { items: products } = storeToRefs(productsStore)

const isDark = ref(false)

function applyTheme(dark) {
  isDark.value = dark
  if (dark) {
    document.documentElement.classList.add('theme-dark')
    localStorage.setItem(STORAGE_KEY, 'dark')
  } else {
    document.documentElement.classList.remove('theme-dark')
    localStorage.setItem(STORAGE_KEY, 'light')
  }
}

function toggleTheme() {
  applyTheme(!isDark.value)
}

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  const dark = saved === 'dark'
  applyTheme(dark)
})

const cartCount = computed(() =>
  lines.value.reduce((sum, l) => sum + l.cantidad, 0)
)

const sidebarLineItems = computed(() =>
  lines.value
    .map((line) => {
      const p = products.value.find((x) => x.id === line.productId)
      return {
        productId: line.productId,
        product: p,
        cantidad: line.cantidad,
        subtotal: p ? p.costo * line.cantidad : 0,
      }
    })
    .filter((x) => x.product && x.cantidad > 0)
)

function sumarEnSidebar(productId) {
  cartStore.add(productId, 1)
}

function restarEnSidebar(productId) {
  const line = lines.value.find((l) => l.productId === productId)
  if (!line) return
  if (line.cantidad <= 1) cartStore.setQuantity(productId, 0)
  else cartStore.setQuantity(productId, line.cantidad - 1)
}

function formatTotal() {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(total.value)
}
</script>

<template>
  <div id="app-wrapper">
    <!-- Barra superior fija: solo mobile -->
    <header class="top-bar" aria-label="Resumen del carrito">
      <span class="top-bar-count">{{ cartCount }} {{ cartCount === 1 ? 'producto' : 'productos' }}</span>
      <span class="top-bar-total">{{ formatTotal() }}</span>
    </header>

    <!-- Desktop: sidebar (logo + carrito con scroll + Realizar Pedido) -->
    <aside class="desktop-sidebar" aria-label="Navegación y carrito">
      <div class="sidebar-logo">
        <router-link to="/" class="sidebar-logo-link">
          <img src="/logo.jpg" alt="Boutique de pastas" class="sidebar-logo-img" />
        </router-link>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/">Nuestras Comidas</router-link>
        <router-link to="/sobre-nosotros">Sobre nosotros</router-link>
        <button
          type="button"
          class="theme-toggle-inline"
          :aria-label="isDark ? 'Usar modo claro' : 'Usar modo oscuro'"
          @click="toggleTheme"
        >
          <span class="material-symbols-rounded size-20">{{ isDark ? 'light_mode' : 'dark_mode' }}</span>
        </button>
      </nav>
      <div class="sidebar-cart">
        <h2 class="sidebar-cart-title">Carrito</h2>
        <div class="sidebar-cart-scroll">
          <p v-if="sidebarLineItems.length === 0" class="sidebar-cart-empty">Tu carrito está vacío.</p>
          <ul v-else class="sidebar-cart-list">
            <li v-for="item in sidebarLineItems" :key="item.productId" class="sidebar-cart-item">
              <span class="sidebar-item-name">{{ item.product.titulo }}</span>
              <span class="sidebar-item-precio">$ {{ item.product.costo }}</span>
              <div class="sidebar-item-qty">
                <button type="button" class="qty-btn" aria-label="Quitar uno" @click="restarEnSidebar(item.productId)">
                  <span class="material-symbols-rounded">remove</span>
                </button>
                <span class="qty-num">{{ item.cantidad }}</span>
                <button type="button" class="qty-btn" aria-label="Agregar uno" @click="sumarEnSidebar(item.productId)">
                  <span class="material-symbols-rounded">add</span>
                </button>
              </div>
              <span class="sidebar-item-subtotal">$ {{ item.subtotal }}</span>
            </li>
          </ul>
        </div>
        <div class="sidebar-cart-footer">
          <p class="sidebar-total"><strong>Total: {{ formatTotal() }}</strong></p>
          <RouterLink to="/carrito" class="btn-realizar-pedido">Realizar pedido</RouterLink>
        </div>
      </div>
    </aside>

    <!-- Desktop: header horizontal (oculto, reemplazado por sidebar) -->
    <header class="app-header app-header-desktop">
      <router-link to="/" class="logo">
        <img src="/logo.jpg" alt="Boutique de pastas" class="logo-img" />
      </router-link>
      <nav class="nav-main">
        <button
          type="button"
          class="theme-toggle"
          :aria-label="isDark ? 'Usar modo claro' : 'Usar modo oscuro'"
          @click="toggleTheme"
        >
          <span class="material-symbols-rounded size-22" aria-hidden="true">
            {{ isDark ? 'light_mode' : 'dark_mode' }}
          </span>
        </button>
        <router-link to="/">Nuestras Comidas</router-link>
        <router-link to="/carrito" class="cart-link">
          <span class="material-symbols-rounded size-20">shopping_cart</span>
          Carrito
          <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
        </router-link>
      </nav>
    </header>

    <main class="app-main">
      <RouterView />
    </main>

    <!-- Mobile: barra inferior tipo tabs con logo centrado -->
    <nav class="bottom-nav" aria-label="Navegación principal">
      <div class="bottom-nav-side">
        <router-link to="/" class="nav-btn" active-class="nav-btn-active">
          <span class="material-symbols-rounded">storefront</span>
          <span class="nav-label">Nuestras Comidas</span>
        </router-link>
      </div>
      <router-link to="/sobre-nosotros" class="bottom-nav-logo" aria-label="Sobre nosotros">
        <img src="/logo.jpg" alt="" class="bottom-nav-logo-img" />
      </router-link>
      <div class="bottom-nav-side">
        <router-link to="/carrito" class="nav-btn cart-link" active-class="nav-btn-active">
          <span class="material-symbols-rounded">shopping_cart</span>
          <span class="nav-label">Carrito</span>
          <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
        </router-link>
      </div>
    </nav>
  </div>
</template>

<style scoped>
#app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-bottom: 0;
}

/* ========== Desktop: sidebar (oculto en mobile) ========== */
.desktop-sidebar {
  display: none;
}

/* ========== Desktop: header horizontal (oculto, reemplazado por sidebar) ========== */
.app-header-desktop {
  display: none;
}
.app-header {
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background-soft);
}
.logo {
  display: block;
  max-width: 100%;
}
.logo-img {
  width: 100%;
  height: auto;
  object-fit: contain;
  display: block;
}
.nav-main {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.nav-main a {
  padding: 0.25rem 0.5rem;
}
.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem;
  margin: -0.35rem 0;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.theme-toggle:hover {
  background: var(--color-background-mute);
  color: var(--color-accent);
}
.theme-toggle .size-22 {
  font-size: 22px;
}
.cart-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}
.cart-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  font-size: 0.75rem;
  line-height: 18px;
  text-align: center;
  background: var(--color-accent);
  color: white;
  border-radius: 9px;
}
.app-main {
  flex: 1;
  padding: 1rem;
  /* Mobile: padding que reserva espacio fijo para barra superior e inferior (nada queda oculto) */
  padding-top: calc(var(--mobile-top-bar-height) + 1rem);
  padding-bottom: calc(var(--mobile-bottom-nav-height) + 1rem);
}

/* ========== Barra superior fija: resumen carrito ========== */
.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 101;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 52px;
  padding: 0.5rem 1rem;
  padding-top: max(0.5rem, env(safe-area-inset-top, 0));
  padding-bottom: 0.5rem;
  background: var(--color-background-soft);
  border-bottom: 1px solid var(--color-border);
  box-shadow: 0 2px 8px rgba(27, 65, 110, 0.06);
}
.top-bar-count {
  font-size: 0.9rem;
  color: var(--color-text);
  font-weight: 500;
}
.top-bar-total {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-accent);
}

/* ========== Mobile First: barra inferior tipo tabs ========== */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 0;
  height: calc(128px + env(safe-area-inset-bottom, 0));
  padding: 0 0.5rem 0;
  padding-bottom: env(safe-area-inset-bottom, 0);
  background: var(--color-background-soft);
  border-top: 1px solid var(--color-border);
  box-shadow: 0 -2px 12px rgba(27, 65, 110, 0.08);
}
.bottom-nav-side {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 0.25rem;
  padding-bottom: 0.5rem;
  max-width: 140px;
}
.bottom-nav-logo {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 128px;
  border-radius: 24px 24px 0 0;
  overflow: hidden;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-bottom: none;
  box-shadow: 0 -2px 12px rgba(27, 65, 110, 0.08);
}
.bottom-nav-logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.nav-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.15rem;
  padding: 0.4rem 0.5rem;
  min-width: 56px;
  color: var(--color-text-muted);
  text-decoration: none;
  border-radius: 12px;
  transition: background 0.2s, color 0.2s;
}
.nav-btn .material-symbols-rounded {
  font-size: 24px;
}
.nav-btn:hover {
  color: var(--color-text);
  background: var(--color-background-mute);
}
.nav-btn-active {
  color: var(--color-accent);
  font-weight: 600;
}
.nav-label {
  font-size: 0.7rem;
  line-height: 1.1;
}
.nav-btn.cart-link {
  position: relative;
}
.nav-btn.cart-link .cart-badge {
  position: absolute;
  top: 2px;
  right: 50%;
  transform: translate(50%, 0);
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  font-size: 0.65rem;
  line-height: 16px;
}

/* Desktop: sidebar visible, main con margen; ocultar top-bar y bottom-nav */
@media (min-width: 768px) {
  #app-wrapper {
    padding-bottom: 0;
    flex-direction: row;
  }
  .top-bar {
    display: none;
  }
  .desktop-sidebar {
    display: flex;
    flex-direction: column;
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 20rem;
    z-index: 100;
    background: var(--color-background-soft);
    border-right: 1px solid var(--color-border);
    box-shadow: 2px 0 12px rgba(27, 65, 110, 0.06);
    overflow: hidden;
    font-family: var(--font-vactory);
  }
  .sidebar-logo {
    flex-shrink: 0;
    width: 20rem;
    padding: 1rem;
    border-bottom: 1px solid var(--color-border);
  }
  .sidebar-logo-link {
    display: block;
    text-decoration: none;
    color: inherit;
    width: 100%;
  }
  .sidebar-logo-img {
    width: 100%;
    height: auto;
    object-fit: contain;
    display: block;
  }
  .sidebar-nav {
    flex-shrink: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--color-border);
    font-size: 0.9rem;
  }
  .sidebar-nav a {
    color: var(--color-text);
    text-decoration: none;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
  }
  .sidebar-nav a:hover,
  .sidebar-nav a.router-link-active {
    color: var(--color-accent);
    background: var(--color-background-mute);
  }
  .theme-toggle-inline {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem;
    background: transparent;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    color: var(--color-text);
    cursor: pointer;
  }
  .theme-toggle-inline:hover {
    background: var(--color-background-mute);
    color: var(--color-accent);
  }
  .theme-toggle-inline .size-20 {
    font-size: 20px;
  }
  .sidebar-cart {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    padding: 0 1rem 1rem;
  }
  .sidebar-cart-title {
    flex-shrink: 0;
    margin: 0.75rem 0 0.5rem;
    font-size: 1.1rem;
  }
  .sidebar-cart-scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .sidebar-cart-empty {
    font-size: 0.9rem;
    color: var(--color-text-muted);
    margin: 0.5rem 0;
  }
  .sidebar-cart-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .sidebar-cart-item {
    padding: 0.6rem 0;
    border-bottom: 1px solid var(--color-border);
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-rows: auto auto;
    gap: 0.35rem 0.5rem;
    align-items: center;
    font-size: 0.9rem;
  }
  .sidebar-item-name {
    grid-column: 1;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .sidebar-item-precio {
    grid-column: 2;
    color: var(--color-text-muted);
    font-size: 0.85rem;
  }
  .sidebar-item-qty {
    grid-column: 1;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  .qty-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    background: var(--color-background-mute);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    color: var(--color-text);
    cursor: pointer;
  }
  .qty-btn:hover {
    background: var(--color-border);
    color: var(--color-accent);
  }
  .qty-btn .material-symbols-rounded {
    font-size: 18px;
  }
  .qty-num {
    min-width: 1.5rem;
    text-align: center;
    font-weight: 600;
    font-size: 0.9rem;
  }
  .sidebar-item-subtotal {
    grid-column: 2;
    font-weight: 600;
    font-size: 0.9rem;
  }
  .sidebar-cart-footer {
    flex-shrink: 0;
    padding-top: 0.75rem;
    border-top: 1px solid var(--color-border);
    margin-top: 0.5rem;
  }
  .sidebar-total {
    margin: 0 0 0.5rem;
    font-size: 1rem;
  }
  .btn-realizar-pedido {
    display: block;
    width: 100%;
    padding: 0.6rem 1rem;
    text-align: center;
    background: var(--color-accent);
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.95rem;
  }
  .btn-realizar-pedido:hover {
    filter: brightness(0.95);
  }
  .app-header-desktop {
    display: none;
  }
  .app-main {
    flex: 1;
    margin-left: 20rem;
    padding-bottom: 1rem;
    padding-top: 1rem;
  }
  .bottom-nav {
    display: none;
  }
}
</style>

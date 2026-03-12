import { createRouter, createWebHistory } from 'vue-router'
import TiendaView from '@/views/TiendaView.vue'
import CarritoView from '@/views/CarritoView.vue'
import SobreNosotrosView from '@/views/SobreNosotrosView.vue'
import AdminView from '@/views/AdminView.vue'
import AdminProductos from '@/views/admin/AdminProductos.vue'
import AdminPago from '@/views/admin/AdminPago.vue'
import AdminEnvio from '@/views/admin/AdminEnvio.vue'
import AdminAbout from '@/views/admin/AdminAbout.vue'

/** Posición de scroll de "Nuestras comidas" (tienda) para restaurar al volver */
let tiendaScrollTop = 0

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (to.name === 'carrito') return { top: 0 }
    if (to.name === 'tienda' && from.name) return { top: tiendaScrollTop }
    if (savedPosition) return savedPosition
    return {}
  },
  routes: [
    {
      path: '/',
      name: 'tienda',
      component: TiendaView,
    },
    {
      path: '/carrito',
      name: 'carrito',
      component: CarritoView,
    },
    {
      path: '/sobre-nosotros',
      name: 'sobre-nosotros',
      component: SobreNosotrosView,
    },
    {
      path: '/admin',
      component: AdminView,
      children: [
        {
          path: '',
          redirect: { name: 'admin-productos' },
        },
        {
          path: 'productos',
          name: 'admin-productos',
          component: AdminProductos,
        },
        {
          path: 'pago',
          name: 'admin-pago',
          component: AdminPago,
        },
        {
          path: 'envio',
          name: 'admin-envio',
          component: AdminEnvio,
        },
        {
          path: 'sobre-nosotros',
          name: 'admin-sobre-nosotros',
          component: AdminAbout,
        },
      ],
    },
  ],
})

router.beforeEach((to, from, next) => {
  if (from.name === 'tienda' && typeof window !== 'undefined') {
    tiendaScrollTop = window.scrollY
  }
  next()
})

export default router

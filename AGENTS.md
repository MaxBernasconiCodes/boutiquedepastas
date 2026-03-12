# Guía para el agente (Boutique de pastas)

Proyecto **Vue 3** (Vite), solo frontend, desplegado en **Netlify**. Persistencia en sesión; opcionalmente Netlify Forms para datos de admin (con límites del plan gratuito).

## Estructura del proyecto

- **`src/views/`** — Vistas públicas: `TiendaView.vue` (productos), `CarritoView.vue` (carrito, medios de pago, envío, WhatsApp).
- **`src/views/AdminView.vue`** — Layout del panel admin (login simulado, navegación).
- **`src/views/admin/`** — Subvistas admin: `AdminProductos.vue`, `AdminPago.vue`, `AdminEnvio.vue`.
- **`src/stores/`** — Pinia: `products`, `cart`, `paymentOptions`, `shippingOptions`, `admin`. Todo en memoria (sesión).
- **`src/router/index.js`** — Rutas: `/`, `/carrito`, `/admin` (hijos: `productos`, `pago`, `envio`).

## Flujos principales

1. **Cliente**: Entra → ve productos (store `products`, solo no archivados) → agrega al carrito (`cart`) → va a carrito → elige medio de pago y opción de envío → genera texto y abre WhatsApp.
2. **Admin**: Entra a `/admin` → “login” (cualquier texto por ahora) → gestiona productos (crear, archivar, eliminar), opciones de pago y de envío. Los datos viven solo en sesión; la intención es persistir vía Netlify Forms respetando límites del plan gratuito.

## Convenciones

- **Idioma**: Código y comentarios en español; mensajes de UI en español.
- **Estado**: Pinia con Composition API (setup stores). No hay backend; datos en memoria.
- **Estilos**: CSS con variables en `src/assets/base.css`. Paleta: `--color-fondo` (#F6F4F0), `--color-fuente` (#1B416E), `--color-bordes` (#EAEAED), `--color-acento` (#C02F36). Semánticas: `--color-brand` (fuente/marca), `--color-accent` (acciones/CTAs). Componentes con `<style scoped>`.
- **Iconos**: **Material Symbols Rounded** de Google Fonts, cargados online (no self-hosted). Link en `index.html`; clase `.material-symbols-rounded` y tamaños `.size-18` … `.size-48` en `base.css`. Uso: `<span class="material-symbols-rounded [size-*]">nombre_icono</span>` (nombres en [fonts.google.com/icons](https://fonts.google.com/icons)).
- **Build**: `npm run build` → `dist/`. Netlify usa `netlify.toml` (build + redirects SPA).

## Configuración y entorno

- **WhatsApp**: Número del negocio en `VITE_WHATSAPP_NUMBER` (código de país, sin `+`). Ver `.env.example`. Se usa en `CarritoView.vue`.
- **Netlify Forms**: Límite plan gratuito (p. ej. 100 envíos/mes en cuentas legacy; planes nuevos por créditos). Tenerlo en cuenta al diseñar envíos de productos/opciones desde admin.

## Documentación

- **`docs/`** — Documentación del proyecto. Mantenerla actualizada cuando se cambien flujos, estructura o despliegue.
- **`README.md`** — Cómo instalar, ejecutar y desplegar.

## Mantenimiento de esta guía

- **Cuándo**: Tras cambios relevantes (rutas, stores, flujos, convenciones, despliegue).
- **Qué incluir**: Rutas y vistas, stores y responsabilidades, variables de entorno, límites de Netlify, patrones repetidos.
- **Qué evitar**: Detalles temporales de implementación o preferencias personales no compartidas.

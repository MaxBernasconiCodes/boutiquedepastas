# Arquitectura del proyecto

## Stack

- **Vue 3** (Composition API, `<script setup>`)
- **Vite** — build y dev server
- **Vue Router** — SPA (rutas públicas y admin)
- **Pinia** — estado global (todo en memoria/sesión)
- **Netlify** — hosting y, en el futuro, Forms para persistencia de datos de admin
- **Iconos** — Material Symbols Rounded (Google Fonts, online). Ver [docs/ICONOS.md](ICONOS.md).

## Estructura de carpetas

```
src/
  main.js              # Entrada: Vue app, Pinia, Router
  App.vue              # Layout: header (logo, nav), RouterView
  assets/              # CSS global (base.css, main.css)
  router/index.js      # Definición de rutas
  stores/              # Pinia stores (products, cart, paymentOptions, shippingOptions, admin)
  views/               # Vistas de página
    TiendaView.vue     # Listado de productos y agregar al carrito
    CarritoView.vue    # Resumen, medios de pago, envío, botón WhatsApp
    AdminView.vue      # Layout admin (login + nav + RouterView)
    admin/
      AdminProductos.vue
      AdminPago.vue
      AdminEnvio.vue
  components/          # (Opcional) componentes reutilizables
```

## Rutas

| Ruta | Vista | Descripción |
|------|--------|-------------|
| `/` | TiendaView | Catálogo de productos (activos), agregar al carrito |
| `/carrito` | CarritoView | Resumen, opciones de pago y envío, generar mensaje WhatsApp |
| `/admin` | AdminView | Redirige a `/admin/productos` |
| `/admin/productos` | AdminProductos | CRUD productos (crear, archivar, eliminar) |
| `/admin/pago` | AdminPago | Crear/eliminar opciones de pago |
| `/admin/envio` | AdminEnvio | Crear/eliminar opciones de envío (nombre + costo) |

## Stores (Pinia)

- **products**: Lista de productos (`id`, `titulo`, `descripcion`, `costo`, `foto`, `archivado`). Solo los no archivados se muestran en la tienda.
- **cart**: Líneas `{ productId, cantidad }`; total calculado contra `products`.
- **paymentOptions**: Lista `{ id, nombre }` para mostrar en el carrito.
- **shippingOptions**: Lista `{ id, nombre, costo }` para mostrar en el carrito.
- **admin**: `isLoggedIn` (boolean); login/logout sin backend (cualquier texto “loguea” por ahora).

La persistencia es **solo en sesión**: al recargar la página se pierde todo. La idea es usar Netlify Forms para que el admin envíe productos/opciones y, en un futuro, hidratar los stores desde esos datos (o desde un JSON generado por Forms).

## Flujo cliente

1. Ver productos en `/`.
2. Agregar al carrito (botón por producto).
3. Ir a `/carrito`: ver resumen, elegir medio de pago y opción de envío.
4. “Enviar pedido por WhatsApp”: se arma un texto con ítems, subtotal, envío, total y medio de pago; se abre `https://wa.me/{número}?text=...`. El número se toma del store **aboutUs** (campo «Teléfono para pedidos (WhatsApp)» en Admin → Sobre nosotros). Si no hay número, el botón queda deshabilitado.

## Flujo admin

1. Ir a `/admin` → pantalla de “login” (por ahora cualquier clave).
2. Navegar a Productos / Opciones de pago / Opciones de envío.
3. Productos: crear (título, descripción, costo, URL foto), archivar o eliminar.
4. Pago: agregar opciones por nombre (ej. “Transferencia”, “Efectivo”).
5. Envío: agregar opciones con nombre y costo (ej. “Zona centro — $500”).

## Variables de entorno

- No se usa variable de entorno para el número de WhatsApp: se configura en Admin → Sobre nosotros → «Teléfono para pedidos (WhatsApp)». Si hace falta otra variable para el build, agregarla en `.env` (ver `.env.example`).

## Tema y paleta de colores

Definido en `src/assets/base.css` a partir de la imagen de referencia:

| Variable | Valor | Uso |
|----------|--------|-----|
| `--color-fondo` | #F6F4F0 | Fondo principal |
| `--color-fuente` | #1B416E | Color de texto y marca |
| `--color-bordes` | #EAEAED | Bordes |
| `--color-acento` | #C02F36 | Botones CTA, enlaces hover, badge carrito |

Variables semánticas derivadas: `--color-background`, `--color-background-soft`, `--color-border`, `--color-heading`, `--color-text`, `--color-text-muted`, `--color-brand`, `--color-accent`. En modo oscuro el fondo usa tonos del azul (#1B416E) y el texto el color de fondo (#F6F4F0); el acento se mantiene.

---

*Última actualización: al crear el proyecto inicial. Actualizar al cambiar rutas, stores o flujos.*

# Boutique de pastas

Sitio de pedidos para un negocio de pastas: catálogo, carrito, medios de pago y envío, y envío del pedido por WhatsApp. Incluye panel de administración (productos, opciones de pago y envío).

- **Stack**: Vue 3, Vite, Vue Router, Pinia.
- **Hosting**: Netlify (plan gratuito).
- **Persistencia**: solo en sesión por ahora; se prevé usar Netlify Forms para datos de admin (ver [docs/NETLIFY-FORMS.md](docs/NETLIFY-FORMS.md)).

## Requisitos

- Node.js 20+ (o según `engines` en `package.json`)

## Instalación

```sh
npm install
```

Variables de entorno (opcional): copiar `.env.example` a `.env` y configurar `VITE_WHATSAPP_NUMBER` (número del negocio con código de país, sin `+`) para el botón de WhatsApp en el carrito.

## Desarrollo

```sh
npm run dev
```

Abre la URL que indique Vite (por defecto `http://localhost:5173`).

- **Tienda**: `/`
- **Carrito**: `/carrito`
- **Admin**: `/admin` (cualquier texto en “Clave de acceso” para entrar)

## Build para producción

```sh
npm run build
```

Genera la carpeta `dist/`. Netlify usa este comando y publica `dist` (ver `netlify.toml`).

## Lint y formato

```sh
npm run lint
npm run format
```

## Documentación

- [docs/README.md](docs/README.md) — Índice de la documentación.
- [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) — Estructura, rutas, stores y flujos.
- [docs/NETLIFY.md](docs/NETLIFY.md) — Despliegue en Netlify.
- [docs/NETLIFY-FORMS.md](docs/NETLIFY-FORMS.md) — Uso previsto de Netlify Forms y límites.

Mantener la documentación actualizada al cambiar el proyecto.

## IDE

Recomendado: [VS Code](https://code.visualstudio.com/) con la extensión [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar).

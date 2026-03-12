# Despliegue en Netlify

## Configuración actual

El proyecto incluye **`netlify.toml`** en la raíz:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

- **Build**: se ejecuta `npm run build` (Vite genera `dist/`).
- **Publicación**: carpeta `dist`.
- **Redirects**: todas las rutas sirven `index.html` para que Vue Router funcione en modo history (SPA).

## Pasos para desplegar

1. Subir el repositorio a Git (GitHub, GitLab o Bitbucket).
2. En [Netlify](https://netlify.com): “Add new site” → “Import an existing project” y conectar el repo.
3. Netlify detecta `netlify.toml`; no suele hacer falta configurar comando ni directorio a mano.
4. No hace falta definir variables de entorno para el número de WhatsApp: se configura en Admin → Sobre nosotros → «Teléfono para pedidos (WhatsApp)». Si está vacío, el botón del carrito queda deshabilitado.

## Capa gratuita

- Sitios estáticos y builds están en el plan gratuito.
- Forms tienen límite de envíos (ver `docs/NETLIFY-FORMS.md`).

---

*Actualizar si se cambia el comando de build, la carpeta de publicación o los redirects.*

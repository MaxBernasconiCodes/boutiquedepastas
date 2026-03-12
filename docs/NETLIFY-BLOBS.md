# Netlify Blobs para imágenes de productos

Las imágenes de productos se pueden **subir a Netlify Blobs** y guardar en Neon solo la **URL** que sirve esa imagen. Así la base de datos no guarda los bytes de la foto.

## Cómo activar / usar Netlify Blobs

**No hay que activar nada a mano.** Netlify Blobs viene integrado en la plataforma:

1. **Instalá el paquete** en el proyecto (ya está en el repo):
   ```bash
   npm install @netlify/blobs
   ```

2. **En Netlify (producción)**  
   Al hacer deploy, Netlify inyecta el contexto de Blobs en las Functions. No hace falta crear variables de entorno ni dar de alta Blobs en el dashboard.

3. **En local**  
   Para que las Functions que usan Blobs funcionen en tu máquina, usá **Netlify Dev** en lugar de solo `npm run dev`:
   ```bash
   netlify dev
   ```
   Así se simula el entorno de Netlify y Blobs funciona en local.

4. **Ver blobs guardados**  
   En el dashboard de Netlify: **Build** → **Data** → **Blobs** (o **Storage** / **Blobs** según la versión). Ahí podés ver y descargar los archivos del store `product-images`.

## Flujo en este proyecto

- **Subir imagen:** En Admin → Productos, el formulario permite elegir un archivo. El front envía la imagen en base64 a la Function **`upload-product-image`**, que la guarda en el store de Blobs con una clave única y devuelve una URL del tipo:
  `/.netlify/functions/serve-product-image?key=...`
- Esa URL se guarda en Neon en el campo **`foto`** del producto (igual que si fuera una URL externa).
- **Ver imagen:** La tienda y el admin usan esa URL como `src` de la imagen. La Function **`serve-product-image`** recibe el `key`, lee el blob y lo devuelve con el `Content-Type` correcto.

No hace falta configurar nada más en Netlify para usar Blobs; con el paquete instalado y el deploy (o `netlify dev` en local) alcanza.

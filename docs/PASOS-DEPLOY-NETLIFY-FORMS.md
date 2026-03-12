# Pasos para deploy en Netlify y conectar Forms

## Parte 1: Deploy del sitio (que la web funcione)

1. **Subir el código a Git**
   - Crea un repo en GitHub, GitLab o Bitbucket y sube el proyecto.

2. **Crear el sitio en Netlify**
   - Entra en [netlify.com](https://netlify.com) → **Add new site** → **Import an existing project**.
   - Conecta tu cuenta con el repo y elige el repositorio del proyecto.

3. **Configuración del build**
   - Netlify suele detectar `netlify.toml` automáticamente:
     - **Build command:** `npm run build`
     - **Publish directory:** `dist`
   - Si no lo detecta, configúralo manualmente en **Site settings → Build & deploy**.

4. **Variables de entorno**
   - No hace falta configurar el número de WhatsApp como variable de entorno: el **teléfono para pedidos (WhatsApp)** se configura en el panel de administración → **Sobre nosotros** → campo «Teléfono para pedidos (WhatsApp)». Si no hay número cargado, el botón «Enviar pedido por WhatsApp» en el carrito queda deshabilitado y se muestra un aviso para configurarlo desde Admin.

5. **Desplegar**
   - **Deploy site** (o deja que se dispare con el primer push). El sitio quedará en una URL tipo `https://nombre-random.netlify.app`. Las rutas `/`, `/carrito`, `/admin`, etc. funcionan gracias al redirect SPA en `netlify.toml`.

Con esto la tienda y el carrito funcionan; el admin también, pero los datos siguen solo en sesión (se pierden al recargar). El número de WhatsApp del botón del carrito se toma del formulario **Sobre nosotros** en el admin; si está vacío, el botón se deshabilita.

---

## Parte 2: Conectar Netlify Forms (persistir envíos del admin)

Para que cada “Crear producto”, “Agregar” opción de pago/envío o “Guardar cambios” de Sobre nosotros se envíe también a Netlify y quede registrado:

### 2.1 Límites a tener en cuenta

- Plan gratuito: **límite de envíos de formularios por mes** (p. ej. 100 en cuentas legacy; en planes por créditos depende de los créditos). Cada envío cuenta.
- Ver: [Forms usage and billing](https://docs.netlify.com/manage/forms/usage-and-billing).

### 2.2 Cómo funciona Netlify Forms con una SPA (Vue)

- Netlify **descubre** los formularios leyendo el **HTML estático** en el momento del build (por eso hace falta que el form exista en el HTML que se publica).
- En una SPA el formulario está en Vue; para que Netlify lo registre hay que:
  1. Incluir en el HTML (por ejemplo en `index.html`) **formularios ocultos** con `data-netlify="true"` y un `name` único por tipo de envío.
  2. Desde Vue, al enviar (crear producto, agregar opción, guardar sobre nosotros), hacer un **POST** con los mismos campos que el form oculto (vía `fetch` o enviando el form oculto).

### 2.3 Pasos concretos

1. **Definir un formulario oculto por cada “tipo” de envío**  
   En `index.html` (o en una página estática que se incluya en el build), dentro del `<body>`, añadir forms que Netlify pueda ver. Ejemplo para **productos**:

   ```html
   <form name="producto" data-netlify="true" netlify-honeypot="bot" hidden>
     <input type="text" name="titulo" />
     <textarea name="descripcion"></textarea>
     <input type="number" name="costo" />
     <input type="url" name="foto" />
     <input type="text" name="bot" tabindex="-1" autocomplete="off" />
   </form>
   ```

   Repetir la idea para: **opcion-pago** (nombre, descripcion), **opcion-envio** (nombre, costo, descripcion), **sobre-nosotros** (titulo, descripcion, foto, telefono, email, redes…), con los mismos `name` que use la app.

2. **En el build, que Netlify vea los forms**  
   Netlify analiza el HTML de `dist/` después de `npm run build`. Como Vite genera `index.html` desde la plantilla, los forms ocultos deben estar en la plantilla de `index.html` del proyecto para que acaben en `dist/index.html`.

3. **Enviar desde Vue al enviar en el admin**  
   En lugar de (o además de) actualizar solo Pinia:
   - Construir un `FormData` o un objeto con los mismos `name` que el form oculto.
   - Hacer `fetch("/", { method: "POST", body: formData, headers: { "Content-Type": "application/x-www-form-urlencoded" } })`  
     o el método que recomiende Netlify para [enviar forms por JavaScript](https://docs.netlify.com/forms/setup/#submit-html-forms-via-javascript).

   La URL del POST es la del propio sitio (dominio de Netlify); el `name` del form debe ir en el body (p. ej. como campo `form-name`).

4. **Comprobar en Netlify**  
   En el panel: **Forms** → ver los envíos por cada form (`producto`, `opcion-pago`, etc.).

### 2.4 Recuperar datos (hidratar la app)

- Los envíos se ven y exportan desde el panel de Netlify.
- Para **cargar** productos/opciones/sobre-nosotros desde Netlify al abrir la página hace falta algo más, por ejemplo:
  - **Netlify Functions**: una función que lea envíos (API de Netlify con token) y devuelva JSON para hidratar los stores, o
  - Exportar envíos a un JSON y servirlo como estático, o
  - Usar otro backend que importe desde Netlify.

Eso sería una fase posterior; la Parte 2 anterior solo persigue que **los envíos queden guardados en Netlify Forms**.

---

## Resumen rápido

| Objetivo | Pasos |
|----------|--------|
| **Solo que la web funcione en Netlify** | 1–5 de la Parte 1 (repo + conectar + build + variables si aplican). |
| **Que los envíos del admin se guarden en Netlify** | Parte 2: forms ocultos en `index.html` con `data-netlify="true"`, mismo `name` y campos; desde Vue hacer POST al publicar producto/opción/sobre nosotros; revisar en Netlify → Forms. |
| **Que la app cargue esos datos al iniciar** | Implementar después (Functions, JSON estático o backend propio). |

Para más detalle sobre límites y estrategia de Forms: [NETLIFY-FORMS.md](./NETLIFY-FORMS.md).  
Para opciones de build y redirects: [NETLIFY.md](./NETLIFY.md).

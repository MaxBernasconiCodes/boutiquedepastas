# Usar Neon como base de datos del panel de administración

En lugar de Netlify Forms, el proyecto puede usar una base de datos **Neon** (PostgreSQL) para guardar y cargar productos, opciones de pago, opciones de envío y los datos de "Sobre nosotros". Las **Netlify Functions** se conectan a Neon y exponen una API; el frontend Vue llama a esa API para hidratar los stores y para cada acción del admin.

## Resumen de pasos

1. Obtener la **connection string** de tu proyecto Neon (o que Neon ya haya conectado con Netlify y creado **`NETLIFY_DATABASE_URL_UNPOOLED`**).
2. Crear las **tablas** en Neon ejecutando el SQL del proyecto.
3. Si Neon ya conectó con Netlify, la variable **`NETLIFY_DATABASE_URL_UNPOOLED`** ya está en el sitio; las Functions la usan. Para probar en local con `netlify dev`, podés definir **`DATABASE_URL`** en un `.env`.
4. Desplegar; las Functions conectarán a Neon usando esa variable.

---

## 1. Connection string de Neon

1. Entrá al [Neon Console](https://console.neon.tech/).
2. Elegí el proyecto de **boutiquedepastas** (o el que hayas creado).
3. En el dashboard, click en **Connect** (o "Connection string").
4. Copiá la **connection string** (formato `postgresql://usuario:password@host/neondb?sslmode=require`).  
   Usá la que diga **Pooled connection** si está disponible (mejor para serverless).

---

## 2. Crear las tablas en Neon

En el mismo Neon Console, abrí el **SQL Editor** y ejecutá el contenido del archivo **`scripts/schema-neon.sql`** del repositorio (o el SQL que te indique el proyecto). Ese script crea:

- `products` — productos (título, descripción, costo, foto, archivado).
- `payment_options` — opciones de pago (nombre, descripción).
- `shipping_options` — opciones de envío (nombre, costo, descripción).
- `about_us` — una sola fila con título, descripción, foto, teléfono, email, redes (Instagram/Facebook).

El archivo está en **`scripts/schema-neon.sql`**. Copiá su contenido en el SQL Editor de Neon y ejecutalo.

---

## 3. Variable de entorno en Netlify

Si conectaste Neon con Netlify desde el dashboard de Neon, **Neon ya creó la variable** `NETLIFY_DATABASE_URL_UNPOOLED` en tu sitio de Netlify con la connection string. Las Netlify Functions de este proyecto usan esa variable (o `DATABASE_URL` si la definís vos).

- **No hace falta** que crees `DATABASE_URL` a mano si ya tenés `NETLIFY_DATABASE_URL_UNPOOLED`.
- Para probar en local con `netlify dev`, podés crear un archivo **`.env`** en la raíz con:
  - `DATABASE_URL=postgresql://...` (tu connection string de Neon),  
  ya que en local Netlify no inyecta `NETLIFY_DATABASE_URL_UNPOOLED` automáticamente.

---

## 4. Deploy

1. Subí los cambios (incluyendo la carpeta `netlify/functions/` y el `netlify.toml` actualizado).
2. Netlify hará el build (Vite) y desplegará las Functions.
3. El frontend llama a `/.netlify/functions/products`, `/.netlify/functions/payment-options`, etc. Esas funciones leen y escriben en Neon usando `DATABASE_URL`.

---

## Límites del plan Free de Neon

- **Compute hours** (p. ej. 100 horas/mes).
- **Scale to zero** tras inactividad (puede haber un pequeño “cold start” en la primera petición).
- **Almacenamiento** por proyecto (p. ej. 0,5 GB).
- Para más detalles: [Neon Pricing](https://neon.tech/docs/introduction/plans).

Si no configurás `DATABASE_URL`, la app sigue funcionando con datos en sesión (mock o vacío), como antes; al configurar Neon, los datos del admin se persisten y se hidratan desde la base.

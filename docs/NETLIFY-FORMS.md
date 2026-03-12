# Netlify Forms y límites

## Uso previsto en el proyecto

Los **productos** y las **opciones de pago y envío** se gestionan hoy solo en memoria (Pinia, sesión). La idea es usar **Netlify Forms** para que el administrador pueda “guardar” datos sin backend propio:

- Un formulario por cada “alta” (producto nuevo, opción de pago, opción de envío).
- Netlify recibe el envío y lo guarda; el sitio puede (en una fase posterior) leer esos envíos o exportar datos para hidratar los stores al cargar la página.

Hay que tener en cuenta el **límite de envíos** del plan.

## Límites del plan gratuito

- **Cuentas antiguas (Legacy)**: típicamente **100 envíos de formularios por mes** (reseteo mensual). Superar el límite puede implicar avisos o restricciones si no se añade método de pago.
- **Planes nuevos (por créditos)**: el plan Free suele incluir un número de créditos al mes; cada envío de formulario consume créditos. Al agotarlos, el sitio puede pausarse.

Consultar la documentación oficial actualizada: [Forms usage and billing](https://docs.netlify.com/manage/forms/usage-and-billing).

## Implicaciones para este proyecto

- Cada “crear producto” o “agregar opción” que se envíe como form cuenta como un envío.
- Para un uso moderado (pocos productos y opciones, actualizaciones no muy frecuentes) puede ser suficiente; para muchos cambios diarios, el límite se puede alcanzar rápido.
- Conviene informar al administrador del límite y, si se implementa persistencia vía Forms, considerar un aviso cuando se aproxime al límite (si la API de Netlify lo permite).

## Integración futura

Cuando se implemente la persistencia con Netlify Forms:

1. Añadir en el HTML formularios con `name` y `data-netlify="true"` (o el método que use el proyecto).
2. En admin, al “crear” producto u opción, enviar el form vía `fetch` a la misma URL del sitio (o la ruta que Netlify asigne al form).
3. Documentar aquí la estructura de los formularios y cómo se mapean a productos/opciones de pago/envío.

---

*Actualizar cuando se definan los formularios y la estrategia de persistencia.*

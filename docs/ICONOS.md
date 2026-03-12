# Iconos: Material Symbols Rounded

El proyecto usa **Material Symbols** en estilo **Rounded**, cargados desde **Google Fonts** (online, sin self-hosting).

## Carga

- **Dónde**: En `index.html` hay un `<link>` a la API de Google Fonts con la familia `Material+Symbols+Rounded` y ejes por defecto (opsz 24, weight 400, fill 0, grad 0).
- **Estilos**: En `src/assets/base.css` está la clase `.material-symbols-rounded` y las variantes de tamaño (`.size-18` a `.size-48`).

## Uso en la app

```html
<span class="material-symbols-rounded">shopping_cart</span>
<span class="material-symbols-rounded size-20">add</span>
```

- **Clase base**: `material-symbols-rounded`.
- **Tamaño** (opcional): `size-18`, `size-20`, `size-24` (por defecto), `size-32`, `size-40`, `size-48`.
- **Nombre del icono**: En formato ligatura (snake_case), por ejemplo `shopping_cart`, `add`, `delete`, `settings`. Listado completo en [Material Symbols Library](https://fonts.google.com/icons).

El icono se muestra como texto (ligatura); el color y la herencia de fuente se controlan con CSS normal (p. ej. `color: inherit`).

## Referencia

- [Material Symbols guide (Google Fonts)](https://developers.google.com/fonts/docs/material_symbols)
- [Material Symbols Library](https://fonts.google.com/icons) — buscar nombres y copiar en snake_case.

---

*Actualizar si se cambia la fuente de iconos o la forma de cargarlos.*

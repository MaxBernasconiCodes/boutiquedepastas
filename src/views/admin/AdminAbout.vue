<script setup>
import { storeToRefs } from 'pinia'
import { useAboutUsStore } from '@/stores/aboutUs'

const aboutStore = useAboutUsStore()
const { data } = storeToRefs(aboutStore)

/**
 * Guardar cambios: reemplaza la instancia actual por una nueva con los datos del formulario.
 * Con Netlify Forms sería "enviar form" = nueva entrega.
 */
function guardar() {
  aboutStore.replaceWith({
    titulo: data.value.titulo,
    descripcion: data.value.descripcion,
    foto: data.value.foto,
    telefono: data.value.telefono,
    email: data.value.email,
    redes: {
      instagram: (data.value.redes?.instagram ?? '').trim(),
      facebook: (data.value.redes?.facebook ?? '').trim(),
    },
  })
}
</script>

<template>
  <div class="admin-about">
    <h2>Sobre nosotros</h2>
    <p class="hint">Estos datos se muestran en la página "Sobre nosotros", a la que se llega al hacer clic en el logo del menú. El teléfono se usa también para el enlace de WhatsApp del carrito. Cada "Guardar cambios" reemplaza la versión anterior (con Netlify Forms sería un nuevo envío del form).</p>

    <section class="admin-form-card">
    <form @submit.prevent="guardar" class="form-block">
      <label>
        Título
        <input v-model="data.titulo" type="text" placeholder="Ej: Boutique de pastas" />
      </label>
      <label>
        Descripción
        <textarea v-model="data.descripcion" rows="4" placeholder="Texto sobre el negocio..." />
      </label>
      <label>
        URL de la foto
        <input v-model="data.foto" type="url" placeholder="https://..." />
      </label>
      <label>
        Teléfono para pedidos (WhatsApp)
        <input v-model="data.telefono" type="tel" placeholder="Código país + número, ej: 5491112345678" />
      </label>
      <label>
        Email
        <input v-model="data.email" type="email" placeholder="contacto@ejemplo.com" />
      </label>

      <fieldset class="redes-fieldset">
        <legend>Redes sociales</legend>
        <p class="redes-hint">Solo Instagram y Facebook por el momento. Si dejas la URL vacía, no se mostrará en la página.</p>
        <label class="red-row">
          <span class="red-label">Instagram</span>
          <input v-model="data.redes.instagram" type="url" placeholder="https://instagram.com/tu-cuenta" />
        </label>
        <label class="red-row">
          <span class="red-label">Facebook</span>
          <input v-model="data.redes.facebook" type="url" placeholder="https://facebook.com/tu-pagina" />
        </label>
      </fieldset>

      <button type="submit" class="btn-guardar">Guardar cambios</button>
    </form>
    </section>
  </div>
</template>

<style scoped>
.admin-about h2 {
  margin-top: 0;
}
.hint {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  margin-bottom: 1.5rem;
}
.form-block {
  max-width: 480px;
}
.redes-fieldset {
  padding: 1.25rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  margin: 0.5rem 0 1rem;
}
.redes-fieldset legend {
  padding: 0 0.5rem;
  font-weight: 600;
}
.redes-hint {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin: 0 0 0.75rem;
}
.red-row {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1rem;
}
.red-row:last-of-type {
  margin-bottom: 0;
}
.red-label {
  font-weight: 500;
  font-size: 0.95rem;
}
</style>

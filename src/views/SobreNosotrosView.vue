<script setup>
import { storeToRefs } from 'pinia'
import { useAboutUsStore } from '@/stores/aboutUs'
import SocialLogo from '@/components/SocialLogo.vue'

const aboutStore = useAboutUsStore()
const { data } = storeToRefs(aboutStore)

const tieneRedes = () => !!(data.value?.redes?.instagram || data.value?.redes?.facebook)
</script>

<template>
  <div class="sobre-nosotros">
    <header v-if="data.titulo || data.foto" class="sobre-header">
      <img
        v-if="data.foto"
        :src="data.foto"
        alt=""
        class="sobre-foto"
      />
      <h1 v-if="data.titulo" class="sobre-titulo">{{ data.titulo }}</h1>
    </header>

    <div v-if="data.descripcion" class="sobre-descripcion">
      <p>{{ data.descripcion }}</p>
    </div>

    <section v-if="data.telefono || data.email || tieneRedes()" class="sobre-contacto">
      <h2>Contacto</h2>
      <p v-if="data.telefono" class="contacto-line">
        <span class="material-symbols-rounded icon">phone</span>
        <a :href="`tel:${data.telefono}`">{{ data.telefono }}</a>
        <span class="hint">(pedidos por WhatsApp)</span>
      </p>
      <p v-if="data.email" class="contacto-line">
        <span class="material-symbols-rounded icon">mail</span>
        <a :href="`mailto:${data.email}`">{{ data.email }}</a>
      </p>
      <div v-if="tieneRedes()" class="redes">
        <a
          v-if="data.redes?.instagram"
          :href="data.redes.instagram"
          target="_blank"
          rel="noopener noreferrer"
          class="red-link"
          aria-label="Instagram"
        >
          <SocialLogo red="instagram" />
          <span>Instagram</span>
        </a>
        <a
          v-if="data.redes?.facebook"
          :href="data.redes.facebook"
          target="_blank"
          rel="noopener noreferrer"
          class="red-link"
          aria-label="Facebook"
        >
          <SocialLogo red="facebook" />
          <span>Facebook</span>
        </a>
      </div>
    </section>

    <div v-if="!data.titulo && !data.descripcion && !data.telefono && !data.email && !tieneRedes()" class="empty">
      <p>Contenido en preparación.</p>
      <p class="hint">Los datos se configuran desde el panel de administración.</p>
    </div>
  </div>
</template>

<style scoped>
.sobre-nosotros {
  padding: 1rem;
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}
.sobre-header {
  margin-bottom: 1rem;
}
.sobre-foto {
  width: 100%;
  max-height: 280px;
  object-fit: cover;
  border-radius: 12px;
  display: block;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 1rem;
}
.sobre-titulo {
  margin: 0;
  font-size: 1.5rem;
  text-align: center;
}
.sobre-descripcion {
  margin-bottom: 1.5rem;
  line-height: 1.6;
  text-align: center;
}
.sobre-descripcion p {
  margin: 0;
  white-space: pre-wrap;
  text-align: center;
}
.sobre-contacto {
  text-align: center;
}
.sobre-contacto h2 {
  margin: 0 0 0.75rem;
  font-size: 1.1rem;
  text-align: center;
}
.contacto-line {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0 0 0.5rem;
}
.contacto-line .icon {
  font-size: 20px;
  color: var(--color-text-muted);
}
.contacto-line a {
  color: var(--color-brand);
}
.contacto-line .hint {
  margin-left: 0.25rem;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}
.redes {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1rem;
}
.red-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  text-decoration: none;
  color: var(--color-text);
  font-size: 0.95rem;
}
.red-link:hover {
  background: var(--color-border);
  color: var(--color-accent);
}
.red-link .social-logo {
  width: 24px;
  height: 24px;
}
.empty {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-muted);
}
.empty .hint {
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

@media (min-width: 768px) {
  .sobre-nosotros {
    text-align: left;
  }
  .sobre-titulo,
  .sobre-descripcion p,
  .sobre-contacto,
  .sobre-contacto h2 {
    text-align: left;
  }
  .sobre-descripcion {
    text-align: left;
  }
  .contacto-line {
    justify-content: flex-start;
  }
  .redes {
    justify-content: flex-start;
  }
}
</style>

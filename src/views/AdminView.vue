<script setup>
import { ref } from 'vue'
import { useAdminStore } from '@/stores/admin'

const adminStore = useAdminStore()

const showLogin = ref(true)
const password = ref('')

function login() {
  // Sin backend: cualquier valor "loguea". Reemplazar por lógica real si se desea.
  if (password.value.trim()) {
    adminStore.login()
    showLogin.value = false
  }
}

function logout() {
  adminStore.logout()
  showLogin.value = true
  password.value = ''
}
</script>

<template>
  <div class="admin-layout">
    <template v-if="!adminStore.isLoggedIn">
      <div class="login-box">
        <h1>Admin</h1>
        <p>Acceso solo para administradores.</p>
        <form @submit.prevent="login">
          <input
            v-model="password"
            type="password"
            placeholder="Clave de acceso"
            autocomplete="current-password"
          />
          <button type="submit">Entrar</button>
        </form>
        <p class="hint">Por ahora cualquier texto permite entrar (sin backend).</p>
      </div>
    </template>

    <template v-else>
      <header class="admin-header">
        <h1>Panel de administración</h1>
        <button type="button" class="btn-logout" @click="logout">Salir</button>
      </header>
      <nav class="admin-nav">
        <router-link to="/admin/productos">Productos</router-link>
        <router-link to="/admin/pago">Opciones de pago</router-link>
        <router-link to="/admin/envio">Opciones de envío</router-link>
        <router-link to="/admin/sobre-nosotros">Sobre nosotros</router-link>
      </nav>
      <main class="admin-main">
        <RouterView />
      </main>
    </template>
  </div>
</template>

<style scoped>
.admin-layout {
  min-height: 60vh;
  padding: 1rem;
}
.login-box {
  max-width: 320px;
  margin: 2rem auto;
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
}
.login-box h1 {
  margin-top: 0;
}
.login-box form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}
.login-box input {
  padding: 0.6rem 0.85rem;
  font-size: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background);
}
.login-box button[type="submit"] {
  padding: 0.6rem 1.25rem;
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-background);
  background: var(--color-accent);
  border: none;
  border-radius: 10px;
  cursor: pointer;
}
.hint {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-top: 1rem;
}
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.btn-logout {
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 6px;
}
.admin-nav {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}
.admin-nav a.router-link-active {
  font-weight: 600;
}
.admin-main {
  max-width: 800px;
}

/* Estilos unificados para formularios del panel (inputs redondeados, alineación) */
.admin-main :deep(form),
.admin-main :deep(.form-block),
.admin-main :deep(.form-nuevo) {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-width: 480px;
}
.admin-main :deep(label) {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1rem;
  font-weight: 500;
  font-size: 0.95rem;
  color: var(--color-text);
}
.admin-main :deep(label:last-of-type) {
  margin-bottom: 0.75rem;
}
.admin-main :deep(input),
.admin-main :deep(textarea) {
  width: 100%;
  padding: 0.6rem 0.85rem;
  font-size: 1rem;
  line-height: 1.4;
  color: var(--color-text);
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.admin-main :deep(input:hover),
.admin-main :deep(textarea:hover) {
  border-color: var(--color-border-hover);
}
.admin-main :deep(input:focus),
.admin-main :deep(textarea:focus) {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px rgba(192, 47, 54, 0.15);
}
.admin-main :deep(textarea) {
  resize: vertical;
  min-height: 80px;
}
.admin-main :deep(form) button[type="submit"],
.admin-main :deep(.btn-guardar) {
  padding: 0.6rem 1.25rem;
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-background);
  background: var(--color-accent);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: filter 0.2s;
  align-self: flex-start;
}
.admin-main :deep(form) button[type="submit"]:hover,
.admin-main :deep(.btn-guardar:hover) {
  filter: brightness(1.05);
}
.admin-main :deep(.btn-small) {
  padding: 0.35rem 0.75rem;
  font-size: 0.875rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.admin-main :deep(.btn-small.danger) {
  border-radius: 8px;
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: transparent;
}
.admin-main :deep(.btn-small.danger:hover) {
  background: rgba(192, 47, 54, 0.08);
}
.admin-main :deep(fieldset) {
  border-radius: 10px;
}

/* Contenedor tipo card para formularios (igual que Productos) */
.admin-main :deep(.admin-form-card) {
  margin-bottom: 2rem;
  padding: 1.25rem 1.5rem;
  background: var(--color-background-soft);
  border-radius: 12px;
}
</style>

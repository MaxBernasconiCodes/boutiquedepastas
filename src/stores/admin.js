import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * Admin: acceso por ruta /admin. Sin backend, "logueado" es un flag en sesión.
 * En producción podrías usar una clave en localStorage o query param de un solo uso.
 */
export const useAdminStore = defineStore('admin', () => {
  const isLoggedIn = ref(false)

  function login() {
    isLoggedIn.value = true
  }

  function logout() {
    isLoggedIn.value = false
  }

  return { isLoggedIn, login, logout }
})

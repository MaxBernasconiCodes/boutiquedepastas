import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * Datos de la sección "Sobre nosotros": contacto, redes, teléfono para pedidos (WhatsApp), título, descripción, foto.
 * Un solo objeto en memoria. Con Netlify Forms: cada "Guardar cambios" = nueva entrega (se reemplaza la instancia anterior).
 */
const defaultData = () => ({
  titulo: '',
  descripcion: '',
  foto: '',
  telefono: '',
  email: '',
  redes: { instagram: '', facebook: '' },
})

export const useAboutUsStore = defineStore('aboutUs', () => {
  const data = ref(defaultData())

  /** Actualiza campos parciales (merge). */
  function update(partial) {
    data.value = { ...data.value, ...partial }
  }

  /**
   * Reemplaza todo el contenido por una nueva instancia (simula envío de form en Netlify).
   */
  function replaceWith(partial) {
    const redes = partial?.redes && typeof partial.redes === 'object' && !Array.isArray(partial.redes)
      ? { instagram: String(partial.redes.instagram ?? '').trim(), facebook: String(partial.redes.facebook ?? '').trim() }
      : defaultData().redes
    data.value = {
      ...defaultData(),
      titulo: partial?.titulo ?? '',
      descripcion: partial?.descripcion ?? '',
      foto: partial?.foto ?? '',
      telefono: partial?.telefono ?? '',
      email: partial?.email ?? '',
      redes,
    }
  }

  function loadMock(partial) {
    if (!partial) {
      data.value = defaultData()
      return
    }
    replaceWith(partial)
  }

  return { data, update, replaceWith, loadMock }
})

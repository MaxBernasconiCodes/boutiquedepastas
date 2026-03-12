import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import {
  mockProductos,
  mockOpcionesPago,
  mockOpcionesEnvio,
  mockAboutUs,
} from './data/mock'
import { useProductsStore } from './stores/products'
import { useSectionsStore } from './stores/sections'
import { usePaymentOptionsStore } from './stores/paymentOptions'
import { useShippingOptionsStore } from './stores/shippingOptions'
import { useAboutUsStore } from './stores/aboutUs'
import { hydrateFromApi } from './api/admin'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

async function init() {
  const data = await hydrateFromApi()
  if (data) {
    useProductsStore(pinia).loadMock(data.products)
    useSectionsStore(pinia).loadMock(data.sections)
    usePaymentOptionsStore(pinia).loadMock(data.paymentOptions)
    useShippingOptionsStore(pinia).loadMock(data.shippingOptions)
    useAboutUsStore(pinia).loadMock(data.about)
  } else {
    useProductsStore(pinia).loadMock(mockProductos)
    useSectionsStore(pinia).loadMock([])
    usePaymentOptionsStore(pinia).loadMock(mockOpcionesPago)
    useShippingOptionsStore(pinia).loadMock(mockOpcionesEnvio)
    useAboutUsStore(pinia).loadMock(mockAboutUs)
  }
  app.mount('#app')
}

init()

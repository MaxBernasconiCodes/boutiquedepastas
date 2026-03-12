/**
 * Datos mock para desarrollo y pruebas.
 * Simula la estructura que luego vendrá de Netlify Forms.
 * No usar en producción con datos reales; al deployar se reemplazará por Forms.
 */

/** @type {Array<{ id: string, titulo: string, descripcion: string, costo: number, foto?: string, archivado?: boolean, seccion_id?: string, orden?: number }>} */
export const mockProductos = [
  {
    id: 'mock-1',
    titulo: 'Ravioles de verdura',
    descripcion: 'Ravioles caseros rellenos de espinaca y ricotta. Porción 500 g.',
    costo: 2800,
    foto: 'https://picsum.photos/seed/ravioles/400/300',
    archivado: false,
  },
  {
    id: 'mock-2',
    titulo: 'Sorrentinos de jamón y queso',
    descripcion: 'Sorrentinos con jamón natural y muzza. Porción 500 g.',
    costo: 3200,
    foto: 'https://picsum.photos/seed/sorrentinos/400/300',
    archivado: false,
  },
  {
    id: 'mock-3',
    titulo: 'Ñoquis de papa',
    descripcion: 'Ñoquis de papa caseros. Porción 500 g. Incluye sugerencia de salsa.',
    costo: 2200,
    foto: 'https://picsum.photos/seed/noquis/400/300',
    archivado: false,
  },
  {
    id: 'mock-4',
    titulo: 'Tallarines al huevo',
    descripcion: 'Pasta fresca al huevo. Porción 500 g.',
    costo: 2000,
    foto: 'https://picsum.photos/seed/tallarines/400/300',
    archivado: false,
  },
  {
    id: 'mock-5',
    titulo: 'Capeletis de carne',
    descripcion: 'Capeletis rellenos con carne y especias. Porción 500 g.',
    costo: 3000,
    foto: 'https://picsum.photos/seed/capeletis/400/300',
    archivado: false,
  },
  {
    id: 'mock-6',
    titulo: 'Lasagna familiar',
    descripcion: 'Lasagna de carne para 4 porciones. Incluye salsa y bechamel.',
    costo: 5500,
    foto: 'https://picsum.photos/seed/lasagna/400/300',
    archivado: false,
  },
  {
    id: 'mock-7',
    titulo: 'Canelones de pollo',
    descripcion: 'Canelones rellenos de pollo y verduras. Porción 4 unidades.',
    costo: 3800,
    foto: 'https://picsum.photos/seed/canelones/400/300',
    archivado: false,
  },
  {
    id: 'mock-8',
    titulo: 'Fettuccine',
    descripcion: 'Cintas de pasta fresca. Porción 500 g. Ideal para salsas cremosas.',
    costo: 2400,
    foto: 'https://picsum.photos/seed/fettuccine/400/300',
    archivado: false,
  },
]

/** @type {Array<{ id: string, nombre: string, descripcion?: string }>} */
export const mockOpcionesPago = [
  { id: 'mock-pago-1', nombre: 'Transferencia bancaria', descripcion: 'CBU 1234567890123456789012. Enviar comprobante por WhatsApp.' },
  { id: 'mock-pago-2', nombre: 'Efectivo', descripcion: 'Abonar al recibir el pedido.' },
]

/** @type {Array<{ id: string, nombre: string, costo: number, descripcion?: string }>} */
export const mockOpcionesEnvio = [
  { id: 'mock-envio-1', nombre: 'Zona centro', costo: 800, descripcion: 'Entrega en 24-48 hs hábiles.' },
  { id: 'mock-envio-2', nombre: 'Zona norte', costo: 1200, descripcion: 'Consultar disponibilidad.' },
  { id: 'mock-envio-3', nombre: 'Retiro en local', costo: 0, descripcion: 'Av. Ejemplo 123. Horario: Lun–Vie 10–18 h.' },
]

/** Datos mock de "Sobre nosotros". Redes: solo Instagram y Facebook (URLs). */
/** @type {{ titulo: string, descripcion: string, foto: string, telefono: string, email: string, redes: { instagram: string, facebook: string } }} */
export const mockAboutUs = {
  titulo: 'Boutique de Pastas',
  descripcion: 'Pastas frescas caseras elaboradas con materia prima de primera calidad. Hacemos ravioles, sorrentinos, ñoquis y más para que disfrutes en casa.\n\nPedidos con 24–48 hs de anticipación. Zonas de entrega y retiro en local.',
  foto: 'https://picsum.photos/seed/about-pastas/800/500',
  telefono: '5491112345678',
  email: 'pedidos@boutiquedepastas.com',
  redes: {
    instagram: 'https://instagram.com/boutiquedepastas',
    facebook: 'https://facebook.com/boutiquedepastas',
  },
}

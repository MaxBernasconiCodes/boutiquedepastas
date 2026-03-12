-- Migración: secciones y orden para productos.
-- Ejecutar en Neon SQL Editor si ya tenés las tablas creadas.

-- Tabla de secciones (títulos que agrupan productos)
CREATE TABLE IF NOT EXISTS sections (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  subtitulo TEXT DEFAULT '',
  orden INTEGER NOT NULL DEFAULT 0
);

-- Campos nuevos en products: sección y orden dentro de la sección
ALTER TABLE products ADD COLUMN IF NOT EXISTS seccion_id TEXT REFERENCES sections(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS orden INTEGER NOT NULL DEFAULT 0;

-- Índices para ordenar
CREATE INDEX IF NOT EXISTS idx_sections_orden ON sections(orden);
CREATE INDEX IF NOT EXISTS idx_products_seccion_orden ON products(seccion_id, orden);

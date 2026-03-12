-- Ejecutar en Neon SQL Editor (Console → tu proyecto → SQL Editor).
-- Crea las tablas para productos, secciones, opciones de pago, opciones de envío y "Sobre nosotros".

-- Secciones: títulos que agrupan productos (ej. "Pastas rellenas", "Pastas secas")
CREATE TABLE IF NOT EXISTS sections (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  subtitulo TEXT DEFAULT '',
  orden INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT DEFAULT '',
  costo NUMERIC(10,2) NOT NULL DEFAULT 0,
  foto TEXT,
  archivado BOOLEAN NOT NULL DEFAULT false,
  seccion_id TEXT REFERENCES sections(id) ON DELETE SET NULL,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sections_orden ON sections(orden);
CREATE INDEX IF NOT EXISTS idx_products_seccion_orden ON products(seccion_id, orden);

CREATE TABLE IF NOT EXISTS payment_options (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT
);

CREATE TABLE IF NOT EXISTS shipping_options (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  costo NUMERIC(10,2) NOT NULL DEFAULT 0,
  descripcion TEXT
);

-- Una sola fila (id=1) para "Sobre nosotros"
CREATE TABLE IF NOT EXISTS about_us (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  titulo TEXT DEFAULT '',
  descripcion TEXT DEFAULT '',
  foto TEXT DEFAULT '',
  telefono TEXT DEFAULT '',
  email TEXT DEFAULT '',
  instagram TEXT DEFAULT '',
  facebook TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO about_us (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Migración: agregar subtítulo a secciones.
-- Ejecutar en Neon SQL Editor si ya tenés la tabla sections.

ALTER TABLE sections ADD COLUMN IF NOT EXISTS subtitulo TEXT DEFAULT '';

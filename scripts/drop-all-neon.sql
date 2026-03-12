-- Reset total de la base en Neon.
-- Ejecutar en Neon SQL Editor (Console → tu proyecto → SQL Editor).
-- Después ejecutá de nuevo scripts/schema-neon.sql para recrear todo desde 0.

-- Orden: primero tablas con FK (products referencia sections), luego el resto
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS sections;
DROP TABLE IF EXISTS payment_options;
DROP TABLE IF EXISTS shipping_options;
DROP TABLE IF EXISTS about_us;

-- Agregar nuevos servicios opcionales: color, alisado, semi permanente de rulos
-- Ejecutar en el SQL Editor de Supabase

-- 1. Agregar columnas de precios para los nuevos servicios
ALTER TABLE barberia
ADD COLUMN precio_color DECIMAL(10,2) DEFAULT 300.00,
ADD COLUMN precio_alisado DECIMAL(10,2) DEFAULT 400.00,
ADD COLUMN precio_semi_permanente DECIMAL(10,2) DEFAULT 350.00;

-- 2. Agregar columnas booleanas para habilitar/deshabilitar servicios
ALTER TABLE barberia
ADD COLUMN servicio_color_enabled BOOLEAN DEFAULT false,
ADD COLUMN servicio_alisado_enabled BOOLEAN DEFAULT false,
ADD COLUMN servicio_semi_permanente_enabled BOOLEAN DEFAULT false;

-- 3. Establecer valores predeterminados
UPDATE barberia
SET
  precio_color = 300.00,
  precio_alisado = 400.00,
  precio_semi_permanente = 350.00,
  servicio_color_enabled = false,
  servicio_alisado_enabled = false,
  servicio_semi_permanente_enabled = false;

-- Verificar que se crearon las columnas
SELECT * FROM barberia;
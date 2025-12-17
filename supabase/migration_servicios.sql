-- ============================================
-- MIGRACIÓN: Agregar servicios (Cejas y Barba)
-- ============================================
--
-- INSTRUCCIONES:
-- 1. Ve a tu proyecto en Supabase
-- 2. Abre el SQL Editor
-- 3. Copia y pega este código completo
-- 4. Haz clic en "Run" para ejecutar
--

-- Agregar nuevos campos de precio a la tabla barberia
ALTER TABLE barberia
ADD COLUMN IF NOT EXISTS precio_cejas DECIMAL(10,2) DEFAULT 100.00,
ADD COLUMN IF NOT EXISTS precio_barba DECIMAL(10,2) DEFAULT 200.00;

-- Agregar campo servicio a la tabla turnos
ALTER TABLE turnos
ADD COLUMN IF NOT EXISTS servicio VARCHAR(20) DEFAULT 'corte' CHECK (servicio IN ('corte', 'cejas', 'barba'));

-- Actualizar datos existentes si es necesario
UPDATE barberia
SET precio_cejas = 100.00, precio_barba = 200.00
WHERE precio_cejas IS NULL OR precio_barba IS NULL;

-- Actualizar la vista de turnos completos para incluir el servicio
CREATE OR REPLACE VIEW turnos_completos AS
SELECT
  t.id,
  t.fecha,
  t.hora,
  t.servicio,
  t.confirmado,
  t.recordatorio_enviado,
  t.created_at,
  u.id as user_id,
  u.nombre,
  u.apellido,
  u.celular
FROM turnos t
JOIN usuarios u ON t.user_id = u.id
ORDER BY t.fecha DESC, t.hora DESC;

-- Verificación
SELECT 'Migración completada exitosamente!' as mensaje;
SELECT nombre, precio, precio_cejas, precio_barba FROM barberia;
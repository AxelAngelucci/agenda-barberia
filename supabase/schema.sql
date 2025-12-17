-- ============================================
-- ESQUEMA DE BASE DE DATOS PARA AGENDA BARBERÍA
-- ============================================
--
-- INSTRUCCIONES:
-- 1. Ve a tu proyecto en Supabase
-- 2. Abre el SQL Editor
-- 3. Copia y pega este código completo
-- 4. Haz clic en "Run" para ejecutar
--

-- Tabla de usuarios/clientes
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  celular VARCHAR(20) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de turnos
CREATE TABLE IF NOT EXISTS turnos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  confirmado BOOLEAN DEFAULT true,
  recordatorio_enviado BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Evitar turnos duplicados en la misma fecha y hora
  UNIQUE(fecha, hora)
);

-- Tabla de configuración de barbería (una sola fila)
CREATE TABLE IF NOT EXISTS barberia (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL DEFAULT 'Barbería El Estilo',
  direccion TEXT NOT NULL DEFAULT 'Av. Principal 123, Centro',
  precio DECIMAL(10,2) NOT NULL DEFAULT 150.00,
  datos_extra TEXT DEFAULT '⭐ Promoción: 2x1 los martes
✂️ Barberos profesionales con +10 años de experiencia
⏱️ Tiempo estimado: 30-45 minutos',
  horarios_disponibles TEXT[] DEFAULT ARRAY['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
  duracion_turno INTEGER DEFAULT 45,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar datos iniciales de barbería (solo si no existe)
INSERT INTO barberia (nombre, direccion, precio, datos_extra, horarios_disponibles, duracion_turno)
SELECT
  'Barbería El Estilo',
  'Av. Principal 123, Centro',
  150.00,
  '⭐ Promoción: 2x1 los martes
✂️ Barberos profesionales con +10 años de experiencia
⏱️ Tiempo estimado: 30-45 minutos',
  ARRAY['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
  45
WHERE NOT EXISTS (SELECT 1 FROM barberia LIMIT 1);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_turnos_fecha ON turnos(fecha);
CREATE INDEX IF NOT EXISTS idx_turnos_user_id ON turnos(user_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_celular ON usuarios(celular);

-- Vista para obtener turnos con información del usuario
CREATE OR REPLACE VIEW turnos_completos AS
SELECT
  t.id,
  t.fecha,
  t.hora,
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

-- ============================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- ============================================

-- Habilitar Row Level Security
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE turnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE barberia ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios (todos pueden leer y crear)
CREATE POLICY "Permitir lectura pública de usuarios"
  ON usuarios FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserción pública de usuarios"
  ON usuarios FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir actualización pública de usuarios"
  ON usuarios FOR UPDATE
  USING (true);

-- Políticas para turnos (todos pueden leer y crear)
CREATE POLICY "Permitir lectura pública de turnos"
  ON turnos FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserción pública de turnos"
  ON turnos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir actualización pública de turnos"
  ON turnos FOR UPDATE
  USING (true);

CREATE POLICY "Permitir eliminación pública de turnos"
  ON turnos FOR DELETE
  USING (true);

-- Políticas para barbería (todos pueden leer, solo admin puede actualizar)
CREATE POLICY "Permitir lectura pública de barbería"
  ON barberia FOR SELECT
  USING (true);

CREATE POLICY "Permitir actualización pública de barbería"
  ON barberia FOR UPDATE
  USING (true);

-- ============================================
-- FUNCIONES ÚTILES
-- ============================================

-- Función para obtener horarios disponibles de una fecha
CREATE OR REPLACE FUNCTION obtener_horarios_disponibles(fecha_consulta DATE)
RETURNS TEXT[] AS $$
DECLARE
  horarios_config TEXT[];
  horarios_ocupados TEXT[];
  horarios_libres TEXT[];
BEGIN
  -- Obtener horarios configurados
  SELECT horarios_disponibles INTO horarios_config FROM barberia LIMIT 1;

  -- Obtener horarios ya ocupados en esa fecha
  SELECT ARRAY_AGG(hora::TEXT) INTO horarios_ocupados
  FROM turnos
  WHERE fecha = fecha_consulta;

  -- Si no hay horarios ocupados, devolver todos
  IF horarios_ocupados IS NULL THEN
    RETURN horarios_config;
  END IF;

  -- Filtrar horarios disponibles
  SELECT ARRAY_AGG(h)
  INTO horarios_libres
  FROM UNNEST(horarios_config) AS h
  WHERE h NOT IN (SELECT UNNEST(horarios_ocupados));

  RETURN COALESCE(horarios_libres, ARRAY[]::TEXT[]);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DATOS DE PRUEBA (OPCIONAL - COMENTAR SI NO QUIERES)
-- ============================================

-- Insertar usuarios de prueba
-- INSERT INTO usuarios (nombre, apellido, celular) VALUES
--   ('Juan', 'Pérez', '1234567890'),
--   ('María', 'González', '0987654321'),
--   ('Carlos', 'Rodríguez', '5551234567');

-- Insertar turnos de prueba
-- INSERT INTO turnos (user_id, fecha, hora) VALUES
--   ((SELECT id FROM usuarios WHERE celular = '1234567890'), CURRENT_DATE + 1, '10:00'),
--   ((SELECT id FROM usuarios WHERE celular = '0987654321'), CURRENT_DATE + 1, '15:00'),
--   ((SELECT id FROM usuarios WHERE celular = '5551234567'), CURRENT_DATE + 2, '11:00');

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

-- Verificar que todo se creó correctamente
SELECT 'Tablas creadas exitosamente!' as mensaje;
SELECT COUNT(*) as total_usuarios FROM usuarios;
SELECT COUNT(*) as total_turnos FROM turnos;
SELECT COUNT(*) as config_barberia FROM barberia;
-- ============================================
-- ESQUEMA MULTI-TENANT PARA MÚLTIPLES BARBERÍAS
-- ============================================
--
-- INSTRUCCIONES:
-- 1. Ve a tu proyecto en Supabase
-- 2. Abre el SQL Editor
-- 3. Copia y pega este código completo
-- 4. Haz clic en "Run" para ejecutar
--

-- ============================================
-- TABLA DE BARBERÍAS (Multi-tenant)
-- ============================================
-- Cada barbería es un usuario autenticado con Google
CREATE TABLE IF NOT EXISTS barberias (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre VARCHAR(200) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE, -- URL única: /agenda/mi-barberia
  direccion TEXT,
  telefono VARCHAR(20),
  email VARCHAR(255),
  logo_url TEXT,

  -- Configuración de servicios
  precio_corte DECIMAL(10,2) NOT NULL DEFAULT 150.00,
  precio_cejas DECIMAL(10,2) DEFAULT 50.00,
  precio_barba DECIMAL(10,2) DEFAULT 100.00,
  precio_color DECIMAL(10,2) DEFAULT 300.00,
  precio_alisado DECIMAL(10,2) DEFAULT 500.00,
  precio_semi_permanente DECIMAL(10,2) DEFAULT 400.00,

  -- Servicios habilitados
  servicio_color_enabled BOOLEAN DEFAULT false,
  servicio_alisado_enabled BOOLEAN DEFAULT false,
  servicio_semi_permanente_enabled BOOLEAN DEFAULT false,

  -- Configuración de horarios
  horarios_disponibles TEXT[] DEFAULT ARRAY['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
  duracion_turno INTEGER DEFAULT 45,

  -- Información adicional
  datos_extra TEXT,
  activa BOOLEAN DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA DE USUARIOS/CLIENTES (sin auth)
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  celular VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Un usuario puede tener el mismo celular en diferentes barberías
  -- pero no puede duplicarse dentro de la misma barbería
  UNIQUE(celular)
);

-- ============================================
-- TABLA DE TURNOS (por barbería)
-- ============================================
CREATE TABLE IF NOT EXISTS turnos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  barberia_id UUID NOT NULL REFERENCES barberias(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  servicios TEXT[] NOT NULL DEFAULT ARRAY['corte'], -- ['corte', 'cejas', 'barba', etc]
  precio_total DECIMAL(10,2) NOT NULL,
  confirmado BOOLEAN DEFAULT true,
  recordatorio_enviado BOOLEAN DEFAULT false,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Un horario no puede estar ocupado dos veces en la misma barbería
  UNIQUE(barberia_id, fecha, hora)
);

-- ============================================
-- ÍNDICES PARA RENDIMIENTO
-- ============================================
CREATE INDEX IF NOT EXISTS idx_barberias_slug ON barberias(slug);
CREATE INDEX IF NOT EXISTS idx_turnos_barberia_fecha ON turnos(barberia_id, fecha);
CREATE INDEX IF NOT EXISTS idx_turnos_user_id ON turnos(user_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_celular ON usuarios(celular);

-- ============================================
-- FUNCIÓN: Crear slug único para barbería
-- ============================================
CREATE OR REPLACE FUNCTION generate_unique_slug(barberia_nombre TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convertir nombre a slug (lowercase, sin espacios, sin caracteres especiales)
  base_slug := lower(regexp_replace(barberia_nombre, '[^a-zA-Z0-9]', '-', 'g'));
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);

  final_slug := base_slug;

  -- Si el slug ya existe, agregar número
  WHILE EXISTS (SELECT 1 FROM barberias WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Auto-generar slug al crear barbería
-- ============================================
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_unique_slug(NEW.nombre);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_barberias
  BEFORE INSERT ON barberias
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_slug();

-- ============================================
-- VISTA: Turnos con información completa
-- ============================================
CREATE OR REPLACE VIEW turnos_completos AS
SELECT
  t.id,
  t.barberia_id,
  b.nombre as barberia_nombre,
  b.slug as barberia_slug,
  t.fecha,
  t.hora,
  t.servicios,
  t.precio_total,
  t.confirmado,
  t.recordatorio_enviado,
  t.notas,
  t.created_at,
  u.id as user_id,
  u.nombre,
  u.apellido,
  u.celular
FROM turnos t
JOIN usuarios u ON t.user_id = u.id
JOIN barberias b ON t.barberia_id = b.id
ORDER BY t.fecha DESC, t.hora DESC;

-- ============================================
-- FUNCIÓN: Obtener horarios disponibles
-- ============================================
CREATE OR REPLACE FUNCTION obtener_horarios_disponibles(
  p_barberia_id UUID,
  fecha_consulta DATE
)
RETURNS TEXT[] AS $$
DECLARE
  horarios_config TEXT[];
  horarios_ocupados TEXT[];
  horarios_libres TEXT[];
BEGIN
  -- Obtener horarios configurados de la barbería
  SELECT horarios_disponibles INTO horarios_config
  FROM barberias
  WHERE id = p_barberia_id;

  -- Obtener horarios ya ocupados en esa fecha para esa barbería
  SELECT ARRAY_AGG(hora::TEXT) INTO horarios_ocupados
  FROM turnos
  WHERE barberia_id = p_barberia_id AND fecha = fecha_consulta;

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
-- POLÍTICAS DE SEGURIDAD (RLS)
-- ============================================

-- Habilitar Row Level Security
ALTER TABLE barberias ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE turnos ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PARA BARBERÍAS
-- Todos pueden leer barberías activas (para buscar por slug)
CREATE POLICY "Permitir lectura pública de barberías activas"
  ON barberias FOR SELECT
  USING (activa = true);

-- Solo el dueño puede actualizar su barbería
CREATE POLICY "Dueño puede actualizar su barbería"
  ON barberias FOR UPDATE
  USING (auth.uid() = id);

-- Usuarios autenticados pueden crear su barbería
CREATE POLICY "Usuarios autenticados pueden crear barbería"
  ON barberias FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- POLÍTICAS PARA USUARIOS
-- Todos pueden leer usuarios
CREATE POLICY "Permitir lectura pública de usuarios"
  ON usuarios FOR SELECT
  USING (true);

-- Todos pueden crear usuarios (sin auth)
CREATE POLICY "Permitir inserción pública de usuarios"
  ON usuarios FOR INSERT
  WITH CHECK (true);

-- POLÍTICAS PARA TURNOS
-- Todos pueden leer turnos
CREATE POLICY "Permitir lectura pública de turnos"
  ON turnos FOR SELECT
  USING (true);

-- Todos pueden crear turnos (sin auth de usuario)
CREATE POLICY "Permitir inserción pública de turnos"
  ON turnos FOR INSERT
  WITH CHECK (true);

-- Solo el dueño de la barbería puede actualizar/eliminar turnos
CREATE POLICY "Dueño de barbería puede actualizar turnos"
  ON turnos FOR UPDATE
  USING (
    barberia_id IN (
      SELECT id FROM barberias WHERE id = auth.uid()
    )
  );

CREATE POLICY "Dueño de barbería puede eliminar turnos"
  ON turnos FOR DELETE
  USING (
    barberia_id IN (
      SELECT id FROM barberias WHERE id = auth.uid()
    )
  );

-- ============================================
-- FUNCIÓN TRIGGER: Actualizar updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_barberias_updated_at
  BEFORE UPDATE ON barberias
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICACIÓN
-- ============================================
SELECT 'Tablas multi-tenant creadas exitosamente!' as mensaje;
SELECT COUNT(*) as total_barberias FROM barberias;
SELECT COUNT(*) as total_usuarios FROM usuarios;
SELECT COUNT(*) as total_turnos FROM turnos;
# 🔍 Verificar que las tablas existen en Supabase

## Paso 1: Verificar en Table Editor

1. Ve a tu proyecto Supabase: https://supabase.com/dashboard/project/hfleyonesllioqczrfvz
2. En el menú lateral, haz clic en **Table Editor** (ícono de tabla)
3. Deberías ver estas 3 tablas:
   - ✅ `barberias`
   - ✅ `usuarios`
   - ✅ `turnos`

**Si NO las ves**, continúa con el Paso 2.

---

## Paso 2: Ejecutar SQL para crear las tablas

### A. Abrir SQL Editor

1. En el menú lateral de Supabase, haz clic en **SQL Editor** (ícono <>)
2. Haz clic en el botón **"+ New query"**

### B. Copiar el SQL completo

Abre el archivo: `supabase/schema-multitenant.sql`

**O copia este SQL directamente:**

```sql
-- ============================================
-- TABLA DE BARBERÍAS
-- ============================================
CREATE TABLE IF NOT EXISTS barberias (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre VARCHAR(200) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  direccion TEXT,
  telefono VARCHAR(20),
  email VARCHAR(255),
  logo_url TEXT,
  precio_corte DECIMAL(10,2) NOT NULL DEFAULT 150.00,
  precio_cejas DECIMAL(10,2) DEFAULT 50.00,
  precio_barba DECIMAL(10,2) DEFAULT 100.00,
  precio_color DECIMAL(10,2) DEFAULT 300.00,
  precio_alisado DECIMAL(10,2) DEFAULT 500.00,
  precio_semi_permanente DECIMAL(10,2) DEFAULT 400.00,
  servicio_color_enabled BOOLEAN DEFAULT false,
  servicio_alisado_enabled BOOLEAN DEFAULT false,
  servicio_semi_permanente_enabled BOOLEAN DEFAULT false,
  horarios_disponibles TEXT[] DEFAULT ARRAY['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
  duracion_turno INTEGER DEFAULT 45,
  datos_extra TEXT,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA DE USUARIOS
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  celular VARCHAR(20) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA DE TURNOS
-- ============================================
CREATE TABLE IF NOT EXISTS turnos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  barberia_id UUID NOT NULL REFERENCES barberias(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  servicios TEXT[] NOT NULL DEFAULT ARRAY['corte'],
  precio_total DECIMAL(10,2) NOT NULL,
  confirmado BOOLEAN DEFAULT true,
  recordatorio_enviado BOOLEAN DEFAULT false,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(barberia_id, fecha, hora)
);

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_barberias_slug ON barberias(slug);
CREATE INDEX IF NOT EXISTS idx_turnos_barberia_fecha ON turnos(barberia_id, fecha);
CREATE INDEX IF NOT EXISTS idx_turnos_user_id ON turnos(user_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_celular ON usuarios(celular);

-- ============================================
-- POLÍTICAS RLS
-- ============================================
ALTER TABLE barberias ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE turnos ENABLE ROW LEVEL SECURITY;

-- Barberías
DROP POLICY IF EXISTS "Permitir lectura pública de barberías activas" ON barberias;
CREATE POLICY "Permitir lectura pública de barberías activas"
  ON barberias FOR SELECT
  USING (activa = true);

DROP POLICY IF EXISTS "Dueño puede actualizar su barbería" ON barberias;
CREATE POLICY "Dueño puede actualizar su barbería"
  ON barberias FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuarios autenticados pueden crear barbería" ON barberias;
CREATE POLICY "Usuarios autenticados pueden crear barbería"
  ON barberias FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Usuarios
DROP POLICY IF EXISTS "Permitir lectura pública de usuarios" ON usuarios;
CREATE POLICY "Permitir lectura pública de usuarios"
  ON usuarios FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Permitir inserción pública de usuarios" ON usuarios;
CREATE POLICY "Permitir inserción pública de usuarios"
  ON usuarios FOR INSERT
  WITH CHECK (true);

-- Turnos
DROP POLICY IF EXISTS "Permitir lectura pública de turnos" ON turnos;
CREATE POLICY "Permitir lectura pública de turnos"
  ON turnos FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Permitir inserción pública de turnos" ON turnos;
CREATE POLICY "Permitir inserción pública de turnos"
  ON turnos FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Dueño de barbería puede actualizar turnos" ON turnos;
CREATE POLICY "Dueño de barbería puede actualizar turnos"
  ON turnos FOR UPDATE
  USING (barberia_id IN (SELECT id FROM barberias WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Dueño de barbería puede eliminar turnos" ON turnos;
CREATE POLICY "Dueño de barbería puede eliminar turnos"
  ON turnos FOR DELETE
  USING (barberia_id IN (SELECT id FROM barberias WHERE id = auth.uid()));

-- ============================================
-- VERIFICACIÓN
-- ============================================
SELECT 'Tablas creadas exitosamente!' as mensaje;
SELECT COUNT(*) as total_barberias FROM barberias;
SELECT COUNT(*) as total_usuarios FROM usuarios;
SELECT COUNT(*) as total_turnos FROM turnos;
```

### C. Ejecutar

1. Pega el SQL en el editor
2. Haz clic en **"Run"** (o presiona Ctrl + Enter)
3. Espera a que termine (puede tardar 5-10 segundos)

### D. Verificar el resultado

Deberías ver al final:

```
mensaje: "Tablas creadas exitosamente!"
total_barberias: 0
total_usuarios: 0
total_turnos: 0
```

---

## Paso 3: Verificar en Table Editor nuevamente

1. Ve a **Table Editor**
2. Refresca la página (F5)
3. Deberías ver las 3 tablas: `barberias`, `usuarios`, `turnos`

---

## Paso 4: Si las tablas YA existen pero sigue el error

Ejecuta este SQL para refrescar el schema cache:

```sql
-- Refrescar el cache de schema
NOTIFY pgrst, 'reload schema';
```

---

## Paso 5: Probar el registro

1. Vuelve a tu app: http://localhost:3000/admin/login
2. Haz clic en "Crear cuenta nueva"
3. Completa los datos:
   - Nombre: Juan
   - Apellido: Pérez
   - Email: juan@test.com
   - Password: 123456
4. Haz clic en "Crear Cuenta"

---

## 🆘 Si sigue sin funcionar

### Revisar permisos en Supabase

Ejecuta este SQL para verificar que las políticas RLS estén bien:

```sql
-- Ver políticas de la tabla barberias
SELECT * FROM pg_policies WHERE tablename = 'barberias';
```

### Verificar que el usuario se creó en auth

```sql
-- Ver usuarios autenticados
SELECT id, email FROM auth.users;
```

---

## ✅ Checklist completo

- [ ] Tablas `barberias`, `usuarios`, `turnos` aparecen en Table Editor
- [ ] SQL se ejecutó sin errores
- [ ] Políticas RLS están habilitadas
- [ ] Puedes crear un usuario en `/admin/login`
- [ ] Puedes completar el onboarding

---

Si algo falla, dime exactamente qué error ves y en qué paso estás.
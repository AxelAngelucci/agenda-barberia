# 🔧 Solución: Error "Could not find the 'barberia_id' column"

## El problema

La tabla `turnos` fue creada con el schema antiguo (single-tenant) en lugar del nuevo schema multi-tenant.

---

## ✅ Solución rápida (5 minutos)

### Paso 1: Ir a Supabase SQL Editor

https://supabase.com/dashboard/project/hfleyonesllioqczrfvz/editor

### Paso 2: Eliminar las tablas viejas y crear las nuevas

**Copia y pega este SQL completo:**

```sql
-- ============================================
-- LIMPIAR TABLAS VIEJAS
-- ============================================

-- Eliminar tablas viejas si existen
DROP TABLE IF EXISTS turnos CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS barberias CASCADE;
DROP TABLE IF EXISTS barberia CASCADE;

-- ============================================
-- CREAR TABLAS NUEVAS (MULTI-TENANT)
-- ============================================

-- Tabla de barberías
CREATE TABLE barberias (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre VARCHAR(200) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  direccion TEXT,
  telefono VARCHAR(20),
  email VARCHAR(255),
  logo_url TEXT,

  -- Precios de servicios
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

  -- Configuración
  horarios_disponibles TEXT[] DEFAULT ARRAY['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
  duracion_turno INTEGER DEFAULT 45,
  datos_extra TEXT,
  activa BOOLEAN DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de usuarios/clientes
CREATE TABLE usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  celular VARCHAR(20) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de turnos (CON barberia_id)
CREATE TABLE turnos (
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

  -- No puede haber dos turnos en el mismo horario para la misma barbería
  UNIQUE(barberia_id, fecha, hora)
);

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX idx_barberias_slug ON barberias(slug);
CREATE INDEX idx_turnos_barberia_fecha ON turnos(barberia_id, fecha);
CREATE INDEX idx_turnos_user_id ON turnos(user_id);
CREATE INDEX idx_usuarios_celular ON usuarios(celular);

-- ============================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- ============================================

ALTER TABLE barberias ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE turnos ENABLE ROW LEVEL SECURITY;

-- Barberías: Todos pueden leer, solo dueño puede modificar
CREATE POLICY "public_read_barberias"
  ON barberias FOR SELECT
  USING (activa = true);

CREATE POLICY "owner_update_barberia"
  ON barberias FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "auth_insert_barberia"
  ON barberias FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Usuarios: Público puede leer y crear
CREATE POLICY "public_read_usuarios"
  ON usuarios FOR SELECT
  USING (true);

CREATE POLICY "public_insert_usuarios"
  ON usuarios FOR INSERT
  WITH CHECK (true);

-- Turnos: Público puede leer y crear, dueño de barbería puede modificar
CREATE POLICY "public_read_turnos"
  ON turnos FOR SELECT
  USING (true);

CREATE POLICY "public_insert_turnos"
  ON turnos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "owner_update_turnos"
  ON turnos FOR UPDATE
  USING (barberia_id IN (SELECT id FROM barberias WHERE id = auth.uid()));

CREATE POLICY "owner_delete_turnos"
  ON turnos FOR DELETE
  USING (barberia_id IN (SELECT id FROM barberias WHERE id = auth.uid()));

-- ============================================
-- NOTIFICAR A POSTGREST PARA REFRESCAR CACHE
-- ============================================

NOTIFY pgrst, 'reload schema';

-- ============================================
-- VERIFICACIÓN
-- ============================================

SELECT 'Tablas recreadas exitosamente!' as resultado;
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'turnos'
  AND column_name IN ('id', 'barberia_id', 'user_id', 'fecha', 'hora')
ORDER BY ordinal_position;
```

### Paso 3: Ejecutar

1. Haz clic en **"Run"** (Ctrl + Enter)
2. Espera a que termine (10-15 segundos)

### Paso 4: Verificar

Deberías ver al final algo como:

```
resultado: "Tablas recreadas exitosamente!"

table_name | column_name  | data_type
-----------|--------------|----------
turnos     | id           | uuid
turnos     | barberia_id  | uuid
turnos     | user_id      | uuid
turnos     | fecha        | date
turnos     | hora         | time
```

---

## 🔄 Paso 5: Re-crear tu barbería

**IMPORTANTE:** Como eliminamos las tablas, necesitas volver a crear tu barbería:

1. Ve a http://localhost:3000/admin/login
2. **Inicia sesión** con el mismo email que usaste antes
3. Te redirigirá automáticamente a `/admin/onboarding`
4. Completa los datos de tu barbería nuevamente
5. ¡Listo!

---

## 🧪 Paso 6: Probar la reserva

1. Ve a tu enlace de agenda: http://localhost:3000/agenda/tu-slug
2. Completa los datos del cliente
3. Selecciona fecha y hora
4. Haz clic en **"Reservar turno"**
5. Deberías ver el mensaje: "✅ ¡Turno reservado exitosamente!"

---

## 🎯 ¿Por qué pasó esto?

El sistema originalmente usaba un schema single-tenant (una sola barbería) con tablas:
- `barberia` (singular, sin `barberia_id`)
- `turnos` (sin `barberia_id`)

El nuevo schema multi-tenant usa:
- `barberias` (plural, con ID)
- `turnos` (con `barberia_id` para saber a qué barbería pertenece)

Al no eliminar las tablas viejas primero, Supabase usó el schema antiguo.

---

## ✅ Checklist

Después de ejecutar el SQL:

- [ ] Las tablas aparecen en Table Editor
- [ ] La tabla `turnos` tiene la columna `barberia_id`
- [ ] Puedes volver a crear tu barbería en onboarding
- [ ] Puedes reservar turnos sin error
- [ ] Los turnos aparecen en el panel de admin

---

## 🆘 Si algo falla

### Error al ejecutar SQL
- Copia el error y dime qué dice
- Puede que haya datos que estén referenciados

### No aparece barberia_id
- Refresca la página de Supabase (F5)
- Ve a Table Editor → turnos
- Verifica que `barberia_id` esté en la lista de columnas

### Error al reservar después del SQL
- Verifica que las políticas RLS estén activas
- Ejecuta: `SELECT * FROM pg_policies WHERE tablename = 'turnos';`
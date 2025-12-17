# 🚀 Configuración de Supabase - Guía Paso a Paso

## Paso 1: Crear cuenta en Supabase

1. Ve a https://supabase.com
2. Haz clic en **"Start your project"**
3. Regístrate con GitHub, Google o email
4. Verifica tu email si es necesario

## Paso 2: Crear un nuevo proyecto

1. En el dashboard de Supabase, haz clic en **"New Project"**
2. Completa los datos:
   - **Name**: `agenda-barberia` (o el nombre que prefieras)
   - **Database Password**: Crea una contraseña segura y **guárdala en un lugar seguro**
   - **Region**: Selecciona la región más cercana a tu ubicación (ej: South America (São Paulo))
   - **Pricing Plan**: Free (suficiente para empezar)

3. Haz clic en **"Create new project"**
4. **Espera 2-3 minutos** mientras Supabase crea tu proyecto

## Paso 3: Ejecutar el script SQL

1. Una vez creado el proyecto, ve a la sección **SQL Editor** en el menú lateral izquierdo

2. Haz clic en **"New query"**

3. Abre el archivo `supabase/schema.sql` de este proyecto

4. **Copia TODO el contenido** del archivo `schema.sql`

5. **Pégalo en el editor SQL** de Supabase

6. Haz clic en el botón **"Run"** (esquina inferior derecha)

7. Si todo salió bien, verás un mensaje de éxito ✅ y deberías ver:
   ```
   Tablas creadas exitosamente!
   total_usuarios | total_turnos | config_barberia
   0             | 0            | 1
   ```

## Paso 4: Obtener las credenciales

1. Ve a **Settings** (Configuración) en el menú lateral

2. Haz clic en **API**

3. Encontrarás dos valores importantes:

   ### Project URL
   - Busca **"Project URL"**
   - Copia la URL (algo como: `https://xxxxxxxxxxxxx.supabase.co`)

   ### API Key (anon/public)
   - Busca **"Project API keys"**
   - Copia la key que dice **"anon" "public"** (es una key muy larga)
   - **NO copies** la "service_role" key (esa es secreta)

## Paso 5: Configurar variables de entorno

1. En la carpeta raíz del proyecto, copia el archivo `.env.local.example`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Abre el archivo `.env.local` con un editor de texto

3. Reemplaza los valores con tus credenciales:

   ```env
   # Supabase - REQUERIDO
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto-aqui.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key_anon_muy_larga_aqui

   # El resto de las configuraciones son opcionales
   ```

4. Guarda el archivo

## Paso 6: Probar la aplicación

1. **Reinicia el servidor de desarrollo** (Ctrl+C y luego):
   ```bash
   npm run dev
   ```

2. Abre http://localhost:3000

3. **Prueba el flujo completo**:
   - Ingresa tus datos (nombre, apellido, celular)
   - Selecciona una fecha y hora
   - Confirma el turno
   - Verás la página de éxito

4. **Verifica en Supabase** que se guardó:
   - Ve a **Table Editor** en Supabase
   - Abre la tabla `usuarios` → Deberías ver tu usuario
   - Abre la tabla `turnos` → Deberías ver tu turno

5. **Prueba el panel de administración**:
   - Ve a http://localhost:3000/admin
   - Deberías ver tu turno en "Turnos de hoy" o "Próximos 7 días"

## ✅ Verificar que todo funciona

### Test 1: Crear usuario
- ✅ Puedes registrarte con nombre, apellido y celular
- ✅ Te redirige a la página de reserva

### Test 2: Reservar turno
- ✅ Puedes seleccionar una fecha
- ✅ Los horarios se cargan dinámicamente
- ✅ Puedes confirmar el turno
- ✅ Ves la página de éxito

### Test 3: Ver en admin
- ✅ En `/admin` ves el turno que creaste
- ✅ Puedes editar los datos de la barbería
- ✅ Los cambios se guardan correctamente

### Test 4: Horarios ocupados
- ✅ Si reservas un horario, ese horario ya no aparece disponible
- ✅ Otros horarios siguen disponibles

## 🔧 Solución de problemas

### Error: "Faltan las credenciales de Supabase"
- Verifica que el archivo `.env.local` existe
- Verifica que las variables empiezan con `NEXT_PUBLIC_`
- Reinicia el servidor de desarrollo

### Error al crear turno: "El horario ya está ocupado"
- Normal si ya reservaste ese horario
- Elige otro horario disponible

### No se muestran los turnos en admin
- Verifica que el turno se guardó en Supabase (Table Editor)
- Revisa la consola del navegador (F12) por errores
- Verifica que las políticas RLS estén habilitadas

### Los horarios no se cargan
- Verifica que la tabla `barberia` tiene datos
- Ejecuta en SQL Editor de Supabase:
  ```sql
  SELECT * FROM barberia;
  ```
- Debería devolver una fila con los horarios

## 📊 Estructura de las tablas

### Tabla `usuarios`
- `id`: UUID (generado automáticamente)
- `nombre`: Nombre del cliente
- `apellido`: Apellido del cliente
- `celular`: Número de teléfono único
- `created_at`: Fecha de registro

### Tabla `turnos`
- `id`: UUID (generado automáticamente)
- `user_id`: Referencia al usuario
- `fecha`: Fecha del turno
- `hora`: Hora del turno
- `confirmado`: Si está confirmado (default: true)
- `recordatorio_enviado`: Si se envió el WhatsApp
- `created_at`: Fecha de creación

### Tabla `barberia`
- `id`: UUID
- `nombre`: Nombre de la barbería
- `direccion`: Dirección física
- `precio`: Precio del servicio
- `datos_extra`: Información adicional
- `horarios_disponibles`: Array de horarios ["09:00", "10:00", ...]
- `duracion_turno`: Duración en minutos

## 🎯 Próximos pasos

Una vez que todo funcione:

1. **Personaliza los datos** en `/admin`:
   - Cambia el nombre de tu barbería
   - Actualiza la dirección
   - Ajusta los precios
   - Agrega promociones

2. **Configura WhatsApp** (opcional):
   - Sigue las instrucciones en el README.md
   - Usa Twilio o WhatsApp Business API

3. **Despliega en producción**:
   - Vercel (recomendado para Next.js)
   - Netlify
   - Railway
   - Tu propio servidor

## 📚 Recursos adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Supabase SQL Editor](https://supabase.com/docs/guides/database/overview)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)

## 💡 Consejos

1. **Backup**: Supabase hace backups automáticos, pero considera exportar datos importantes
2. **Limits**: El plan gratuito tiene límites, monitorea tu uso
3. **Seguridad**: Las policies RLS ya están configuradas, pero revísalas si necesitas cambios
4. **Performance**: Los índices ya están creados para las búsquedas más comunes

---

¿Problemas? Revisa los logs en:
- Consola del navegador (F12 → Console)
- Terminal donde corre `npm run dev`
- Supabase Dashboard → Logs
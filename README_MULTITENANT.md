# 🔐 Sistema Multi-Tenant de Agenda para Barberías

Sistema rediseñado donde:
- ✅ **Solo las barberías tienen autenticación** (Google OAuth)
- ✅ **Los usuarios/clientes NO necesitan registro** (solo datos básicos)
- ✅ **Cada barbería tiene su URL única** para compartir
- ✅ **Multi-tenant**: Múltiples barberías en la misma app

---

## 📋 Configuración Inicial

### 1. Configurar Google OAuth en Supabase

Sigue la guía completa en: **[GOOGLE_AUTH_SETUP.md](GOOGLE_AUTH_SETUP.md)**

**Resumen rápido:**
1. Crea un proyecto en Google Cloud Console
2. Configura OAuth consent screen
3. Crea credenciales OAuth 2.0
4. Copia Client ID y Secret
5. Habilita Google Provider en Supabase Auth

### 2. Aplicar el schema multi-tenant

1. Ve a tu proyecto en Supabase
2. Abre **SQL Editor**
3. Ejecuta el archivo **[supabase/schema-multitenant.sql](supabase/schema-multitenant.sql)**

Esto creará las tablas:
- `barberias` - Datos de cada barbería
- `usuarios` - Clientes (sin autenticación)
- `turnos` - Reservas por barbería

### 3. Configurar variables de entorno

Tu archivo `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

### 4. Instalar dependencias

```bash
npm install
```

### 5. Ejecutar el proyecto

```bash
npm run dev
```

---

## 🚀 Uso del Sistema

### Para Barberías (Dueños)

#### 1. Registro e inicio de sesión

1. Ve a http://localhost:3000/admin/login
2. Haz clic en **"Continuar con Google"**
3. Selecciona tu cuenta de Google
4. Completa el onboarding:
   - Nombre de tu barbería
   - URL única (slug)
   - Dirección
   - Teléfono

#### 2. Tu URL única

Después del registro, tu barbería tendrá una URL única:
```
http://localhost:3000/agenda/tu-barberia
```

**Esta es la URL que compartirás con tus clientes** por WhatsApp, redes sociales, etc.

#### 3. Panel de administración

Accede a http://localhost:3000/admin para:
- Ver todos los turnos
- Gestionar reservas
- Configurar servicios y precios
- Modificar horarios disponibles

---

### Para Clientes (Usuarios finales)

**Los clientes NO necesitan registro ni login.**

#### Flujo de reserva:

1. **Reciben el enlace** de la barbería:
   ```
   http://localhost:3000/agenda/nombre-barberia
   ```

2. **Completan sus datos** (sin crear cuenta):
   - Nombre
   - Apellido
   - Celular

3. **Seleccionan servicios:**
   - Corte (obligatorio)
   - Cejas (opcional)
   - Barba (opcional)

4. **Eligen fecha y hora** disponible

5. **Confirman la reserva**

¡Y listo! La reserva queda registrada sin que el cliente necesite crear cuenta.

---

## 🏗️ Arquitectura

### Estructura de rutas

```
/                              → Landing page
/admin/login                   → Login con Google (solo barberías)
/admin/onboarding              → Setup inicial después del login
/admin                         → Dashboard de la barbería (protegido)
/agenda/[slug]                 → Página pública de reservas (sin auth)
```

### Flujo de autenticación

```mermaid
graph TD
    A[Barbería] --> B[/admin/login]
    B --> C{Google OAuth}
    C --> D[Autenticado]
    D --> E{¿Tiene barbería?}
    E -->|No| F[/admin/onboarding]
    E -->|Sí| G[/admin]
    F --> G

    H[Cliente] --> I[/agenda/mi-barberia]
    I --> J[Ingresa datos básicos]
    J --> K[Selecciona fecha/hora]
    K --> L[Reserva confirmada]
```

### Modelo de datos

#### Tabla `barberias`
```sql
id (UUID, FK a auth.users)
nombre
slug (único)
direccion
telefono
email
precio_corte, precio_cejas, precio_barba
horarios_disponibles (array)
activa
```

#### Tabla `usuarios`
```sql
id (UUID)
nombre
apellido
celular (único)
```

#### Tabla `turnos`
```sql
id (UUID)
barberia_id (FK a barberias)
user_id (FK a usuarios)
fecha
hora
servicios (array)
precio_total
confirmado
```

---

## 🔒 Seguridad

### Políticas RLS (Row Level Security)

#### Barberías:
- ✅ Todos pueden leer barberías activas (para buscar por slug)
- ✅ Solo el dueño puede actualizar su barbería
- ✅ Solo usuarios autenticados pueden crear barbería

#### Usuarios:
- ✅ Todos pueden leer y crear usuarios (sin auth)

#### Turnos:
- ✅ Todos pueden leer y crear turnos (para que clientes reserven)
- ✅ Solo el dueño de la barbería puede actualizar/eliminar turnos

### Middleware

El [middleware.ts](middleware.ts) protege:
- `/admin/*` → Solo barberías autenticadas
- `/admin/onboarding` → Solo autenticados sin barbería
- `/agenda/*` → Público (sin protección)

---

## 📱 Compartir la agenda

### Formas de compartir tu URL:

#### 1. WhatsApp
```
¡Reserva tu turno! 👇
https://tudominio.com/agenda/tu-barberia
```

#### 2. Instagram/Facebook Bio
```
🔗 Reserva online: tudominio.com/agenda/tu-barberia
```

#### 3. Código QR
Genera un QR que apunte a tu URL de agenda

#### 4. Mensaje automático de WhatsApp Business
```
¡Hola! Para reservar tu turno, ingresa aquí:
https://tudominio.com/agenda/tu-barberia
```

---

## 🎨 Personalización

### Cambiar precios y servicios

Edita en el panel de admin o directamente en la base de datos:
```sql
UPDATE barberias
SET precio_corte = 200.00,
    precio_cejas = 75.00,
    precio_barba = 150.00
WHERE slug = 'tu-barberia';
```

### Modificar horarios disponibles

```sql
UPDATE barberias
SET horarios_disponibles = ARRAY[
  '09:00', '10:00', '11:00', '12:00',
  '14:00', '15:00', '16:00', '17:00', '18:00'
]
WHERE slug = 'tu-barberia';
```

### Agregar servicios adicionales

El schema ya incluye campos para:
- Color
- Alisado
- Semi Permanente

Estos se habilitan en el admin con:
```sql
UPDATE barberias
SET servicio_color_enabled = true,
    precio_color = 500.00
WHERE slug = 'tu-barberia';
```

---

## 🚢 Deployment

### Vercel (Recomendado)

1. Sube tu código a GitHub
2. Conecta el repo en Vercel
3. Agrega las variables de entorno:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```
4. Actualiza la redirect URI en Google Cloud Console:
   ```
   https://TU_PROYECTO.supabase.co/auth/v1/callback
   https://tu-dominio.vercel.app (para desarrollo)
   ```

### Dominio personalizado

En Vercel → Settings → Domains, agrega tu dominio:
```
agendabarberia.com → /
```

Tus barberías tendrán URLs como:
```
https://agendabarberia.com/agenda/barberia-el-estilo
https://agendabarberia.com/agenda/cortes-modernos
```

---

## 🧪 Testing

### Probar flujo completo:

1. **Como barbería:**
   - Login con Google en `/admin/login`
   - Completar onboarding
   - Configurar servicios en admin
   - Copiar tu URL de agenda

2. **Como cliente:**
   - Abrir la URL de agenda en otra ventana (modo incógnito)
   - Ingresar datos (nombre, apellido, celular)
   - Seleccionar fecha y hora
   - Confirmar reserva

3. **Verificar en admin:**
   - Ver el turno en el dashboard
   - Editar o eliminar turno

---

## 🐛 Troubleshooting

### "Barbería no encontrada"
- Verifica que el slug sea correcto
- Verifica que `activa = true` en la tabla barberias

### Error de Google OAuth
- Verifica las credenciales en Supabase
- Verifica la redirect URI en Google Cloud Console
- Revisa que el Provider esté habilitado

### No se muestran horarios
- Verifica `horarios_disponibles` en la tabla barberias
- Revisa la consola del navegador por errores

### Turno no se crea
- Puede ser que el horario ya esté ocupado
- Verifica las políticas RLS en Supabase

---

## 📚 Próximas mejoras

- [ ] Notificaciones por WhatsApp (Twilio)
- [ ] Panel de estadísticas
- [ ] Múltiples barberos por barbería
- [ ] Recordatorios automáticos
- [ ] Cancelación de turnos por clientes
- [ ] Sistema de valoraciones

---

## 🙋 Soporte

¿Problemas? Revisa:
1. [GOOGLE_AUTH_SETUP.md](GOOGLE_AUTH_SETUP.md)
2. Logs en la consola del navegador (F12)
3. Logs del servidor (`npm run dev`)
4. Políticas RLS en Supabase Dashboard

---

**¡Listo para usar! 🎉**
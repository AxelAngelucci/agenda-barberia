# ✂️ Sistema de Agenda para Barbería

Aplicación web moderna para gestionar turnos de barbería con Next.js, Tailwind CSS y shadcn/ui.

## ✨ Características

### 👤 Para Clientes
- **Login simple**: Registro con nombre, apellido y número de celular
- **Reserva intuitiva**: Selección fácil de fecha y hora
- **Vista de confirmación**: Precios, dirección y datos adicionales antes de confirmar
- **Recordatorios automáticos**: WhatsApp 3 horas antes del turno
- **Diseño responsive**: Funciona perfectamente en móvil y desktop

### ⚙️ Para Administradores
- **Panel de administración**: Edita datos de la barbería
- **Gestión de turnos**: Visualiza turnos de hoy y próximos 7 días
- **Información editable**: Precio, dirección, promociones, etc.
- **Vista previa**: Ve cómo verán los clientes tu información
- **Base de datos en tiempo real**: Integración con Supabase

## 🚀 Instalación y Uso

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Supabase (REQUERIDO)

La aplicación usa Supabase para almacenar usuarios, turnos y configuración. **Sigue la guía completa**:

📖 **[Ver guía detallada de configuración de Supabase →](./SUPABASE_SETUP.md)**

Resumen rápido:
1. Crear cuenta en [Supabase](https://supabase.com)
2. Crear nuevo proyecto
3. Ejecutar el script SQL: `supabase/schema.sql`
4. Obtener credenciales (URL y API Key)
5. Crear archivo `.env.local` con las credenciales

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Construir para producción

```bash
npm run build
npm start
```

## 📱 Estructura de la aplicación

```
/                      → Redirección automática a /auth
/auth                  → Login/Registro de clientes
/reservar              → Selección de fecha y hora
/reservar/confirmar    → Confirmación con detalles
/reservar/exito        → Página de éxito
/admin                 → Panel de administración
```

## 🔧 Tecnologías utilizadas

- **Next.js 15** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **shadcn/ui** - Componentes UI
- **Supabase** - Base de datos PostgreSQL y backend
- **date-fns** - Manejo de fechas

## 📲 Configuración de WhatsApp

Para activar los recordatorios automáticos por WhatsApp:

### Opción 1: Twilio (Recomendado)
1. Crear cuenta en [Twilio](https://www.twilio.com/)
2. Activar WhatsApp Sandbox
3. Obtener credenciales (Account SID y Auth Token)
4. Copiar `.env.local.example` a `.env.local` y configurar

### Opción 2: WhatsApp Business API
1. Crear cuenta en [Meta for Developers](https://developers.facebook.com/)
2. Configurar WhatsApp Business API
3. Obtener token de acceso
4. Configurar en `.env.local`

## 🎨 Personalización

### Horarios disponibles
Edita `lib/data/store.ts` para modificar los horarios:

```typescript
horariosDisponibles: [
  '09:00', '10:00', '11:00', // etc
]
```

### Datos de la barbería
Usa el panel de administración en `/admin` o edita directamente en `lib/data/store.ts`

## 🗄️ Base de datos

La aplicación usa **Supabase** (PostgreSQL) para:
- Almacenar usuarios y sus datos
- Gestionar turnos reservados
- Guardar configuración de la barbería
- Consultar horarios disponibles en tiempo real

Ver [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) para instrucciones de configuración.

## 📝 Próximas características

- [x] Integración con base de datos real (Supabase)
- [x] Sistema de cancelación de turnos
- [x] Visualización de turnos para el administrador
- [ ] Historial de turnos del cliente
- [ ] Notificaciones push
- [ ] Múltiples barberos/servicios
- [ ] Estadísticas y reportes
- [ ] Integración completa de WhatsApp con recordatorios automáticos
- [ ] Sistema de autenticación para el panel admin

## 📄 Licencia

MIT License

---

Hecho con ❤️ para barberías modernas

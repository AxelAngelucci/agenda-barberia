# 🚀 Inicio Rápido - Configurar Supabase en 5 minutos

## Error actual
```
Faltan las credenciales de Supabase
```

## Solución en 5 pasos

### 1️⃣ Crear cuenta en Supabase (2 minutos)
1. Abre: https://supabase.com
2. Clic en "Start your project"
3. Regístrate con GitHub o Google (más rápido)

### 2️⃣ Crear proyecto (2 minutos)
1. Clic en "New Project"
2. Completa:
   - **Name**: `agenda-barberia`
   - **Password**: Cualquier contraseña (guárdala)
   - **Region**: South America (São Paulo) o la más cercana
3. Clic en "Create new project"
4. **ESPERA 2 minutos** mientras se crea

### 3️⃣ Obtener credenciales (30 segundos)
1. En el menú lateral: **Settings** → **API**
2. Copia estos 2 valores:

   **Project URL:**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```

   **anon public key:** (es una key MUY larga)
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZi...
   ```

### 4️⃣ Crear archivo .env.local (30 segundos)

**Windows (PowerShell):**
```powershell
cd agenda-barberia
Copy-Item .env.local.example .env.local
notepad .env.local
```

**Mac/Linux:**
```bash
cd agenda-barberia
cp .env.local.example .env.local
nano .env.local
```

**O simplemente:**
- Copia el archivo `.env.local.example`
- Renómbralo a `.env.local`
- Ábrelo con cualquier editor de texto

### 5️⃣ Pegar credenciales y guardar

Edita el archivo `.env.local` y reemplaza:

```env
# REEMPLAZA ESTOS VALORES con los que copiaste
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...

# El resto déjalo como está (opcional)
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Guarda el archivo**

---

## ✅ Probar que funciona

### 1. Reinicia el servidor
```bash
# Presiona Ctrl+C para detener
# Luego ejecuta de nuevo:
npm run dev
```

### 2. Abre el navegador
```
http://localhost:3000
```

### 3. Si ves la página de login = ¡FUNCIONA! ✅

---

## 📊 Ahora crea las tablas en Supabase

**IMPORTANTE:** Antes de usar la app, necesitas crear las tablas:

### 1. Ve al SQL Editor de Supabase
1. En el menú lateral: **SQL Editor**
2. Clic en "New query"

### 2. Copia el script SQL
1. Abre el archivo: `supabase/schema.sql`
2. Copia TODO el contenido (Ctrl+A, Ctrl+C)

### 3. Ejecuta el script
1. Pega en el SQL Editor de Supabase (Ctrl+V)
2. Clic en el botón **"Run"** (esquina inferior derecha)
3. Deberías ver: ✅ "Tablas creadas exitosamente!"

---

## 🎉 ¡Listo! Ahora puedes usar la app

1. Ve a http://localhost:3000
2. Registra un usuario
3. Reserva un turno
4. Ve a `/admin` para ver el turno

---

## 🆘 Problemas comunes

### "Faltan las credenciales"
- ✅ Verifica que el archivo se llama `.env.local` (CON el punto al inicio)
- ✅ Verifica que las credenciales no tienen espacios extras
- ✅ Reinicia el servidor (Ctrl+C y `npm run dev`)

### "Cannot connect to Supabase"
- ✅ Verifica que el proyecto de Supabase está activo (dashboard)
- ✅ Verifica la URL y la key en `.env.local`
- ✅ Ejecutaste el script SQL?

### "No se muestran los horarios"
- ✅ Ejecutaste el script `supabase/schema.sql`?
- ✅ Ve a Supabase → Table Editor → barberia (debe tener 1 fila)

---

## 📖 Documentación completa

Para más detalles, consulta:
- `SUPABASE_SETUP.md` - Guía detallada con screenshots
- `README.md` - Documentación general de la app
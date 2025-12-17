# 🔐 Configuración de Google OAuth en Supabase

Sigue estos pasos para permitir que las barberías se registren e inicien sesión con Google.

---

## Paso 1: Configurar Google Cloud Console

### 1.1 Crear proyecto en Google Cloud

1. Ve a https://console.cloud.google.com
2. Crea un nuevo proyecto o selecciona uno existente
3. Dale un nombre como "Agenda Barbería"

### 1.2 Configurar la Pantalla de Consentimiento OAuth

1. En el menú lateral, ve a **APIs & Services** → **OAuth consent screen**
2. Selecciona **External** (para que cualquier usuario con cuenta de Google pueda usarlo)
3. Completa los datos requeridos:
   - **App name**: Agenda Barbería
   - **User support email**: Tu email
   - **Developer contact**: Tu email
4. Haz clic en **Save and Continue**
5. En **Scopes**, haz clic en **Add or Remove Scopes** y selecciona:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
6. Haz clic en **Save and Continue**
7. En **Test users** (opcional): Agrega emails de prueba si lo deseas
8. Haz clic en **Save and Continue**

### 1.3 Crear Credenciales OAuth

1. Ve a **APIs & Services** → **Credentials**
2. Haz clic en **Create Credentials** → **OAuth client ID**
3. Selecciona **Web application**
4. Nombre: `Agenda Barbería Web`
5. En **Authorized redirect URIs**, agrega:
   ```
   https://TU_PROYECTO.supabase.co/auth/v1/callback
   ```

   **⚠️ IMPORTANTE**: Reemplaza `TU_PROYECTO` con tu URL real de Supabase.

   Para encontrar tu URL:
   - Ve a tu proyecto en Supabase
   - Settings → API
   - Copia el "Project URL" (ejemplo: `https://hfleyonesllioqczrfvz.supabase.co`)

6. Haz clic en **Create**
7. **Guarda el Client ID y Client Secret** que aparecen (los necesitarás en el siguiente paso)

---

## Paso 2: Configurar Supabase

### 2.1 Habilitar Google Provider

1. Ve a tu proyecto en Supabase Dashboard
2. Ve a **Authentication** → **Providers**
3. Busca **Google** y haz clic para expandir
4. **Activa** el toggle "Enable Sign in with Google"
5. Pega los valores que guardaste:
   - **Client ID**: El Client ID de Google
   - **Client Secret**: El Client Secret de Google
6. Copia la **Callback URL** que Supabase te muestra (para confirmar que es correcta)
7. Haz clic en **Save**

### 2.2 Configurar Email Templates (Opcional)

1. Ve a **Authentication** → **Email Templates**
2. Puedes personalizar los emails de confirmación si lo deseas

---

## Paso 3: Aplicar el nuevo schema SQL

1. Ve a **SQL Editor** en Supabase
2. Haz clic en **New query**
3. Abre el archivo `supabase/schema-multitenant.sql` de este proyecto
4. **Copia TODO el contenido** y pégalo en el editor
5. Haz clic en **Run**
6. Deberías ver: "Tablas multi-tenant creadas exitosamente!"

---

## Paso 4: Configurar variables de entorno (OPCIONAL)

Si quieres usar Google OAuth también en desarrollo local, no necesitas configurar nada extra. Las credenciales ya están en Supabase.

Tu archivo `.env.local` solo necesita:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

---

## ✅ Verificar que funciona

1. Reinicia tu servidor: `npm run dev`
2. Ve a http://localhost:3000/admin/login
3. Haz clic en "Continuar con Google"
4. Deberías ver la pantalla de Google para seleccionar cuenta
5. Después del login, deberías ser redirigido al panel de admin

---

## 🔧 Solución de problemas

### Error: "redirect_uri_mismatch"
- Verifica que la URL de callback en Google Cloud Console sea EXACTAMENTE:
  ```
  https://TU_PROYECTO.supabase.co/auth/v1/callback
  ```
- No debe tener espacios ni caracteres extra
- Debe usar `https://` (no `http://`)

### Error: "Access blocked: This app's request is invalid"
- Asegúrate de haber configurado la **OAuth consent screen** completamente
- Agrega tu email como "Test user" si estás en modo desarrollo

### El botón de Google no aparece
- Verifica que Google Provider esté **habilitado** en Supabase
- Revisa la consola del navegador (F12) por errores
- Verifica que las credenciales de Supabase estén bien en `.env.local`

### Después del login, vuelve a la página de login
- Verifica que el middleware esté configurado correctamente
- Revisa las políticas RLS en Supabase (tabla `barberias`)

---

## 📚 Recursos adicionales

- [Documentación oficial de Supabase Auth con Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google Cloud Console](https://console.cloud.google.com)
- [OAuth 2.0 de Google](https://developers.google.com/identity/protocols/oauth2)

---

## 🎯 Flujo de autenticación

1. **Barbería hace clic en "Continuar con Google"**
2. **Google muestra la pantalla de selección de cuenta**
3. **Usuario selecciona su cuenta de Google**
4. **Google redirige a Supabase** con el token
5. **Supabase crea el usuario en `auth.users`**
6. **Tu app crea el registro en `barberias`** (automático en el onboarding)
7. **Usuario es redirigido al dashboard**

¡Listo! 🎉
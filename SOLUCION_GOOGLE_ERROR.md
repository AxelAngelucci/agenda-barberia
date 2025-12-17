# 🔧 Solución: Error "provider is not enabled"

## Error recibido:
```json
{
  "code": 400,
  "error_code": "validation_failed",
  "msg": "Unsupported provider: provider is not enabled"
}
```

---

## ✅ Solución paso a paso:

### Opción 1: Habilitar Google Provider en Supabase (RECOMENDADO)

#### Paso 1: Ir a Supabase Dashboard
1. Ve a https://supabase.com/dashboard
2. Abre tu proyecto: `hfleyonesllioqczrfvz`

#### Paso 2: Habilitar Google Authentication
1. En el menú lateral, ve a **Authentication**
2. Haz clic en **Providers**
3. Busca **Google** en la lista
4. Haz clic en **Google** para expandir la configuración
5. **Activa el toggle** "Enable Sign in with Google"
6. Por ahora, deja los campos vacíos o usa valores temporales:
   - Client ID: `temp`
   - Client Secret: `temp`
7. Haz clic en **Save**

**IMPORTANTE:** Esto habilitará Google temporalmente. Para producción necesitarás las credenciales reales de Google Cloud Console.

---

### Opción 2: Usar autenticación con Email/Password (ALTERNATIVA RÁPIDA)

Si prefieres probar el sistema sin configurar Google OAuth primero, puedo modificar el login para usar email y contraseña:

```typescript
// En lugar de Google OAuth, usar:
supabase.auth.signInWithPassword({
  email: 'admin@tubarber.com',
  password: 'tu_password'
})
```

**¿Prefieres esta opción?** Te toma 2 minutos y puedes probar el sistema inmediatamente.

---

### Opción 3: Configurar Google OAuth completo (PRODUCCIÓN)

Para usar Google OAuth correctamente, necesitas:

#### A. Crear proyecto en Google Cloud Console

1. Ve a https://console.cloud.google.com
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **APIs & Services** → **OAuth consent screen**
4. Configura:
   - User Type: **External**
   - App name: `Agenda Barbería`
   - User support email: Tu email
   - Developer contact: Tu email
5. Haz clic en **Save and Continue**

#### B. Crear credenciales OAuth

1. Ve a **APIs & Services** → **Credentials**
2. Haz clic en **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `Agenda Barbería Web`
5. En **Authorized redirect URIs**, agrega:
   ```
   https://hfleyonesllioqczrfvz.supabase.co/auth/v1/callback
   ```
6. Haz clic en **Create**
7. **Copia el Client ID y Client Secret** que aparecen

#### C. Configurar en Supabase

1. Vuelve a Supabase Dashboard
2. **Authentication** → **Providers** → **Google**
3. **Enable Sign in with Google**: ✅ Activado
4. Pega tus credenciales:
   - **Client ID**: El que copiaste de Google
   - **Client Secret**: El que copiaste de Google
5. Copia la **Callback URL** que Supabase muestra (para verificar):
   ```
   https://hfleyonesllioqczrfvz.supabase.co/auth/v1/callback
   ```
6. Haz clic en **Save**

---

## 🚀 Verificar que funcionó

1. Reinicia tu app: `Ctrl + C` y luego `npm run dev`
2. Ve a http://localhost:3000/admin/login
3. Haz clic en "Continuar con Google"
4. Si todo está bien, deberías ver la pantalla de Google para seleccionar cuenta

---

## 🆘 Si sigue sin funcionar

### Verificar en Supabase:
```sql
-- Ejecuta en SQL Editor para ver el estado:
SELECT * FROM auth.config;
```

### Verificar permisos:
1. Supabase Dashboard → **Settings** → **API**
2. Verifica que `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` estén correctos en tu `.env.local`

### Limpiar caché:
```bash
# En tu terminal:
rm -rf .next
npm run dev
```

---

## 💡 Recomendación

**Para empezar rápido:**
1. Solo habilita Google Provider en Supabase (Opción 1, sin credenciales)
2. O usa Email/Password temporalmente (Opción 2)

**Para producción:**
3. Configura Google OAuth completo (Opción 3)

---

¿Qué opción prefieres? Te ayudo a implementarla.
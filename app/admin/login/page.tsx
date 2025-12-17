'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client-browser';

export default function AdminLoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    apellido: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Verificar si ya hay sesión
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/admin');
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const supabase = createClient();

    try {
      if (isLogin) {
        // LOGIN
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (loginError) {
          setError(loginError.message);
          setIsLoading(false);
          return;
        }

        router.push('/admin');
        router.refresh();
      } else {
        // REGISTRO
        if (!formData.nombre || !formData.apellido) {
          setError('Completa todos los campos');
          setIsLoading(false);
          return;
        }

        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              nombre: formData.nombre,
              apellido: formData.apellido,
            }
          }
        });

        if (signUpError) {
          setError(signUpError.message);
          setIsLoading(false);
          return;
        }

        if (!authData.user) {
          setError('Error al crear cuenta');
          setIsLoading(false);
          return;
        }

        // Redirigir a onboarding
        router.push('/admin/onboarding');
        router.refresh();
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al procesar la solicitud');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-purple-500/20">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-4xl mb-4">
            ✂️
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Panel de Administración
          </CardTitle>
          <CardDescription className="text-lg text-gray-400">
            {isLogin ? 'Inicia sesión' : 'Crea tu cuenta'} para gestionar tu barbería
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="text-gray-200">Nombre</Label>
                  <Input
                    id="nombre"
                    type="text"
                    placeholder="Tu nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="h-12 border-purple-500/30 focus:border-purple-500"
                    required={!isLogin}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apellido" className="text-gray-200">Apellido</Label>
                  <Input
                    id="apellido"
                    type="text"
                    placeholder="Tu apellido"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    className="h-12 border-purple-500/30 focus:border-purple-500"
                    required={!isLogin}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-200">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-12 border-purple-500/30 focus:border-purple-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-200">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder={isLogin ? "Tu contraseña" : "Mínimo 6 caracteres"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-12 border-purple-500/30 focus:border-purple-500"
                required
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg disabled:opacity-50"
            >
              {isLoading
                ? (isLogin ? 'Iniciando sesión...' : 'Creando cuenta...')
                : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')
              }
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900 text-gray-400">
                  {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
            >
              {isLogin ? 'Crear cuenta nueva' : 'Iniciar sesión'}
            </Button>
          </form>

          {isLogin && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm text-blue-300 text-center">
                🔐 Usa tus credenciales de barbería
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
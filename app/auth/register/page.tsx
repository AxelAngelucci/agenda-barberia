'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client-browser';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    apellido: '',
    celular: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    }

    if (!formData.celular.trim()) {
      newErrors.celular = 'El celular es requerido';
    } else if (!/^\d{10}$/.test(formData.celular.replace(/\s/g, ''))) {
      newErrors.celular = 'Ingrese un número válido de 10 dígitos';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingrese un email válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const supabase = createClient();

      // Registrar usuario con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nombre: formData.nombre,
            apellido: formData.apellido,
            celular: formData.celular,
          }
        }
      });

      if (authError) {
        setErrors({ email: authError.message });
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        setErrors({ email: 'Error al crear usuario' });
        setIsLoading(false);
        return;
      }

      // Crear registro en tabla usuarios
      const { error: dbError } = await supabase
        .from('usuarios')
        .insert({
          id: authData.user.id,
          nombre: formData.nombre,
          apellido: formData.apellido,
          celular: formData.celular,
        });

      if (dbError) {
        console.error('Error al crear usuario en DB:', dbError);
      }

      router.push('/reservar');
      router.refresh();
    } catch (error) {
      console.error('Error en registro:', error);
      setErrors({ email: 'Error al conectar con el servidor' });
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
            Crear Cuenta
          </CardTitle>
          <CardDescription className="text-lg text-gray-400">
            Regístrate para reservar tu turno
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-gray-200">Nombre</Label>
              <Input
                id="nombre"
                type="text"
                placeholder="Tu nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="h-12 border-purple-500/30 focus:border-purple-500"
              />
              {errors.nombre && (
                <p className="text-sm text-red-400">{errors.nombre}</p>
              )}
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
              />
              {errors.apellido && (
                <p className="text-sm text-red-400">{errors.apellido}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="celular" className="text-gray-200">Celular</Label>
              <Input
                id="celular"
                type="tel"
                placeholder="1234567890"
                value={formData.celular}
                onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                className="h-12 border-purple-500/30 focus:border-purple-500"
              />
              {errors.celular && (
                <p className="text-sm text-red-400">{errors.celular}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-200">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-12 border-purple-500/30 focus:border-purple-500"
              />
              {errors.email && (
                <p className="text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-200">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-12 border-purple-500/30 focus:border-purple-500"
              />
              {errors.password && (
                <p className="text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-200">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repite tu contraseña"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="h-12 border-purple-500/30 focus:border-purple-500"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg disabled:opacity-50"
            >
              {isLoading ? 'Registrando...' : 'Crear Cuenta'}
            </Button>

            <div className="text-center text-gray-400">
              <p>¿Ya tienes cuenta?{' '}
                <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 font-semibold">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
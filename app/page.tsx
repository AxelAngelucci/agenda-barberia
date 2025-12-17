'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-purple-500/20">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-5xl mb-4">
            ✂️
          </div>
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Sistema de Agenda para Barberías
          </CardTitle>
          <CardDescription className="text-xl text-gray-300">
            Gestiona las reservas de tu barbería de forma simple y profesional
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
              <h3 className="text-xl font-bold text-white mb-2">✂️ Para Barberías</h3>
              <p className="text-gray-300 mb-4">
                Crea tu cuenta, configura tus servicios y comparte tu agenda con tus clientes
              </p>
              <Button
                onClick={() => router.push('/admin/login')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Acceder al Panel
              </Button>
            </div>

            <div className="p-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg border border-blue-500/30">
              <h3 className="text-xl font-bold text-white mb-2">👤 Para Clientes</h3>
              <p className="text-gray-300 mb-4">
                Solicita el enlace de reserva a tu barbería favorita y reserva tu turno
              </p>
              <div className="text-center text-gray-400 py-2">
                <p className="text-sm">Necesitas el enlace de tu barbería</p>
                <p className="text-xs mt-1">Ejemplo: /agenda/mi-barberia</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">✨ Características</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-300 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Gestión de turnos en tiempo real</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>URL única para cada barbería</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Sin registro para clientes</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Login seguro con Google</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Múltiples servicios configurables</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Horarios personalizables</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

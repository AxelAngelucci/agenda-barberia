'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getSession } from '@/lib/session';

export default function ExitoPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const session = getSession();
    if (!session) {
      router.push('/auth');
    }
  }, [router]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full border-green-500/20 bg-slate-900/50 backdrop-blur animate-in zoom-in duration-500">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          {/* Ícono de éxito */}
          <div className="text-8xl animate-bounce">✅</div>

          {/* Mensaje principal */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">
              ¡Turno reservado con éxito!
            </h1>
            <p className="text-gray-400 text-lg">
              Tu reserva ha sido confirmada
            </p>
          </div>

          {/* Información adicional */}
          <div className="bg-slate-800/50 p-4 rounded-lg space-y-3 text-left">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📧</span>
              <div>
                <p className="text-white font-semibold">Confirmación enviada</p>
                <p className="text-gray-400 text-sm">
                  Los detalles de tu turno han sido guardados
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">⏰</span>
              <div>
                <p className="text-white font-semibold">Recordatorio programado</p>
                <p className="text-gray-400 text-sm">
                  Recibirás un mensaje por WhatsApp 3 horas antes de tu cita
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">💈</span>
              <div>
                <p className="text-white font-semibold">Nos vemos pronto</p>
                <p className="text-gray-400 text-sm">
                  Te esperamos en Barbería El Estilo
                </p>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="space-y-3 pt-4">
            <Button
              onClick={() => router.push('/reservar')}
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Reservar otro turno
            </Button>
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="w-full h-12 text-lg border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
            >
              Volver al inicio
            </Button>
          </div>

          {/* Nota final */}
          <p className="text-gray-500 text-sm pt-4">
            Si necesitas cancelar o modificar tu turno, contacta directamente con la barbería
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
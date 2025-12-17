"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSession } from "@/lib/session";
import { User, Barberia, TipoServicio } from "@/lib/types";
import { createTurno } from "@/lib/services/turnos.service";
import { getBarberia } from "@/lib/services/barberia.service";

interface ReservaTemp {
  fecha: Date;
  hora: string;
  servicios: TipoServicio[];
}

export default function ConfirmarPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [reserva, setReserva] = useState<ReservaTemp | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [barberiaData, setBarberiaData] = useState<Barberia | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push("/auth");
      return;
    }

    const reservaTemp = localStorage.getItem("reserva_temp");
    if (!reservaTemp) {
      router.push("/reservar");
      return;
    }

    setUser(session);
    const parsedReserva = JSON.parse(reservaTemp);
    setReserva({
      ...parsedReserva,
      fecha: new Date(parsedReserva.fecha),
    });

    // Cargar datos de la barbería desde Supabase
    getBarberia().then((data) => {
      if (data) {
        setBarberiaData(data);
      }
    });
  }, [router]);

  const handleConfirm = async () => {
    if (!user || !reserva) return;

    setIsConfirming(true);
    setError("");

    try {
      console.log("🔄 Confirmando turno con datos:", {
        userId: user.id,
        fecha: reserva.fecha,
        hora: reserva.hora,
      });

      // Guardar el turno en Supabase (guardar como string separado por comas)
      const turno = await createTurno({
        userId: user.id,
        barberiaId: barberiaData.id,
        fecha: reserva.fecha,
        hora: reserva.hora,
        servicio: reserva.servicios.join(","),
      });

      console.log("📊 Resultado de createTurno:", turno);

      if (!turno) {
        console.error("⚠️ createTurno devolvió null");
        setError(
          "❌ Este horario ya fue reservado por otro cliente. Por favor, vuelve atrás y selecciona otro horario disponible.",
        );
        setIsConfirming(false);
        return;
      }

      // TODO: Programar recordatorio de WhatsApp
      // await programarRecordatorio(user, reserva);

      setConfirmed(true);
      localStorage.removeItem("reserva_temp");

      // Redirigir después de mostrar confirmación
      setTimeout(() => {
        router.push("/reservar/exito");
      }, 2000);
    } catch (error) {
      console.error("Error al confirmar turno:", error);
      setError("Error al confirmar el turno. Por favor, intenta nuevamente.");
      setIsConfirming(false);
    }
  };

  const handleGoBack = () => {
    router.push("/reservar");
  };

  if (!user || !reserva || !barberiaData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Cargando...</div>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-green-500/20 bg-slate-900/50 backdrop-blur animate-in zoom-in duration-500">
          <CardContent className="pt-6 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              ¡Turno confirmado!
            </h2>
            <p className="text-gray-400">Redirigiendo...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-6xl mb-4">✂️</div>
          <h1 className="text-3xl font-bold text-white">Confirmar Reserva</h1>
          <p className="text-gray-400">
            Revisa los detalles antes de confirmar
          </p>
        </div>

        {/* Detalles del turno */}
        <Card className="border-purple-500/20 bg-slate-900/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <span className="text-2xl">📋</span>
              Detalles de tu turno
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                <span className="text-gray-400">Fecha:</span>
                <span className="text-white font-semibold">
                  {reserva.fecha.toLocaleDateString("es-AR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                <span className="text-gray-400">Hora:</span>
                <span className="text-white font-semibold text-xl">
                  {reserva.hora}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                <span className="text-gray-400">Servicios:</span>
                <span className="text-white font-semibold">
                  {reserva.servicios
                    .map((s) => {
                      if (s === "corte") return "✂️ Corte";
                      if (s === "cejas") return "👁️ Cejas";
                      if (s === "barba") return "🧔 Barba";
                      if (s === "color") return "🎨 Color";
                      if (s === "alisado") return "💆 Alisado";
                      if (s === "semiPermanente") return "🌀 Semi Permanente";
                      return "";
                    })
                    .join(" + ")}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                <span className="text-gray-400">Cliente:</span>
                <span className="text-white font-semibold">
                  {user.nombre} {user.apellido}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                <span className="text-gray-400">Celular:</span>
                <span className="text-white font-semibold">{user.celular}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información de la barbería */}
        <Card className="border-purple-500/20 bg-slate-900/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <span className="text-2xl">🏪</span>
              {barberiaData.nombre}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-gray-400 text-sm mb-1">Dirección:</p>
                <p className="text-white font-semibold">
                  {barberiaData.direccion}
                </p>
              </div>

              <div className="p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/30">
                <p className="text-gray-300 text-sm mb-1">Total a pagar:</p>
                <p className="text-3xl font-bold text-green-400">
                  $
                  {(reserva.servicios.includes("corte")
                    ? barberiaData.precio
                    : 0) +
                    (reserva.servicios.includes("cejas")
                      ? barberiaData.precioCejas
                      : 0) +
                    (reserva.servicios.includes("barba")
                      ? barberiaData.precioBarba
                      : 0) +
                    (reserva.servicios.includes("color")
                      ? barberiaData.precioColor
                      : 0) +
                    (reserva.servicios.includes("alisado")
                      ? barberiaData.precioAlisado
                      : 0) +
                    (reserva.servicios.includes("semiPermanente")
                      ? barberiaData.precioSemiPermanente
                      : 0)}
                </p>
              </div>

              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-gray-400 text-sm mb-2">
                  Información adicional:
                </p>
                <div className="text-white space-y-1 whitespace-pre-line text-sm">
                  {barberiaData.datosExtra}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Aviso de recordatorio */}
        <Card className="border-blue-500/20 bg-blue-900/10 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💬</span>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">
                  Recordatorio por WhatsApp
                </h3>
                <p className="text-gray-400 text-sm">
                  Te enviaremos un recordatorio automático por WhatsApp 3 horas
                  antes de tu cita al número {user.celular}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mensaje de error */}
        {error && (
          <Card className="border-red-500/20 bg-red-900/10 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <h3 className="text-red-400 font-semibold mb-1">Error</h3>
                  <p className="text-gray-400 text-sm">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="flex-1 h-14 text-lg border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
            disabled={isConfirming}
          >
            ← Volver
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isConfirming}
            className="flex-1 h-14 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg disabled:opacity-50"
          >
            {isConfirming ? "Confirmando..." : "Confirmar turno ✓"}
          </Button>
        </div>
      </div>
    </div>
  );
}

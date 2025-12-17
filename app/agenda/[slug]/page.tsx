"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client-browser";

type Barberia = {
  id: string;
  nombre: string;
  slug: string;
  direccion: string;
  telefono: string;
  precio_corte: number;
  precio_cejas: number;
  precio_barba: number;
  precio_color?: number;
  precio_alisado?: number;
  precio_semi_permanente?: number;
  servicio_color_enabled?: boolean;
  servicio_alisado_enabled?: boolean;
  servicio_semi_permanente_enabled?: boolean;
  datos_extra?: string;
  horarios_disponibles: string[];
};

type TipoServicio = "corte" | "cejas" | "barba";

export default function AgendaPublicaPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [barberia, setBarberia] = useState<Barberia | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Datos del usuario (sin auth)
  const [userData, setUserData] = useState({
    nombre: "",
    apellido: "",
    celular: "",
  });
  const [userErrors, setUserErrors] = useState<Record<string, string>>({});

  // Selección de reserva
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedHour, setSelectedHour] = useState("");
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<
    TipoServicio[]
  >(["corte"]);

  // Horarios
  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([]);
  const [horariosOcupados, setHorariosOcupados] = useState<string[]>([]);
  const [isLoadingHorarios, setIsLoadingHorarios] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar datos de la barbería
  useEffect(() => {
    const fetchBarberia = async () => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("barberias")
        .select("*")
        .eq("slug", slug)
        .eq("activa", true)
        .single();

      if (error || !data) {
        setError("Barbería no encontrada");
        setLoading(false);
        return;
      }

      setBarberia(data);
      setLoading(false);
    };

    fetchBarberia();
  }, [slug]);

  // Cargar horarios cuando se selecciona fecha
  useEffect(() => {
    if (!selectedDate || !barberia) return;

    const fetchHorarios = async () => {
      setIsLoadingHorarios(true);
      setSelectedHour("");

      const supabase = createClient();

      // Obtener turnos ocupados
      const { data: turnos } = (await supabase
        .from("turnos")
        .select("hora")
        .eq("barberia_id", barberia.id)
        .eq("fecha", selectedDate.toISOString().split("T")[0])) as {
        data: { hora: string }[] | null;
      };

      const ocupados = turnos?.map((t) => t.hora.substring(0, 5)) || [];
      const disponibles = barberia.horarios_disponibles.filter(
        (h) => !ocupados.includes(h),
      );

      setHorariosOcupados(ocupados);
      setHorariosDisponibles(disponibles);
      setIsLoadingHorarios(false);
    };

    fetchHorarios();
  }, [selectedDate, barberia]);

  const toggleServicio = (servicio: TipoServicio) => {
    if (servicio === "corte") return; // Corte siempre incluido

    setServiciosSeleccionados((prev) =>
      prev.includes(servicio)
        ? prev.filter((s) => s !== servicio)
        : [...prev, servicio],
    );
  };

  const calcularPrecioTotal = () => {
    if (!barberia) return 0;
    let total = 0;
    if (serviciosSeleccionados.includes("corte"))
      total += Number(barberia.precio_corte) || 0;
    if (serviciosSeleccionados.includes("cejas"))
      total += Number(barberia.precio_cejas) || 0;
    if (serviciosSeleccionados.includes("barba"))
      total += Number(barberia.precio_barba) || 0;
    return total;
  };

  const validateUserData = () => {
    const errors: Record<string, string> = {};

    if (!userData.nombre.trim()) errors.nombre = "El nombre es requerido";
    if (!userData.apellido.trim()) errors.apellido = "El apellido es requerido";
    if (!userData.celular.trim()) {
      errors.celular = "El celular es requerido";
    } else if (!/^\d{10}$/.test(userData.celular.replace(/\s/g, ""))) {
      errors.celular = "Ingrese un número válido de 10 dígitos";
    }

    setUserErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleReservar = async () => {
    if (!validateUserData()) {
      alert("Por favor, completa todos tus datos correctamente");
      return;
    }

    if (!selectedDate || !selectedHour) {
      alert("Por favor, selecciona fecha y hora");
      return;
    }

    if (!barberia) return;

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      // 1. Crear o buscar usuario
      let userId: string;
      const { data: existingUser } = (await supabase
        .from("usuarios")
        .select("id")
        .eq("celular", userData.celular)
        .single()) as { data: { id: string } | null };

      if (existingUser) {
        userId = existingUser.id;
      } else {
        const { data: newUser, error: userError } = (await supabase
          .from("usuarios")
          .insert({
            nombre: userData.nombre,
            apellido: userData.apellido,
            celular: userData.celular,
          } as any)
          .select("id")
          .single()) as { data: { id: string } | null; error: any };

        if (userError || !newUser) {
          throw new Error("Error al registrar usuario");
        }
        userId = newUser.id;
      }

      // 2. Crear turno
      const { error: turnoError } = await supabase.from("turnos").insert({
        barberia_id: barberia.id,
        user_id: userId,
        fecha: selectedDate.toISOString().split("T")[0],
        hora: selectedHour,
        servicio: serviciosSeleccionados.join(","),
        confirmado: true,
        recordatorio_enviado: false,
      } as any);

      if (turnoError) {
        if (turnoError.code === "23505") {
          alert("❌ Este horario ya fue reservado. Por favor, elige otro.");
          // Recargar horarios
          setSelectedHour("");
        } else {
          throw turnoError;
        }
        setIsSubmitting(false);
        return;
      }

      // 3. Mostrar éxito
      alert(
        `✅ ¡Turno reservado exitosamente!\n\n${barberia.nombre}\n${selectedDate.toLocaleDateString("es-AR")} a las ${selectedHour}\n\nTotal: $${calcularPrecioTotal()}`,
      );

      // Limpiar formulario
      setSelectedDate(undefined);
      setSelectedHour("");
      setServiciosSeleccionados(["corte"]);
      setUserData({ nombre: "", apellido: "", celular: "" });
    } catch (err) {
      console.error("Error al reservar:", err);
      alert("Error al reservar el turno. Por favor, intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Cargando...</div>
      </div>
    );
  }

  if (error || !barberia) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="border-red-500/20 bg-slate-900/50 backdrop-blur">
          <CardContent className="pt-6 text-center">
            <p className="text-red-400 text-xl">❌ {error}</p>
            <p className="text-gray-400 mt-2">
              Verifica la URL e intenta nuevamente
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Barbería */}
        <Card className="border-purple-500/20 bg-slate-900/50 backdrop-blur">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-4xl mb-4">
              ✂️
            </div>
            <CardTitle className="text-3xl font-bold text-white">
              {barberia.nombre}
            </CardTitle>
            {barberia.direccion && (
              <p className="text-gray-400">📍 {barberia.direccion}</p>
            )}
            {barberia.telefono && (
              <p className="text-gray-400">📞 {barberia.telefono}</p>
            )}
            {barberia.datos_extra && (
              <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-purple-500/20">
                <p className="text-gray-300 text-sm whitespace-pre-line text-left">
                  {barberia.datos_extra}
                </p>
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Datos del cliente */}
        <Card className="border-purple-500/20 bg-slate-900/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">👤 Tus datos</CardTitle>
            <CardDescription className="text-gray-400">
              Necesitamos tu información para confirmar la reserva
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-gray-200">
                  Nombre
                </Label>
                <Input
                  id="nombre"
                  value={userData.nombre}
                  onChange={(e) =>
                    setUserData({ ...userData, nombre: e.target.value })
                  }
                  className="border-purple-500/30 focus:border-purple-500"
                />
                {userErrors.nombre && (
                  <p className="text-sm text-red-400">{userErrors.nombre}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellido" className="text-gray-200">
                  Apellido
                </Label>
                <Input
                  id="apellido"
                  value={userData.apellido}
                  onChange={(e) =>
                    setUserData({ ...userData, apellido: e.target.value })
                  }
                  className="border-purple-500/30 focus:border-purple-500"
                />
                {userErrors.apellido && (
                  <p className="text-sm text-red-400">{userErrors.apellido}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="celular" className="text-gray-200">
                Celular
              </Label>
              <Input
                id="celular"
                type="tel"
                placeholder="1234567890"
                value={userData.celular}
                onChange={(e) =>
                  setUserData({ ...userData, celular: e.target.value })
                }
                className="border-purple-500/30 focus:border-purple-500"
              />
              {userErrors.celular && (
                <p className="text-sm text-red-400">{userErrors.celular}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Servicios */}
        <Card className="border-purple-500/20 bg-slate-900/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">✂️ Servicios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                disabled
                className="h-20 flex flex-col gap-1 bg-gradient-to-r from-purple-500 to-pink-500"
              >
                <span className="text-2xl">✂️</span>
                <span>Corte</span>
                <span className="text-sm">${barberia.precio_corte || 0}</span>
              </Button>
              <Button
                onClick={() => toggleServicio("cejas")}
                variant={
                  serviciosSeleccionados.includes("cejas")
                    ? "default"
                    : "outline"
                }
                className={`h-20 flex flex-col gap-1 ${
                  serviciosSeleccionados.includes("cejas")
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                    : "border-blue-500/30 text-blue-400"
                }`}
              >
                <span className="text-2xl">👁️</span>
                <span>Cejas</span>
                <span className="text-sm">+${barberia.precio_cejas || 0}</span>
              </Button>
              <Button
                onClick={() => toggleServicio("barba")}
                variant={
                  serviciosSeleccionados.includes("barba")
                    ? "default"
                    : "outline"
                }
                className={`h-20 flex flex-col gap-1 ${
                  serviciosSeleccionados.includes("barba")
                    ? "bg-gradient-to-r from-green-500 to-emerald-500"
                    : "border-green-500/30 text-green-400"
                }`}
              >
                <span className="text-2xl">🧔</span>
                <span>Barba</span>
                <span className="text-sm">+${barberia.precio_barba || 0}</span>
              </Button>
            </div>
            <div className="p-4 bg-green-500/20 rounded-lg border border-green-500/30">
              <p className="text-green-400 text-lg font-bold text-center">
                Total: ${calcularPrecioTotal()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Calendario */}
        <Card className="border-purple-500/20 bg-slate-900/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">📅 Fecha</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() || date.getDay() === 0}
                className="rounded-md border border-purple-500/30 bg-slate-800/50 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Horarios */}
        {selectedDate && (
          <Card className="border-purple-500/20 bg-slate-900/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">⏰ Horario</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingHorarios ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {barberia.horarios_disponibles.map((hora) => {
                    const ocupado = horariosOcupados.includes(hora);
                    const seleccionado = selectedHour === hora;

                    return (
                      <Button
                        key={hora}
                        onClick={() => !ocupado && setSelectedHour(hora)}
                        disabled={ocupado}
                        variant={seleccionado ? "default" : "outline"}
                        className={`h-14 ${
                          ocupado
                            ? "bg-red-500/10 border-red-500/50 text-red-400 opacity-60"
                            : seleccionado
                              ? "bg-gradient-to-r from-purple-500 to-pink-500"
                              : "border-purple-500/30 text-purple-400"
                        }`}
                      >
                        {hora}
                      </Button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Botón reservar */}
        {selectedDate && selectedHour && (
          <Button
            onClick={handleReservar}
            disabled={isSubmitting}
            className="w-full h-16 text-xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            {isSubmitting
              ? "Reservando..."
              : `Reservar turno - $${calcularPrecioTotal()}`}
          </Button>
        )}
      </div>
    </div>
  );
}

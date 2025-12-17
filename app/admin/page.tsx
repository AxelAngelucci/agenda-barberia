"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { getBarberia, updateBarberia } from "@/lib/services/barberia.service";
import {
  getTurnosHoy,
  getTurnosProximos,
  cancelarTurno,
  type TurnoCompleto,
} from "@/lib/services/turnos.service";
import { Barberia } from "@/lib/types";
import { createClient } from "@/lib/supabase/client-browser";
import { signOut } from "@/lib/auth/actions";

export default function AdminPage() {
  const router = useRouter();
  const [barberiaData, setBarberiaData] = useState<Barberia | null>(null);
  const [barberiaSlug, setBarberiaSlug] = useState<string>("");
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [turnosHoy, setTurnosHoy] = useState<TurnoCompleto[]>([]);
  const [turnosProximos, setTurnosProximos] = useState<TurnoCompleto[]>([]);
  const [activeTab, setActiveTab] = useState<"config" | "turnos">("turnos");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [barberia, hoy, proximos] = await Promise.all([
      getBarberia(),
      getTurnosHoy(),
      getTurnosProximos(),
    ]);

    if (barberia) setBarberiaData(barberia);
    setTurnosHoy(hoy);
    setTurnosProximos(proximos);

    // Obtener el slug de la barbería desde Supabase
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: barberiaInfo } = (await supabase
        .from("barberias")
        .select("slug")
        .eq("id", user.id)
        .single()) as { data: { slug: string } | null };

      if (barberiaInfo) {
        setBarberiaSlug(barberiaInfo.slug);
      }
    }

    setIsLoading(false);
  };

  const copyToClipboard = async () => {
    const url = `${window.location.origin}/agenda/${barberiaSlug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error al copiar:", err);
    }
  };

  const handleSave = async () => {
    if (!barberiaData) return;

    setIsSaving(true);
    const success = await updateBarberia(barberiaData);

    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setIsSaving(false);
  };

  const handleCancelarTurno = async (turnoId: string) => {
    if (!confirm("¿Estás seguro de que quieres cancelar este turno?")) return;

    const success = await cancelarTurno(turnoId);
    if (success) {
      await loadData();
    }
  };

  if (isLoading || !barberiaData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-purple-500/20 bg-slate-900/50 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                  <span className="text-4xl">⚙️</span>
                  Panel de Administración
                </h1>
                <p className="text-gray-400 mt-2">
                  Gestiona la información de tu barbería
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => router.push("/")}
                  variant="outline"
                  className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                >
                  Ver sitio
                </Button>
                <Button
                  onClick={async () => {
                    if (
                      confirm("¿Estás seguro de que quieres cerrar sesión?")
                    ) {
                      await signOut();
                    }
                  }}
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  Cerrar sesión
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enlace personalizado */}
        {barberiaSlug && (
          <Card className="border-green-500/20 bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <span className="text-2xl">🔗</span>
                Tu enlace de reservas
              </CardTitle>
              <CardDescription className="text-gray-300">
                Comparte este enlace con tus clientes para que reserven turnos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex-1 p-4 bg-slate-800/70 rounded-lg border border-green-500/30">
                  <p className="text-green-400 font-mono text-sm md:text-base break-all">
                    {typeof window !== "undefined" &&
                      `${window.location.origin}/agenda/${barberiaSlug}`}
                  </p>
                </div>
                <Button
                  onClick={copyToClipboard}
                  className={`h-14 px-6 transition-all duration-300 ${
                    copied
                      ? "bg-green-600 hover:bg-green-600"
                      : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  }`}
                >
                  {copied ? (
                    <>
                      <span className="text-xl mr-2">✓</span>
                      Copiado
                    </>
                  ) : (
                    <>
                      <span className="text-xl mr-2">📋</span>
                      Copiar
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-800/50 rounded-lg border border-green-500/20">
                  <p className="text-xs text-gray-400 mb-1">Compartir por</p>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`¡Reserva tu turno aquí! ${typeof window !== "undefined" ? window.location.origin : ""}/agenda/${barberiaSlug}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 font-semibold flex items-center gap-2"
                  >
                    <span className="text-xl">💬</span>
                    WhatsApp
                  </a>
                </div>

                <div className="p-3 bg-slate-800/50 rounded-lg border border-green-500/20">
                  <p className="text-xs text-gray-400 mb-1">
                    Ver página pública
                  </p>
                  <a
                    href={`/agenda/${barberiaSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-2"
                  >
                    <span className="text-xl">👁️</span>
                    Vista previa
                  </a>
                </div>

                <div className="p-3 bg-slate-800/50 rounded-lg border border-green-500/20">
                  <p className="text-xs text-gray-400 mb-1">Tu identificador</p>
                  <p className="text-purple-400 font-semibold">
                    /{barberiaSlug}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-300">
                  💡 <strong>Tip:</strong> Guarda este enlace en tus redes
                  sociales, bio de Instagram, o envíalo por WhatsApp a tus
                  clientes.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex gap-2">
          <Button
            onClick={() => setActiveTab("turnos")}
            variant={activeTab === "turnos" ? "default" : "outline"}
            className={
              activeTab === "turnos"
                ? "bg-gradient-to-r from-purple-500 to-pink-500"
                : "border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
            }
          >
            📅 Turnos
          </Button>
          <Button
            onClick={() => setActiveTab("config")}
            variant={activeTab === "config" ? "default" : "outline"}
            className={
              activeTab === "config"
                ? "bg-gradient-to-r from-purple-500 to-pink-500"
                : "border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
            }
          >
            ⚙️ Configuración
          </Button>
        </div>

        {/* Vista de turnos */}
        {activeTab === "turnos" && (
          <>
            {/* Turnos de hoy */}
            <Card className="border-purple-500/20 bg-slate-900/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">Turnos de hoy</CardTitle>
                <CardDescription className="text-gray-400">
                  {new Date().toLocaleDateString("es-AR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {turnosHoy.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-4xl mb-2">📭</p>
                    <p>No hay turnos para hoy</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {turnosHoy.map((turno) => (
                      <div
                        key={turno.id}
                        className="p-4 bg-slate-800/50 rounded-lg flex justify-between items-center"
                      >
                        <div>
                          <p className="text-white font-semibold text-lg">
                            {turno.hora}
                          </p>
                          <p className="text-gray-400">
                            {turno.usuario.nombre} {turno.usuario.apellido}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {turno.usuario.celular}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleCancelarTurno(turno.id)}
                          variant="outline"
                          size="sm"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          Cancelar
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Próximos turnos */}
            <Card className="border-purple-500/20 bg-slate-900/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">Próximos 7 días</CardTitle>
                <CardDescription className="text-gray-400">
                  Turnos programados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {turnosProximos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-4xl mb-2">📭</p>
                    <p>No hay turnos próximos</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {turnosProximos.map((turno) => (
                      <div
                        key={turno.id}
                        className="p-4 bg-slate-800/50 rounded-lg flex justify-between items-center"
                      >
                        <div>
                          <p className="text-white font-semibold">
                            {turno.fecha.toLocaleDateString("es-AR", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            })}{" "}
                            - {turno.hora}
                          </p>
                          <p className="text-gray-400">
                            {turno.usuario.nombre} {turno.usuario.apellido}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {turno.usuario.celular}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleCancelarTurno(turno.id)}
                          variant="outline"
                          size="sm"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          Cancelar
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Formulario de edición */}
        {activeTab === "config" && (
          <>
            <Card className="border-purple-500/20 bg-slate-900/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">
                  Información de la barbería
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Edita los datos que verán tus clientes al reservar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="text-gray-200">
                    Nombre de la barbería
                  </Label>
                  <Input
                    id="nombre"
                    value={barberiaData.nombre}
                    onChange={(e) =>
                      setBarberiaData({
                        ...barberiaData,
                        nombre: e.target.value,
                      })
                    }
                    className="h-12 text-lg border-purple-500/30 focus:border-purple-500 bg-slate-800/50 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direccion" className="text-gray-200">
                    Dirección
                  </Label>
                  <Input
                    id="direccion"
                    value={barberiaData.direccion}
                    onChange={(e) =>
                      setBarberiaData({
                        ...barberiaData,
                        direccion: e.target.value,
                      })
                    }
                    className="h-12 text-lg border-purple-500/30 focus:border-purple-500 bg-slate-800/50 text-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="precio" className="text-gray-200">
                      Precio del corte ($)
                    </Label>
                    <Input
                      id="precio"
                      type="number"
                      value={barberiaData.precio || ""}
                      onChange={(e) =>
                        setBarberiaData({
                          ...barberiaData,
                          precio: Number(e.target.value) || 0,
                        })
                      }
                      placeholder="Ej: 150"
                      className="h-12 text-lg border-purple-500/30 focus:border-purple-500 bg-slate-800/50 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="precioCejas" className="text-gray-200">
                      Precio de cejas ($)
                    </Label>
                    <Input
                      id="precioCejas"
                      type="number"
                      value={barberiaData.precioCejas || ""}
                      onChange={(e) =>
                        setBarberiaData({
                          ...barberiaData,
                          precioCejas: Number(e.target.value) || 0,
                        })
                      }
                      placeholder="Ej: 100"
                      className="h-12 text-lg border-purple-500/30 focus:border-purple-500 bg-slate-800/50 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="precioBarba" className="text-gray-200">
                      Precio de barba ($)
                    </Label>
                    <Input
                      id="precioBarba"
                      type="number"
                      value={barberiaData.precioBarba || ""}
                      onChange={(e) =>
                        setBarberiaData({
                          ...barberiaData,
                          precioBarba: Number(e.target.value) || 0,
                        })
                      }
                      placeholder="Ej: 200"
                      className="h-12 text-lg border-purple-500/30 focus:border-purple-500 bg-slate-800/50 text-white"
                    />
                  </div>
                </div>

                {/* Servicios opcionales */}
                <div className="space-y-4 p-4 bg-slate-800/30 rounded-lg border border-purple-500/20">
                  <h3 className="text-white font-semibold">
                    Servicios Opcionales
                  </h3>
                  <p className="text-sm text-gray-400">
                    Habilita los servicios adicionales que ofreces
                  </p>

                  {/* Color */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="servicioColor"
                        checked={barberiaData.servicioColorEnabled}
                        onChange={(e) =>
                          setBarberiaData({
                            ...barberiaData,
                            servicioColorEnabled: e.target.checked,
                          })
                        }
                        className="w-5 h-5 rounded border-purple-500/30 bg-slate-800/50 checked:bg-purple-500"
                      />
                      <Label
                        htmlFor="servicioColor"
                        className="text-gray-200 cursor-pointer"
                      >
                        🎨 Habilitar Color
                      </Label>
                    </div>
                    {barberiaData.servicioColorEnabled && (
                      <Input
                        type="number"
                        value={barberiaData.precioColor || ""}
                        onChange={(e) =>
                          setBarberiaData({
                            ...barberiaData,
                            precioColor: Number(e.target.value) || 0,
                          })
                        }
                        placeholder="Precio del color"
                        className="h-12 text-lg border-purple-500/30 focus:border-purple-500 bg-slate-800/50 text-white"
                      />
                    )}
                  </div>

                  {/* Alisado */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="servicioAlisado"
                        checked={barberiaData.servicioAlisadoEnabled}
                        onChange={(e) =>
                          setBarberiaData({
                            ...barberiaData,
                            servicioAlisadoEnabled: e.target.checked,
                          })
                        }
                        className="w-5 h-5 rounded border-purple-500/30 bg-slate-800/50 checked:bg-purple-500"
                      />
                      <Label
                        htmlFor="servicioAlisado"
                        className="text-gray-200 cursor-pointer"
                      >
                        💆 Habilitar Alisado
                      </Label>
                    </div>
                    {barberiaData.servicioAlisadoEnabled && (
                      <Input
                        type="number"
                        value={barberiaData.precioAlisado || ""}
                        onChange={(e) =>
                          setBarberiaData({
                            ...barberiaData,
                            precioAlisado: Number(e.target.value) || 0,
                          })
                        }
                        placeholder="Precio del alisado"
                        className="h-12 text-lg border-purple-500/30 focus:border-purple-500 bg-slate-800/50 text-white"
                      />
                    )}
                  </div>

                  {/* Semi Permanente de Rulos */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="servicioSemiPermanente"
                        checked={barberiaData.servicioSemiPermanenteEnabled}
                        onChange={(e) =>
                          setBarberiaData({
                            ...barberiaData,
                            servicioSemiPermanenteEnabled: e.target.checked,
                          })
                        }
                        className="w-5 h-5 rounded border-purple-500/30 bg-slate-800/50 checked:bg-purple-500"
                      />
                      <Label
                        htmlFor="servicioSemiPermanente"
                        className="text-gray-200 cursor-pointer"
                      >
                        🌀 Habilitar Semi Permanente de Rulos
                      </Label>
                    </div>
                    {barberiaData.servicioSemiPermanenteEnabled && (
                      <Input
                        type="number"
                        value={barberiaData.precioSemiPermanente || ""}
                        onChange={(e) =>
                          setBarberiaData({
                            ...barberiaData,
                            precioSemiPermanente: Number(e.target.value) || 0,
                          })
                        }
                        placeholder="Precio del semi permanente"
                        className="h-12 text-lg border-purple-500/30 focus:border-purple-500 bg-slate-800/50 text-white"
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="datosExtra" className="text-gray-200">
                    Información adicional
                  </Label>
                  <p className="text-sm text-gray-400">
                    Promociones, barberos disponibles, tiempo estimado, etc.
                  </p>
                  <textarea
                    id="datosExtra"
                    value={barberiaData.datosExtra}
                    onChange={(e) =>
                      setBarberiaData({
                        ...barberiaData,
                        datosExtra: e.target.value,
                      })
                    }
                    rows={6}
                    className="w-full p-3 text-lg border border-purple-500/30 focus:border-purple-500 bg-slate-800/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                  <p className="text-xs text-gray-500">
                    Puedes usar emojis y saltos de línea para mejor
                    visualización
                  </p>
                </div>

                {saved && (
                  <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg animate-in fade-in slide-in-from-top-2">
                    <p className="text-green-400 font-semibold flex items-center gap-2">
                      ✅ Cambios guardados exitosamente
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg disabled:opacity-50"
                >
                  {isSaving ? "Guardando..." : "Guardar cambios"}
                </Button>
              </CardContent>
            </Card>

            {/* Vista previa */}
            <Card className="border-purple-500/20 bg-slate-900/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">Vista previa</CardTitle>
                <CardDescription className="text-gray-400">
                  Así verán los clientes tu información
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-800/50 p-6 rounded-lg space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {barberiaData.nombre}
                    </h3>
                    <p className="text-gray-400">📍 {barberiaData.direccion}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
                      <p className="text-gray-300 text-xs mb-1">✂️ Corte</p>
                      <p className="text-2xl font-bold text-purple-400">
                        ${barberiaData.precio}
                      </p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg border border-blue-500/30">
                      <p className="text-gray-300 text-xs mb-1">👁️ Cejas</p>
                      <p className="text-2xl font-bold text-blue-400">
                        ${barberiaData.precioCejas}
                      </p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/30">
                      <p className="text-gray-300 text-xs mb-1">🧔 Barba</p>
                      <p className="text-2xl font-bold text-green-400">
                        ${barberiaData.precioBarba}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm mb-2">
                      Información adicional:
                    </p>
                    <div className="text-white whitespace-pre-line text-sm">
                      {barberiaData.datosExtra}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

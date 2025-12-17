'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { TipoServicio } from '@/lib/types';
import { getTodosLosHorarios } from '@/lib/services/turnos.service';
import { getBarberia } from '@/lib/services/barberia.service';
import { createClient } from '@/lib/supabase/client-browser';

export default function ReservarPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; nombre: string; apellido: string; celular: string } | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedHour, setSelectedHour] = useState<string>('');
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<TipoServicio[]>(['corte']);
  const [todosHorarios, setTodosHorarios] = useState<string[]>([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([]);
  const [horariosOcupados, setHorariosOcupados] = useState<string[]>([]);
  const [isLoadingHorarios, setIsLoadingHorarios] = useState(false);
  const [precios, setPrecios] = useState({ corte: 0, cejas: 0, barba: 0, color: 0, alisado: 0, semiPermanente: 0 });
  const [serviciosHabilitados, setServiciosHabilitados] = useState({
    color: false,
    alisado: false,
    semiPermanente: false
  });

  useEffect(() => {
    const supabase = createClient();

    // Obtener usuario autenticado
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/auth/login');
      } else {
        setUser({
          email: data.user.email || '',
          nombre: data.user.user_metadata.nombre || '',
          apellido: data.user.user_metadata.apellido || '',
          celular: data.user.user_metadata.celular || ''
        });
      }
    });

    // Cargar precios y servicios habilitados
    getBarberia().then(barberia => {
      if (barberia) {
        setPrecios({
          corte: barberia.precio,
          cejas: barberia.precioCejas,
          barba: barberia.precioBarba,
          color: barberia.precioColor,
          alisado: barberia.precioAlisado,
          semiPermanente: barberia.precioSemiPermanente
        });
        setServiciosHabilitados({
          color: barberia.servicioColorEnabled,
          alisado: barberia.servicioAlisadoEnabled,
          semiPermanente: barberia.servicioSemiPermanenteEnabled
        });
      }
    });
  }, [router]);

  // Cargar horarios disponibles cuando se selecciona una fecha
  useEffect(() => {
    if (selectedDate) {
      setIsLoadingHorarios(true);
      setSelectedHour(''); // Limpiar selección anterior

      getTodosLosHorarios(selectedDate)
        .then(resultado => {
          setTodosHorarios(resultado.todos);
          setHorariosDisponibles(resultado.disponibles);
          setHorariosOcupados(resultado.ocupados);
          setIsLoadingHorarios(false);
          console.log("horarios:", resultado)
        })
        .catch(error => {
          console.error('Error al cargar horarios:', error);
          setIsLoadingHorarios(false);
        });
    }
  }, [selectedDate]);

  const toggleServicio = (servicio: TipoServicio) => {
    if (servicio === 'corte') {
      // Corte siempre debe estar seleccionado
      return;
    }

    setServiciosSeleccionados(prev => {
      if (prev.includes(servicio)) {
        return prev.filter(s => s !== servicio);
      } else {
        return [...prev, servicio];
      }
    });
  };

  const calcularPrecioTotal = () => {
    let total = 0;
    if (serviciosSeleccionados.includes('corte')) total += precios.corte;
    if (serviciosSeleccionados.includes('cejas')) total += precios.cejas;
    if (serviciosSeleccionados.includes('barba')) total += precios.barba;
    if (serviciosSeleccionados.includes('color')) total += precios.color;
    if (serviciosSeleccionados.includes('alisado')) total += precios.alisado;
    if (serviciosSeleccionados.includes('semiPermanente')) total += precios.semiPermanente;
    return total;
  };

  const handleContinue = () => {
    if (selectedDate && selectedHour) {
      // Verificar que el horario sigue disponible
      if (horariosOcupados.includes(selectedHour)) {
        alert('❌ Lo sentimos, este horario ya fue reservado. Por favor selecciona otro.');
        setSelectedHour('');
        return;
      }

      // Guardar la selección en localStorage para la página de confirmación
      localStorage.setItem('reserva_temp', JSON.stringify({
        fecha: selectedDate,
        hora: selectedHour,
        servicios: serviciosSeleccionados
      }));
      router.push('/reservar/confirmar');
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  const handleEditProfile = () => {
    router.push('/auth/register');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header con info del usuario */}
        <Card className="border-purple-500/20 bg-slate-900/50 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-400">Bienvenido/a</p>
                <h2 className="text-2xl font-bold text-white">
                  {user.nombre} {user.apellido}
                </h2>
                <p className="text-sm text-gray-400">{user.celular}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleEditProfile}
                  className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                >
                  Editar datos
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  Salir
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selección de servicios */}
        <Card className="border-purple-500/20 bg-slate-900/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <span className="text-2xl">✂️</span>
              Selecciona los servicios
            </CardTitle>
            <CardDescription className="text-gray-400">
              El corte es obligatorio, puedes agregar cejas y/o barba
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Corte - Siempre seleccionado */}
              <div className="relative">
                <Button
                  disabled
                  variant="default"
                  className="w-full h-24 flex flex-col gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 cursor-not-allowed"
                >
                  <span className="text-3xl">✂️</span>
                  <span className="font-semibold">Corte</span>
                  <span className="text-sm">${precios.corte}</span>
                </Button>
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Incluido
                </div>
              </div>

              {/* Cejas - Opcional */}
              <Button
                onClick={() => toggleServicio('cejas')}
                variant={serviciosSeleccionados.includes('cejas') ? 'default' : 'outline'}
                className={`h-24 flex flex-col gap-2 relative ${
                  serviciosSeleccionados.includes('cejas')
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                    : 'border-blue-500/30 text-blue-400 hover:bg-blue-500/10'
                }`}
              >
                {serviciosSeleccionados.includes('cejas') && (
                  <span className="absolute top-2 right-2 text-xl">✓</span>
                )}
                <span className="text-3xl">👁️</span>
                <span className="font-semibold">Cejas</span>
                <span className="text-sm">+${precios.cejas}</span>
              </Button>

              {/* Barba - Opcional */}
              <Button
                onClick={() => toggleServicio('barba')}
                variant={serviciosSeleccionados.includes('barba') ? 'default' : 'outline'}
                className={`h-24 flex flex-col gap-2 relative ${
                  serviciosSeleccionados.includes('barba')
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                    : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                }`}
              >
                {serviciosSeleccionados.includes('barba') && (
                  <span className="absolute top-2 right-2 text-xl">✓</span>
                )}
                <span className="text-3xl">🧔</span>
                <span className="font-semibold">Barba</span>
                <span className="text-sm">+${precios.barba}</span>
              </Button>

              {/* Color - Opcional condicional */}
              {serviciosHabilitados.color && (
                <Button
                  onClick={() => toggleServicio('color')}
                  variant={serviciosSeleccionados.includes('color') ? 'default' : 'outline'}
                  className={`h-24 flex flex-col gap-2 relative ${
                    serviciosSeleccionados.includes('color')
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600'
                      : 'border-pink-500/30 text-pink-400 hover:bg-pink-500/10'
                  }`}
                >
                  {serviciosSeleccionados.includes('color') && (
                    <span className="absolute top-2 right-2 text-xl">✓</span>
                  )}
                  <span className="text-3xl">🎨</span>
                  <span className="font-semibold">Color</span>
                  <span className="text-sm">+${precios.color}</span>
                </Button>
              )}

              {/* Alisado - Opcional condicional */}
              {serviciosHabilitados.alisado && (
                <Button
                  onClick={() => toggleServicio('alisado')}
                  variant={serviciosSeleccionados.includes('alisado') ? 'default' : 'outline'}
                  className={`h-24 flex flex-col gap-2 relative ${
                    serviciosSeleccionados.includes('alisado')
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                      : 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                  }`}
                >
                  {serviciosSeleccionados.includes('alisado') && (
                    <span className="absolute top-2 right-2 text-xl">✓</span>
                  )}
                  <span className="text-3xl">💆</span>
                  <span className="font-semibold">Alisado</span>
                  <span className="text-sm">+${precios.alisado}</span>
                </Button>
              )}

              {/* Semi Permanente - Opcional condicional */}
              {serviciosHabilitados.semiPermanente && (
                <Button
                  onClick={() => toggleServicio('semiPermanente')}
                  variant={serviciosSeleccionados.includes('semiPermanente') ? 'default' : 'outline'}
                  className={`h-24 flex flex-col gap-2 relative ${
                    serviciosSeleccionados.includes('semiPermanente')
                      ? 'bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600'
                      : 'border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10'
                  }`}
                >
                  {serviciosSeleccionados.includes('semiPermanente') && (
                    <span className="absolute top-2 right-2 text-xl">✓</span>
                  )}
                  <span className="text-3xl">🌀</span>
                  <span className="font-semibold">Semi Permanente</span>
                  <span className="text-sm">+${precios.semiPermanente}</span>
                </Button>
              )}
            </div>

            {/* Total */}
            <div className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/30">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-300 text-sm">Total a pagar:</p>
                  <p className="text-white text-xs mt-1">
                    {serviciosSeleccionados.map(s => {
                      if (s === 'corte') return '✂️ Corte';
                      if (s === 'cejas') return '👁️ Cejas';
                      if (s === 'barba') return '🧔 Barba';
                      if (s === 'color') return '🎨 Color';
                      if (s === 'alisado') return '💆 Alisado';
                      if (s === 'semiPermanente') return '🌀 Semi Permanente';
                      return '';
                    }).join(' + ')}
                  </p>
                </div>
                <p className="text-4xl font-bold text-green-400">${calcularPrecioTotal()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selección de fecha */}
        <Card className="border-purple-500/20 bg-slate-900/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <span className="text-2xl">📅</span>
              Selecciona una fecha
            </CardTitle>
            <CardDescription className="text-gray-400">
              Elige el día que deseas reservar tu turno
            </CardDescription>
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

        {/* Selección de hora */}
        {selectedDate && (
          <Card className="border-purple-500/20 bg-slate-900/50 backdrop-blur animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <span className="text-2xl">⏰</span>
                Selecciona un horario
              </CardTitle>
              <CardDescription className="text-gray-400">
                Fecha seleccionada: {selectedDate.toLocaleDateString('es-AR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingHorarios ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
                  <p className="text-gray-400 mt-2">Cargando horarios...</p>
                </div>
              ) : (
                <>
                  {/* Leyenda */}
                  <div className="flex gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded"></div>
                      <span className="text-gray-400">Disponible</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500/20 border border-red-500/50 rounded"></div>
                      <span className="text-gray-400">Ocupado</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {todosHorarios.map((hora) => {
                      const estaOcupado = horariosOcupados.includes(hora);
                      const estaSeleccionado = selectedHour === hora;

                      return (
                        <Button
                          key={hora}
                          onClick={() => !estaOcupado && setSelectedHour(hora)}
                          disabled={estaOcupado}
                          variant={estaSeleccionado ? "default" : "outline"}
                          className={`h-16 text-lg font-semibold transition-all duration-200 relative ${
                            estaOcupado
                              ? 'bg-red-500/10 border-red-500/50 text-red-400 cursor-not-allowed hover:bg-red-500/10 opacity-60'
                              : estaSeleccionado
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0'
                              : 'border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:border-purple-500'
                          }`}
                        >
                          {hora}
                          {estaOcupado && (
                            <span className="absolute top-1 right-1 text-xs">🔒</span>
                          )}
                        </Button>
                      );
                    })}
                  </div>

                  {horariosOcupados.length > 0 && (
                    <p className="text-sm text-gray-500 mt-4 text-center">
                      {horariosOcupados.length} {horariosOcupados.length === 1 ? 'horario ocupado' : 'horarios ocupados'} •
                      {' '}{horariosDisponibles.length} {horariosDisponibles.length === 1 ? 'disponible' : 'disponibles'}
                    </p>
                  )}

                  {horariosDisponibles.length === 0 && todosHorarios.length > 0 && (
                    <div className="text-center py-8 bg-red-500/10 rounded-lg border border-red-500/30 mt-4">
                      <p className="text-red-400 font-semibold">❌ No hay horarios disponibles</p>
                      <p className="text-gray-400 text-sm mt-2">Por favor, selecciona otra fecha</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Botón continuar */}
        {selectedDate && selectedHour && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Button
              onClick={handleContinue}
              className="w-full h-16 text-xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg shadow-green-500/50"
            >
              Continuar con la reserva →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
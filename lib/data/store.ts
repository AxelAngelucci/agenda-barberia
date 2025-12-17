// Store simple en memoria (en producción usar una base de datos)
import { User, Barberia, Turno } from "../types";

// Datos de ejemplo de la barbería
export const barberiaData: Barberia = {
  id: "1",
  nombre: "Barbería El Estilo",
  direccion: "Av. Principal 123, Centro",
  precio: 150,
  precioCejas: 50,
  precioBarba: 100,
  precioColor: 200,
  precioAlisado: 300,
  precioSemiPermanente: 250,
  servicioColorEnabled: false,
  servicioAlisadoEnabled: false,
  servicioSemiPermanenteEnabled: false,
  datosExtra:
    "⭐ Promoción: 2x1 los martes\n✂️ Barberos profesionales con +10 años de experiencia\n⏱️ Tiempo estimado: 30-45 minutos",
  horariosDisponibles: [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
  ],
  duracionTurno: 45,
};

// Almacenamiento en memoria
export const users: Map<string, User> = new Map();
export const turnos: Map<string, Turno> = new Map();

// Funciones helper
export function saveUser(user: User): void {
  users.set(user.id, user);
}

export function getUserByPhone(celular: string): User | undefined {
  return Array.from(users.values()).find((u) => u.celular === celular);
}

export function saveTurno(turno: Turno): void {
  turnos.set(turno.id, turno);
}

export function getTurnosByDate(fecha: Date): Turno[] {
  return Array.from(turnos.values()).filter((t) => {
    const turnoDate = new Date(t.fecha);
    return turnoDate.toDateString() === fecha.toDateString();
  });
}

export function getHorariosDisponibles(fecha: Date): string[] {
  const turnosDelDia = getTurnosByDate(fecha);
  const horasOcupadas = turnosDelDia.map((t) => t.hora);
  return barberiaData.horariosDisponibles.filter(
    (h) => !horasOcupadas.includes(h),
  );
}

export function updateBarberia(data: Partial<Barberia>): void {
  Object.assign(barberiaData, data);
}

// Tipos para la aplicación de agenda de barbería

export interface User {
  id: string;
  nombre: string;
  apellido: string;
  celular: string;
  createdAt: Date;
}

export interface Barberia {
  id: string;
  nombre: string;
  direccion: string;
  precio: number;
  precioCejas: number;
  precioBarba: number;
  precioColor: number;
  precioAlisado: number;
  precioSemiPermanente: number;
  servicioColorEnabled: boolean;
  servicioAlisadoEnabled: boolean;
  servicioSemiPermanenteEnabled: boolean;
  datosExtra: string;
  horariosDisponibles: string[]; // ["09:00", "10:00", "11:00", ...]
  duracionTurno: number; // en minutos
}

export type TipoServicio = 'corte' | 'cejas' | 'barba' | 'color' | 'alisado' | 'semiPermanente';

export interface Turno {
  id: string;
  userId: string;
  barberiaId: string;
  fecha: Date;
  hora: string;
  servicio: TipoServicio;
  confirmado: boolean;
  recordatorioEnviado: boolean;
  createdAt: Date;
}

export interface SessionData {
  user?: User;
  isAuthenticated: boolean;
}
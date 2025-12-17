// Tipos generados automáticamente por Supabase
// Puedes regenerarlos con: npx supabase gen types typescript --project-id "tu-project-ref" > lib/supabase/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string
          nombre: string
          apellido: string
          celular: string
          created_at: string
        }
        Insert: {
          id?: string
          nombre: string
          apellido: string
          celular: string
          created_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          apellido?: string
          celular?: string
          created_at?: string
        }
      }
      turnos: {
        Row: {
          id: string
          user_id: string
          fecha: string
          hora: string
          confirmado: boolean
          recordatorio_enviado: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          fecha: string
          hora: string
          confirmado?: boolean
          recordatorio_enviado?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          fecha?: string
          hora?: string
          confirmado?: boolean
          recordatorio_enviado?: boolean
          created_at?: string
        }
      }
      barberia: {
        Row: {
          id: string
          nombre: string
          direccion: string
          precio: number
          datos_extra: string
          horarios_disponibles: string[]
          duracion_turno: number
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          direccion: string
          precio: number
          datos_extra: string
          horarios_disponibles: string[]
          duracion_turno?: number
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          direccion?: string
          precio?: number
          datos_extra?: string
          horarios_disponibles?: string[]
          duracion_turno?: number
          updated_at?: string
        }
      }
    }
  }
}
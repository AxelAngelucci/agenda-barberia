import { supabase } from "../supabase/client";
import { Turno } from "../types";

export interface TurnoCompleto {
  id: string;
  fecha: Date;
  hora: string;
  confirmado: boolean;
  recordatorioEnviado: boolean;
  createdAt: Date;
  usuario: {
    id: string;
    nombre: string;
    apellido: string;
    celular: string;
  };
}

/**
 * Crear un nuevo turno
 */
export async function createTurno(turnoData: {
  userId: string;
  barberiaId: string;
  fecha: Date;
  hora: string;
  servicio: string;
}): Promise<Turno | null> {
  try {
    console.log("📅 Intentando crear turno:", {
      userId: turnoData.userId,
      barberiaId: turnoData.barberiaId,
      fecha: turnoData.fecha.toISOString().split("T")[0],
      hora: turnoData.hora,
      servicio: turnoData.servicio,
    });

    const resultado = await supabase
      .from("turnos")
      .insert([
        {
          user_id: turnoData.userId,
          barberia_id: turnoData.barberiaId,
          fecha: turnoData.fecha.toISOString().split("T")[0],
          hora: turnoData.hora,
          servicio: turnoData.servicio,
          confirmado: true,
          recordatorio_enviado: false,
        },
      ])
      .select()
      .single();

    console.log("📦 Respuesta completa de Supabase:", resultado);
    console.log("📦 Tipo de respuesta:", typeof resultado);
    console.log("📦 Keys de la respuesta:", Object.keys(resultado));

    const { data, error } = resultado;

    console.log("✅ Data:", data);
    console.log("❌ Error:", error);
    console.log("❓ Tiene error?", !!error);

    if (error) {
      // Intentar extraer TODAS las propiedades del error
      const errorInfo = {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        // Intentar obtener todas las propiedades
        keys: Object.keys(error),
        values: Object.values(error),
        // Convertir a string
        toString: error.toString?.(),
        // Intentar JSON.stringify con manejo de circular references
        json: (() => {
          try {
            return JSON.stringify(error, null, 2);
          } catch (e) {
            return "No se pudo serializar";
          }
        })(),
      };

      console.error("❌ Error de Supabase al crear turno:");
      console.error("📊 Error info completo:", errorInfo);
      console.error("🔍 Código:", errorInfo.code);
      console.error("📝 Mensaje:", errorInfo.message);
      console.error("📄 Detalles:", errorInfo.details);
      console.error("💡 Hint:", errorInfo.hint);
      console.error("🔑 Keys del error:", errorInfo.keys);
      console.error("📦 Values del error:", errorInfo.values);

      // Mostrar error más descriptivo
      if (error.code === "23505") {
        console.error("💡 El horario ya está ocupado (duplicate key)");
      } else if (error.code === "23503") {
        console.error("💡 El usuario no existe (foreign key violation)");
      } else if (error.code === "42P01") {
        console.error("💡 La tabla no existe - Debes ejecutar el script SQL");
      } else if (error.code === "42501") {
        console.error(
          "💡 Sin permisos - Problema con RLS (Row Level Security)",
        );
      } else if (!error.code) {
        console.error(
          "⚠️ ERROR SIN CÓDIGO - Puede ser un problema de red o timeout",
        );
      }

      return null;
    }

    console.log("✅ Turno creado exitosamente:", data);

    return {
      id: data.id,
      userId: data.user_id,
      barberiaId: data.barberia_id,
      fecha: new Date(data.fecha),
      hora: data.hora,
      servicio: data.servicio as any,
      confirmado: data.confirmado,
      recordatorioEnviado: data.recordatorio_enviado,
      createdAt: new Date(data.created_at),
    };
  } catch (error) {
    console.error("❌ Error catch al crear turno:", error);
    return null;
  }
}

/**
 * Obtener horarios disponibles para una fecha
 */
export async function getHorariosDisponibles(fecha: Date): Promise<string[]> {
  try {
    // Obtener horarios de la configuración
    const { data: barberia } = await supabase
      .from("barberia")
      .select("horarios_disponibles")
      .single();

    const todosLosHorarios = barberia?.horarios_disponibles || [];

    // Obtener turnos ya reservados para esa fecha
    const { data: turnosOcupados } = await supabase
      .from("turnos")
      .select("hora")
      .eq("fecha", fecha.toISOString().split("T")[0]);

    const horasOcupadas = turnosOcupados?.map((t) => t.hora) || [];

    // Filtrar horarios disponibles
    return todosLosHorarios.filter((h) => !horasOcupadas.includes(h));
  } catch (error) {
    console.error("Error al obtener horarios disponibles:", error);
    return [];
  }
}

/**
 * Obtener TODOS los horarios (disponibles y ocupados) para una fecha
 */
export async function getTodosLosHorarios(fecha: Date): Promise<{
  disponibles: string[];
  ocupados: string[];
  todos: string[];
}> {
  try {
    // Obtener horarios de la configuración
    const { data: barberia } = await supabase
      .from("barberia")
      .select("horarios_disponibles")
      .single();

    const todosLosHorarios = barberia?.horarios_disponibles || [];

    // Obtener turnos ya reservados para esa fecha
    const { data: turnosOcupados } = await supabase
      .from("turnos")
      .select("hora")
      .eq("fecha", fecha.toISOString().split("T")[0]);

    // Normalizar formato de horas (quitar segundos si vienen)
    const horasOcupadas =
      turnosOcupados?.map((t) => t.hora.substring(0, 5)) || [];
    const horasDisponibles = todosLosHorarios.filter(
      (h) => !horasOcupadas.includes(h),
    );

    return {
      todos: todosLosHorarios,
      disponibles: horasDisponibles,
      ocupados: horasOcupadas,
    };
  } catch (error) {
    console.error("Error al obtener horarios:", error);
    return {
      todos: [],
      disponibles: [],
      ocupados: [],
    };
  }
}

/**
 * Obtener todos los turnos con información del usuario
 */
export async function getTurnosCompletos(): Promise<TurnoCompleto[]> {
  try {
    const { data, error } = await supabase
      .from("turnos_completos")
      .select("*")
      .order("fecha", { ascending: false })
      .order("hora", { ascending: false });

    if (error) {
      console.error("Error al obtener turnos:", error);
      return [];
    }

    return data.map((t) => ({
      id: t.id,
      fecha: new Date(t.fecha),
      hora: t.hora.substring(0, 5),
      confirmado: t.confirmado,
      recordatorioEnviado: t.recordatorio_enviado,
      createdAt: new Date(t.created_at),
      usuario: {
        id: t.user_id,
        nombre: t.nombre,
        apellido: t.apellido,
        celular: t.celular,
      },
    }));
  } catch (error) {
    console.error("Error al obtener turnos completos:", error);
    return [];
  }
}

/**
 * Obtener turnos de hoy
 */
export async function getTurnosHoy(): Promise<TurnoCompleto[]> {
  try {
    const hoy = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("turnos_completos")
      .select("*")
      .eq("fecha", hoy)
      .order("hora", { ascending: true });

    if (error) {
      console.error("Error al obtener turnos de hoy:", error);
      return [];
    }

    return data.map((t) => ({
      id: t.id,
      fecha: new Date(t.fecha),
      hora: t.hora.substring(0, 5),
      confirmado: t.confirmado,
      recordatorioEnviado: t.recordatorio_enviado,
      createdAt: new Date(t.created_at),
      usuario: {
        id: t.user_id,
        nombre: t.nombre,
        apellido: t.apellido,
        celular: t.celular,
      },
    }));
  } catch (error) {
    console.error("Error al obtener turnos de hoy:", error);
    return [];
  }
}

/**
 * Obtener turnos próximos (siguientes 7 días)
 */
export async function getTurnosProximos(): Promise<TurnoCompleto[]> {
  try {
    const hoy = new Date();
    const en7Dias = new Date();
    en7Dias.setDate(en7Dias.getDate() + 7);

    const { data, error } = await supabase
      .from("turnos_completos")
      .select("*")
      .gte("fecha", hoy.toISOString().split("T")[0])
      .lte("fecha", en7Dias.toISOString().split("T")[0])
      .order("fecha", { ascending: true })
      .order("hora", { ascending: true });

    if (error) {
      console.error("Error al obtener turnos próximos:", error);
      return [];
    }

    return data.map((t) => ({
      id: t.id,
      fecha: new Date(t.fecha),
      hora: t.hora.substring(0, 5),
      confirmado: t.confirmado,
      recordatorioEnviado: t.recordatorio_enviado,
      createdAt: new Date(t.created_at),
      usuario: {
        id: t.user_id,
        nombre: t.nombre,
        apellido: t.apellido,
        celular: t.celular,
      },
    }));
  } catch (error) {
    console.error("Error al obtener turnos próximos:", error);
    return [];
  }
}

/**
 * Marcar recordatorio como enviado
 */
export async function marcarRecordatorioEnviado(
  turnoId: string,
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("turnos")
      .update({ recordatorio_enviado: true })
      .eq("id", turnoId);

    if (error) {
      console.error("Error al marcar recordatorio:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error al marcar recordatorio:", error);
    return false;
  }
}

/**
 * Cancelar turno
 */
export async function cancelarTurno(turnoId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("turnos").delete().eq("id", turnoId);

    if (error) {
      console.error("Error al cancelar turno:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error al cancelar turno:", error);
    return false;
  }
}

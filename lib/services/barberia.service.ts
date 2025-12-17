import { createClient } from '../supabase/client-browser';
import { Barberia } from '../types';

/**
 * Obtener configuración de la barbería
 */
export async function getBarberia(): Promise<Barberia | null> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('No hay usuario autenticado');
      return null;
    }

    const { data, error } = await supabase
      .from('barberias')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !data) {
      console.error('Error al obtener barbería:', error);
      return null;
    }

    return {
      id: data.id,
      nombre: data.nombre,
      direccion: data.direccion,
      precio: Number(data.precio_corte),
      precioCejas: Number(data.precio_cejas || 0),
      precioBarba: Number(data.precio_barba || 0),
      precioColor: Number(data.precio_color || 0),
      precioAlisado: Number(data.precio_alisado || 0),
      precioSemiPermanente: Number(data.precio_semi_permanente || 0),
      servicioColorEnabled: data.servicio_color_enabled || false,
      servicioAlisadoEnabled: data.servicio_alisado_enabled || false,
      servicioSemiPermanenteEnabled: data.servicio_semi_permanente_enabled || false,
      datosExtra: data.datos_extra,
      horariosDisponibles: data.horarios_disponibles,
      duracionTurno: data.duracion_turno
    };
  } catch (error) {
    console.error('Error al obtener barbería:', error);
    return null;
  }
}

/**
 * Actualizar configuración de la barbería
 */
export async function updateBarberia(data: Partial<Barberia>): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('No hay usuario autenticado');
      alert('❌ Error: No hay usuario autenticado. Por favor, inicia sesión nuevamente.');
      return false;
    }

    // Verificar que la barbería existe
    const { data: barberiaExistente, error: errorCheck } = await supabase
      .from('barberias')
      .select('id')
      .eq('id', user.id)
      .single();

    if (errorCheck || !barberiaExistente) {
      console.error('❌ La barbería no existe para este usuario:', errorCheck);
      alert('❌ Error: No se encontró la barbería asociada a tu cuenta.');
      return false;
    }

    const updateData: any = {};

    if (data.nombre) updateData.nombre = data.nombre;
    if (data.direccion) updateData.direccion = data.direccion;
    if (data.precio !== undefined) updateData.precio_corte = data.precio;
    if (data.precioCejas !== undefined) updateData.precio_cejas = data.precioCejas;
    if (data.precioBarba !== undefined) updateData.precio_barba = data.precioBarba;
    if (data.precioColor !== undefined) updateData.precio_color = data.precioColor;
    if (data.precioAlisado !== undefined) updateData.precio_alisado = data.precioAlisado;
    if (data.precioSemiPermanente !== undefined) updateData.precio_semi_permanente = data.precioSemiPermanente;
    if (data.servicioColorEnabled !== undefined) updateData.servicio_color_enabled = data.servicioColorEnabled;
    if (data.servicioAlisadoEnabled !== undefined) updateData.servicio_alisado_enabled = data.servicioAlisadoEnabled;
    if (data.servicioSemiPermanenteEnabled !== undefined) updateData.servicio_semi_permanente_enabled = data.servicioSemiPermanenteEnabled;
    if (data.datosExtra !== undefined) updateData.datos_extra = data.datosExtra;
    if (data.horariosDisponibles) updateData.horarios_disponibles = data.horariosDisponibles;
    if (data.duracionTurno) updateData.duracion_turno = data.duracionTurno;

    updateData.updated_at = new Date().toISOString();

    console.log('💾 Actualizando barbería con datos:', updateData);
    console.log('🔑 Usuario autenticado ID:', user.id);

    const { data: result, error } = await supabase
      .from('barberias')
      .update(updateData)
      .eq('id', user.id)
      .select();

    console.log('📊 Resultado de la actualización:', { result, error });

    if (error) {
      console.error('❌ Error detallado al actualizar barbería:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        fullError: error
      });

      // Si el error es por columnas faltantes, informar al usuario
      if (error.message?.includes('precio_cejas') || error.message?.includes('precio_barba')) {
        alert('⚠️ Error: Debes ejecutar el script de migración SQL en Supabase primero.\n\nAbre el archivo supabase/migration_servicios.sql y ejecútalo en el SQL Editor de Supabase.');
      }

      return false;
    }

    console.log('✅ Barbería actualizada exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error catch al actualizar barbería:', error);
    return false;
  }
}
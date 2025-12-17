import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

// Endpoint para ver todos los turnos
export async function GET() {
  try {
    const { data: turnos, error } = await supabase
      .from('turnos')
      .select(`
        *,
        usuarios (*)
      `)
      .order('fecha', { ascending: true })
      .order('hora', { ascending: true });

    if (error) {
      return NextResponse.json({
        error: error,
        mensaje: 'Error al obtener turnos'
      }, { status: 500 });
    }

    return NextResponse.json({
      total: turnos?.length || 0,
      turnos: turnos
    });

  } catch (error: any) {
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}

// DELETE para limpiar todos los turnos de prueba
export async function DELETE() {
  try {
    const { error } = await supabase
      .from('turnos')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Elimina todos

    if (error) {
      return NextResponse.json({
        error: error,
        mensaje: 'Error al eliminar turnos'
      }, { status: 500 });
    }

    return NextResponse.json({
      exito: true,
      mensaje: '✅ Todos los turnos han sido eliminados'
    });

  } catch (error: any) {
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}
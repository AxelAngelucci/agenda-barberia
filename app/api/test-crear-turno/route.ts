import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

// Endpoint de prueba para crear un turno directamente
export async function GET() {
  try {
    console.log('🧪 Test: Intentando crear turno de prueba...');

    // Primero, crear un usuario de prueba
    const testUser = {
      nombre: 'Test',
      apellido: 'Usuario',
      celular: `test${Date.now()}`
    };

    const { data: usuario, error: errorUsuario } = await supabase
      .from('usuarios')
      .insert([testUser])
      .select()
      .single();

    if (errorUsuario) {
      return NextResponse.json({
        paso: 'crear_usuario',
        error: errorUsuario,
        mensaje: 'Error al crear usuario de prueba',
        codigo: errorUsuario.code,
        detalles: errorUsuario.details,
        hint: errorUsuario.hint
      }, { status: 500 });
    }

    console.log('✅ Usuario de prueba creado:', usuario);

    // Ahora intentar crear un turno
    const fechaPrueba = new Date();
    fechaPrueba.setDate(fechaPrueba.getDate() + 1); // Mañana

    const turnoData = {
      user_id: usuario.id,
      fecha: fechaPrueba.toISOString().split('T')[0],
      hora: '15:00',
      confirmado: true,
      recordatorio_enviado: false
    };

    console.log('📅 Datos del turno a insertar:', turnoData);

    const { data: turno, error: errorTurno } = await supabase
      .from('turnos')
      .insert([turnoData])
      .select()
      .single();

    if (errorTurno) {
      console.error('❌ Error al crear turno:', errorTurno);
      return NextResponse.json({
        paso: 'crear_turno',
        usuario_creado: usuario,
        turno_datos: turnoData,
        error: {
          code: errorTurno.code,
          message: errorTurno.message,
          details: errorTurno.details,
          hint: errorTurno.hint,
          completo: errorTurno
        }
      }, { status: 500 });
    }

    console.log('✅ Turno creado exitosamente:', turno);

    return NextResponse.json({
      exito: true,
      mensaje: '✅ Test completado exitosamente',
      usuario: usuario,
      turno: turno
    });

  } catch (error: any) {
    console.error('❌ Error catch en test:', error);
    return NextResponse.json({
      error: 'Error general en el test',
      mensaje: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
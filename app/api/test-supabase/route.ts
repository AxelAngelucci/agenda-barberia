import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

// Endpoint para probar la conexión con Supabase
export async function GET() {
  try {
    const results: any = {
      conexion: '❓ Probando...',
      tablas: {},
      errores: []
    };

    // Test 1: Verificar conexión básica
    try {
      const { error } = await supabase.from('barberia').select('count');
      if (error) {
        results.conexion = '❌ Error de conexión';
        results.errores.push({
          tipo: 'Conexión',
          error: error.message,
          code: error.code
        });
      } else {
        results.conexion = '✅ Conectado correctamente';
      }
    } catch (e: any) {
      results.conexion = '❌ Error al conectar';
      results.errores.push({
        tipo: 'Conexión catch',
        error: e.message
      });
    }

    // Test 2: Verificar tabla usuarios
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('count')
        .limit(1);

      if (error) {
        results.tablas.usuarios = `❌ Error: ${error.message}`;
        if (error.code === '42P01') {
          results.tablas.usuarios = '❌ La tabla NO existe - Ejecuta el script SQL';
        }
      } else {
        results.tablas.usuarios = '✅ Existe';
      }
    } catch (e: any) {
      results.tablas.usuarios = `❌ Error: ${e.message}`;
    }

    // Test 3: Verificar tabla turnos
    try {
      const { data, error } = await supabase
        .from('turnos')
        .select('count')
        .limit(1);

      if (error) {
        results.tablas.turnos = `❌ Error: ${error.message}`;
        if (error.code === '42P01') {
          results.tablas.turnos = '❌ La tabla NO existe - Ejecuta el script SQL';
        }
      } else {
        results.tablas.turnos = '✅ Existe';
      }
    } catch (e: any) {
      results.tablas.turnos = `❌ Error: ${e.message}`;
    }

    // Test 4: Verificar tabla barberia
    try {
      const { data, error } = await supabase
        .from('barberia')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        results.tablas.barberia = `❌ Error: ${error.message}`;
        if (error.code === '42P01') {
          results.tablas.barberia = '❌ La tabla NO existe - Ejecuta el script SQL';
        } else if (error.code === 'PGRST116') {
          results.tablas.barberia = '⚠️ Tabla existe pero está vacía - Ejecuta el script SQL completo';
        }
      } else {
        results.tablas.barberia = '✅ Existe y tiene datos';
        results.barberiaData = data;
      }
    } catch (e: any) {
      results.tablas.barberia = `❌ Error: ${e.message}`;
    }

    // Diagnóstico final
    const todasLasTablas = Object.values(results.tablas).every(v =>
      typeof v === 'string' && v.startsWith('✅')
    );

    if (!todasLasTablas) {
      results.diagnostico = '❌ PROBLEMA: Las tablas no existen o están incompletas';
      results.solucion = 'Debes ejecutar el script SQL en Supabase (archivo: supabase/schema.sql)';
      results.pasos = [
        '1. Ve a https://supabase.com/dashboard/project/hfleyonesllioqczrfvz/sql',
        '2. Haz clic en "New query"',
        '3. Copia TODO el contenido de supabase/schema.sql',
        '4. Pega en el editor y haz clic en "Run"'
      ];
    } else {
      results.diagnostico = '✅ TODO CORRECTO: Las tablas existen y están configuradas';
    }

    return NextResponse.json(results, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({
      error: 'Error general',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Verificar si las credenciales están configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ ADVERTENCIA: Faltan las credenciales de Supabase');
  console.error('');
  console.error('📖 Para configurar Supabase, sigue estos pasos:');
  console.error('   1. Abre el archivo: INICIO_RAPIDO.md');
  console.error('   2. Sigue las instrucciones (solo 5 minutos)');
  console.error('');
  console.error('💡 O crea el archivo .env.local con:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL=tu_url_aqui');
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key_aqui');
  console.error('');

  throw new Error(
    '❌ Faltan las credenciales de Supabase. ' +
    'Lee el archivo INICIO_RAPIDO.md para configurar en 5 minutos. ' +
    'O configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
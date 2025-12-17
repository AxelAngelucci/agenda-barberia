import { supabase } from '../supabase/client';
import { User } from '../types';

/**
 * Crear o actualizar usuario
 */
export async function createOrUpdateUser(userData: {
  nombre: string;
  apellido: string;
  celular: string;
}): Promise<User | null> {
  try {
    console.log('👤 Intentando crear/actualizar usuario:', userData);

    // Primero verificar si el usuario ya existe por celular
    const { data: existingUser, error: searchError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('celular', userData.celular)
      .single();

    if (searchError && searchError.code !== 'PGRST116') {
      console.error('❌ Error al buscar usuario:', searchError);
    }

    if (existingUser) {
      console.log('✅ Usuario ya existe, actualizando:', existingUser.id);
      // Si existe, actualizar datos
      const { data, error } = await supabase
        .from('usuarios')
        .update({
          nombre: userData.nombre,
          apellido: userData.apellido
        })
        .eq('celular', userData.celular)
        .select()
        .single();

      if (error) {
        console.error('❌ Error al actualizar usuario:', error);
        throw error;
      }

      console.log('✅ Usuario actualizado exitosamente:', data);

      return {
        id: data.id,
        nombre: data.nombre,
        apellido: data.apellido,
        celular: data.celular,
        createdAt: new Date(data.created_at)
      };
    }

    // Si no existe, crear nuevo usuario
    console.log('📝 Creando nuevo usuario...');
    const { data, error } = await supabase
      .from('usuarios')
      .insert([userData])
      .select()
      .single();

    if (error) {
      console.error('❌ Error al crear nuevo usuario:', error);
      console.error('Error JSON:', JSON.stringify(error, null, 2));
      throw error;
    }

    console.log('✅ Usuario creado exitosamente:', data);

    return {
      id: data.id,
      nombre: data.nombre,
      apellido: data.apellido,
      celular: data.celular,
      createdAt: new Date(data.created_at)
    };
  } catch (error) {
    console.error('❌ Error catch al crear/actualizar usuario:', error);
    return null;
  }
}

/**
 * Obtener usuario por celular
 */
export async function getUserByPhone(celular: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('celular', celular)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      nombre: data.nombre,
      apellido: data.apellido,
      celular: data.celular,
      createdAt: new Date(data.created_at)
    };
  } catch (error) {
    console.error('Error al buscar usuario:', error);
    return null;
  }
}
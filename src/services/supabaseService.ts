
import { createClient } from '@supabase/supabase-js';
import type { Jugador } from './futbolDataService';

// Initialize Supabase client with the actual project URL and key from environment
const supabaseUrl = 'https://fqsdisrsrqmizuadvobe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxc2Rpc3JzcnFtaXp1YWR2b2JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzOTAzMjEsImV4cCI6MjA1Njk2NjMyMX0.gWWsLa_l3Xw3vhn06KDKLx0ot3BlcWi0PQ9gpb-jKCs';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Function to store football players in Supabase
export const storeJugadoresInSupabase = async (jugadores: Jugador[]): Promise<{ success: boolean; error?: string }> => {
  try {
    // First, check if table exists
    const { error: tableError } = await supabase
      .from('jugadores')
      .select('id')
      .limit(1);

    // If table doesn't exist yet, we'll get an error
    if (tableError) {
      console.log('Table may not exist yet, attempting to create it...');
      // We can't create tables via the JS client, so we'll handle this with user instructions
    }

    // We'll use upsert to handle both insert and update
    const { error } = await supabase
      .from('jugadores')
      .upsert(
        jugadores.map(j => ({
          id: j.id,
          nombre: j.nombre,
          equipo: j.equipo,
          categoria: j.categoria,
          goles: j.goles,
          partidosJugados: j.partidosJugados || 0,
          fechaNacimiento: j.fechaNacimiento || null,
          lastUpdated: new Date().toISOString()
        })),
        { onConflict: 'id' }
      );

    if (error) {
      console.error('Error storing data in Supabase:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error storing data in Supabase:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error storing data'
    };
  }
};

// Function to get football players from Supabase
export const getJugadoresFromSupabase = async (): Promise<{ jugadores: Jugador[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('jugadores')
      .select('*')
      .order('goles', { ascending: false });

    if (error) {
      console.error('Error fetching data from Supabase:', error);
      return { jugadores: [], error: error.message };
    }

    return { jugadores: data as Jugador[] };
  } catch (error) {
    console.error('Unexpected error fetching data from Supabase:', error);
    return { 
      jugadores: [], 
      error: error instanceof Error ? error.message : 'Unknown error fetching data'
    };
  }
};

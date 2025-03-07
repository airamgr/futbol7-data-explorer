
import { useState } from 'react';
import { 
  extraerTodosLosDatos, 
  Jugador, 
  verificarBackendDisponible
} from '@/services/futbolDataService';
import { 
  storeJugadoresInSupabase, 
  getJugadoresFromSupabase 
} from '@/services/supabaseService';
import { useToast } from '@/components/ui/use-toast';

export const usePlayerData = (auth: { username: string; password: string } | null) => {
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intentos, setIntentos] = useState(0);
  const [dataSource, setDataSource] = useState<'supabase' | 'backend' | null>(null);
  const { toast } = useToast();

  const obtenerDatosDesdeBackend = async (credentials: { username: string; password: string }) => {
    try {
      // Extraemos datos del backend
      const result = await extraerTodosLosDatos(credentials);
      
      if (result.length === 0) {
        throw new Error('No se pudieron extraer datos. La respuesta está vacía.');
      }
      
      // Guardamos los datos en Supabase
      const storeResult = await storeJugadoresInSupabase(result);
      
      if (storeResult.success) {
        toast({
          title: 'Datos guardados en Supabase',
          description: `Se han guardado ${result.length} jugadores en la base de datos`,
        });
      } else {
        toast({
          title: 'Error al guardar en Supabase',
          description: storeResult.error || 'No se pudieron guardar los datos en Supabase',
          variant: 'destructive',
        });
      }
      
      setJugadores(result);
      setDataSource('backend');
      
      toast({
        title: 'Datos cargados correctamente',
        description: `Se han encontrado ${result.length} jugadores`,
      });
      
      console.log(`Datos cargados correctamente desde backend: ${result.length} jugadores`);
      
      return result;
    } catch (error) {
      console.error('Error al obtener datos desde backend:', error);
      
      // Mensaje personalizado para errores 500
      if (error instanceof Error && error.message.includes('500')) {
        throw new Error('Error en el servidor Python (500): Hay un problema al extraer los datos. Verifica los logs del servidor Python para más detalles.');
      }
      
      throw error;
    }
  };

  const actualizarDatosDesdeBackend = async (credentials: { username: string; password: string }) => {
    try {
      console.log('Actualizando datos desde el backend en segundo plano...');
      
      // Extraemos datos del backend
      const result = await extraerTodosLosDatos(credentials);
      
      if (result.length === 0) {
        console.error('La actualización desde backend no devolvió datos');
        return;
      }
      
      // Guardamos los datos en Supabase
      const storeResult = await storeJugadoresInSupabase(result);
      
      if (storeResult.success) {
        console.log(`Datos actualizados correctamente: ${result.length} jugadores`);
        
        // Actualizamos los datos en la UI
        setJugadores(result);
        setDataSource('backend');
        
        toast({
          title: 'Datos actualizados',
          description: `Se han actualizado ${result.length} jugadores en la base de datos`,
        });
      } else {
        console.error('Error al guardar datos actualizados en Supabase:', storeResult.error);
      }
    } catch (error) {
      console.error('Error al actualizar datos desde backend:', error);
      // No mostramos error al usuario ya que es una actualización en segundo plano
    }
  };

  const cargarDatos = async () => {
    if (!auth) {
      setError('Se requiere autenticación para cargar datos');
      toast({
        title: 'Error',
        description: 'Se requiere autenticación para cargar datos',
        variant: 'destructive',
      });
      return [];
    }

    setIsLoading(true);
    setError(null);
    setIntentos(prev => prev + 1);
    
    try {
      // Primero intentamos cargar datos desde Supabase
      const supabaseResult = await getJugadoresFromSupabase();
      
      if (supabaseResult.jugadores.length > 0) {
        setJugadores(supabaseResult.jugadores);
        setDataSource('supabase');
        
        toast({
          title: 'Datos cargados desde Supabase',
          description: `Se han encontrado ${supabaseResult.jugadores.length} jugadores en la base de datos`,
        });
        
        console.log(`Datos cargados desde Supabase: ${supabaseResult.jugadores.length} jugadores`);
        
        // Verificamos si el backend está disponible para actualizar los datos
        const disponible = await verificarBackendDisponible();
        
        if (disponible) {
          // Si el backend está disponible, intentamos actualizar los datos en segundo plano
          toast({
            title: 'Actualizando datos',
            description: 'Obteniendo datos actualizados del servidor...',
          });
          
          actualizarDatosDesdeBackend(auth);
        }
        
        return supabaseResult.jugadores;
      }
      
      // Si no hay datos en Supabase, intentamos cargar desde el backend
      const disponible = await verificarBackendDisponible();
      
      if (disponible) {
        try {
          const players = await obtenerDatosDesdeBackend(auth);
          return players;
        } catch (error) {
          if (error instanceof Error && error.message.includes('500')) {
            throw new Error('Error en el servidor Python (500): El servidor devolvió un error interno. Revisa los logs del servidor para ver detalles del error.');
          }
          throw error;
        }
      } else {
        throw new Error('No hay datos disponibles en Supabase y el backend no está disponible');
      }
      
    } catch (error) {
      console.error('Error general al cargar datos:', error);
      let message = 'Error al cargar los datos';
      
      if (error instanceof Error) {
        message = error.message;
      }
      
      setError(message);
      
      toast({
        title: 'Error de conexión',
        description: `${message}. Revisa los logs del servidor Python para más detalles.`,
        variant: 'destructive',
      });
      
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    jugadores,
    isLoading,
    error,
    cargarDatos,
    dataSource
  };
};

export default usePlayerData;

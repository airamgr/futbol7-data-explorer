
import { useState } from 'react';
import { 
  Jugador,
  cargarArchivoExcel
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
  const [dataSource, setDataSource] = useState<'supabase' | 'excel' | null>(null);
  const { toast } = useToast();

  // Nueva función para cargar datos desde un archivo Excel
  const cargarDatosDesdeExcel = async (
    file: File, 
    credentials: { username: string; password: string }
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulamos el procesamiento del archivo Excel
      // En un entorno real, deberíamos usar una biblioteca para procesar el Excel
      console.log(`Procesando archivo Excel: ${file.name}`);
      
      // Extraemos datos del archivo usando la función modificada
      const result = await cargarArchivoExcel(file, credentials);
      
      if (result.length === 0) {
        throw new Error('No se pudieron extraer datos del Excel. El archivo no contiene jugadores.');
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
      setDataSource('excel');
      
      toast({
        title: 'Excel procesado correctamente',
        description: `Se han encontrado ${result.length} jugadores en el archivo`,
      });
      
      console.log(`Datos cargados correctamente desde Excel: ${result.length} jugadores`);
      
      return result;
    } catch (error) {
      console.error('Error al procesar archivo Excel:', error);
      
      let message = 'Error al procesar el archivo Excel';
      if (error instanceof Error) {
        message = error.message;
      }
      
      setError(message);
      
      toast({
        title: 'Error al procesar Excel',
        description: message,
        variant: 'destructive',
      });
      
      throw error;
    } finally {
      setIsLoading(false);
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
    
    try {
      // Intentamos cargar datos desde Supabase
      const supabaseResult = await getJugadoresFromSupabase();
      
      if (supabaseResult.jugadores.length > 0) {
        setJugadores(supabaseResult.jugadores);
        setDataSource('supabase');
        
        toast({
          title: 'Datos cargados desde Supabase',
          description: `Se han encontrado ${supabaseResult.jugadores.length} jugadores en la base de datos`,
        });
        
        console.log(`Datos cargados desde Supabase: ${supabaseResult.jugadores.length} jugadores`);
        return supabaseResult.jugadores;
      } else {
        toast({
          title: 'No hay datos disponibles',
          description: 'No hay datos almacenados. Por favor, cargue un archivo Excel.',
        });
        return [];
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
        description: message,
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
    cargarDatosDesdeExcel,
    dataSource
  };
};

export default usePlayerData;

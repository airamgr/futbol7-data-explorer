
import { useState } from 'react';
import { 
  Jugador,
  cargarArchivoExcel
} from '@/services/futbolDataService';
import { useToast } from '@/components/ui/use-toast';
import * as XLSX from 'xlsx'; // Import XLSX directly

export const usePlayerData = (auth: { username: string; password: string } | null) => {
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [dataSource, setDataSource] = useState<'supabase' | 'excel' | null>(null);
  const { toast } = useToast();

  // Función para cargar datos desde un archivo Excel
  const cargarDatosDesdeExcel = async (
    file: File, 
    credentials?: { username: string; password: string }
  ) => {
    if (!credentials && !auth) {
      const errorMsg = 'Se requiere autenticación para cargar datos';
      setError(errorMsg);
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
      return Promise.reject(new Error(errorMsg));
    }
    
    const authToUse = credentials || auth;
    
    if (!authToUse) {
      const errorMsg = 'Credenciales no disponibles';
      setError(errorMsg);
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
      return Promise.reject(new Error(errorMsg));
    }

    try {
      setIsLoading(true);
      setError(null);
      setDebugInfo([]);
      
      // Recopilando información sobre el archivo
      const debugMessages = [
        `Tipo de archivo: ${file.type}`,
        `Tamaño: ${(file.size / 1024).toFixed(1)} KB`,
        `Nombre: ${file.name}`
      ];
      
      setDebugInfo(debugMessages);
      
      // Procesamos el archivo Excel
      console.log(`Iniciando procesamiento de Excel: ${file.name} (${file.size} bytes, tipo: ${file.type})`);
      
      // Configuración para capturar mensajes de depuración
      const handleDebugInfo = (message: string) => {
        debugMessages.push(message);
        setDebugInfo([...debugMessages]);
      };
      
      const result = await cargarArchivoExcel(file, authToUse, handleDebugInfo);
      
      if (result.length === 0) {
        handleDebugInfo("No se encontraron jugadores en el archivo");
        throw new Error('No se pudieron extraer datos del Excel. El archivo no contiene jugadores.');
      }
      
      setJugadores(result);
      setDataSource('excel');
      handleDebugInfo(`Procesado correctamente: ${result.length} jugadores encontrados`);
      
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

  // Función para cargar datos (placeholder)
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
      // Este es un método placeholder para simular la carga de datos
      // Ya que no necesitamos la funcionalidad de backend
      setJugadores([]);
      toast({
        title: 'No hay datos disponibles',
        description: 'Por favor, cargue un archivo Excel.',
      });
      return [];
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
    debugInfo,
    cargarDatos,
    cargarDatosDesdeExcel,
    dataSource
  };
};

export default usePlayerData;

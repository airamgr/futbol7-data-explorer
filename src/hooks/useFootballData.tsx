
import { useState, useEffect } from 'react';
import { 
  extraerTodosLosDatos, 
  filtrarJugadores, 
  Jugador, 
  FiltroJugadores 
} from '@/services/futbolDataService';
import { useToast } from '@/components/ui/use-toast';

interface UseFootballDataProps {
  auth: { username: string; password: string } | null;
}

export const useFootballData = ({ auth }: UseFootballDataProps) => {
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [filteredJugadores, setFilteredJugadores] = useState<Jugador[]>([]);
  const [filtros, setFiltros] = useState<FiltroJugadores>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intentos, setIntentos] = useState(0);
  const { toast } = useToast();

  // Carga inicial de datos
  useEffect(() => {
    if (auth) {
      cargarDatos();
    }
  }, [auth]);

  // Aplicar filtros cuando cambian los filtros o los jugadores
  useEffect(() => {
    if (jugadores.length > 0) {
      setFilteredJugadores(filtrarJugadores(jugadores, filtros));
    }
  }, [jugadores, filtros]);

  const cargarDatos = async () => {
    if (!auth) {
      setError('Se requiere autenticación para cargar datos');
      toast({
        title: 'Error',
        description: 'Se requiere autenticación para cargar datos',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setIntentos(prev => prev + 1);

    try {
      // Aseguramos que estamos usando exactamente las credenciales requeridas
      const credenciales = {
        username: 'CE4032',
        password: '9525'
      };
      
      console.log(`Intento #${intentos + 1} - Cargando datos con credenciales: ${credenciales.username}`);
      
      const result = await extraerTodosLosDatos(credenciales);
      
      if (result.length === 0) {
        throw new Error('No se pudieron extraer datos. La respuesta está vacía.');
      }
      
      setJugadores(result);
      setFilteredJugadores(result);
      
      toast({
        title: 'Datos cargados correctamente',
        description: `Se han encontrado ${result.length} jugadores`,
      });
      
      console.log(`Datos cargados correctamente: ${result.length} jugadores`);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      let message = 'Error al cargar los datos';
      
      if (error instanceof Error) {
        message = error.message;
      }
      
      setError(message);
      
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      
      // Si es el primer intento, reintentamos automáticamente una vez
      if (intentos <= 1) {
        console.log('Reintentando automáticamente...');
        setTimeout(() => {
          cargarDatos();
        }, 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const actualizarFiltros = (nuevosFiltros: FiltroJugadores) => {
    setFiltros(prev => ({
      ...prev,
      ...nuevosFiltros
    }));
  };

  const resetearFiltros = () => {
    setFiltros({});
  };

  return {
    jugadores: filteredJugadores,
    isLoading,
    error,
    filtros,
    actualizarFiltros,
    resetearFiltros,
    cargarDatos,
    usandoDatosFallback: false // Siempre es false porque ya no usamos datos fallback
  };
};

export default useFootballData;

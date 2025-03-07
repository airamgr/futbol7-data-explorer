
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
  const [usandoDatosFallback, setUsandoDatosFallback] = useState(false);
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
    setUsandoDatosFallback(false);

    try {
      // Usamos las credenciales proporcionadas
      const credenciales = {
        username: auth.username || 'CE4032', // Usuario por defecto
        password: auth.password || '9525'    // Contraseña por defecto
      };
      
      console.log('Cargando datos con credenciales:', credenciales.username);
      
      const result = await extraerTodosLosDatos(credenciales);
      
      // Verificamos si estamos usando datos simulados
      const sonDatosSimulados = result.length > 0 && result[0].id.startsWith('simulado-');
      setUsandoDatosFallback(sonDatosSimulados);
      
      setJugadores(result);
      setFilteredJugadores(result);
      
      // Mensaje de éxito diferente según el origen de los datos
      if (sonDatosSimulados) {
        toast({
          title: 'Usando datos simulados',
          description: `No se pudieron extraer datos reales. Mostrando ${result.length} jugadores simulados.`,
          variant: 'default',
        });
      } else {
        toast({
          title: 'Datos cargados correctamente',
          description: `Se han encontrado ${result.length} jugadores`,
        });
      }
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
    usandoDatosFallback
  };
};

export default useFootballData;

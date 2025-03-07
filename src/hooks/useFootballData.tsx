
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
    setIntentos(prev => prev + 1);
    setUsandoDatosFallback(false);

    try {
      // Verificamos y forzamos las credenciales correctas
      const credenciales = {
        username: 'CE4032',
        password: '9525'
      };
      
      console.log(`Intento #${intentos + 1} - Verificando conexión a internet...`);
      
      // Verificamos la conectividad a internet primero
      try {
        const connectionTest = await fetch('https://www.google.com', { 
          method: 'HEAD',
          // Agregamos un timestamp para evitar caché
          cache: 'no-store',
          mode: 'no-cors'
        });
        console.log('Conectividad a internet: OK');
      } catch (connError) {
        console.error('Error de conectividad a internet:', connError);
        throw new Error('No hay conexión a internet. Verifica tu conexión y vuelve a intentarlo.');
      }
      
      console.log(`Cargando datos con credenciales: Usuario=${credenciales.username}, Contraseña=${credenciales.password}`);
      
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
        title: 'Error de conexión',
        description: `${message}. Verifique que las credenciales (CE4032/9525) sean correctas y que tenga conexión a internet.`,
        variant: 'destructive',
      });
      
      // Si es el primer o segundo intento, reintentamos automáticamente
      if (intentos <= 2) {
        console.log(`Reintentando automáticamente (intento ${intentos + 1} de 3)...`);
        setTimeout(() => {
          cargarDatos();
        }, 3000);
      } else {
        console.log('Número máximo de intentos alcanzado');
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
    usandoDatosFallback
  };
};

export default useFootballData;

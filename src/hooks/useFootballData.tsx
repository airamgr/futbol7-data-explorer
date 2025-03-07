
import { useState, useEffect } from 'react';
import { 
  extraerTodosLosDatos, 
  filtrarJugadores, 
  Jugador, 
  FiltroJugadores,
  generarDatosFallback
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
      // Intentar cargar datos desde sessionStorage primero
      const cachedData = sessionStorage.getItem('futbol7-cached-data');
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          setJugadores(parsed);
          setFilteredJugadores(parsed);
          console.log('Datos cargados desde caché local:', parsed.length);
        } catch (e) {
          console.error('Error al cargar datos en caché:', e);
          cargarDatos();
        }
      } else {
        cargarDatos();
      }
    }
  }, [auth]);

  // Aplicar filtros cuando cambian los filtros o los jugadores
  useEffect(() => {
    if (jugadores.length > 0) {
      setFilteredJugadores(filtrarJugadores(jugadores, filtros));
    }
  }, [jugadores, filtros]);

  // Función para verificar la conectividad básica a Internet
  const verificarConectividad = async (): Promise<boolean> => {
    try {
      // Intentamos con varias URLs para mayor confiabilidad
      const urlsVerificacion = [
        'https://www.google.com',
        'https://www.cloudflare.com',
        'https://www.apple.com'
      ];
      
      for (const url of urlsVerificacion) {
        try {
          const response = await fetch(url, { 
            method: 'HEAD', 
            mode: 'no-cors',
            cache: 'no-store',
            // Timeout de 5 segundos
            signal: AbortSignal.timeout(5000)
          });
          console.log(`Conectividad verificada con ${url}`);
          return true;
        } catch (err) {
          console.warn(`Fallo verificando con ${url}:`, err);
          // Continuamos con la siguiente URL
        }
      }
      
      // Si llegamos aquí, todas las pruebas fallaron
      return false;
    } catch (error) {
      console.error("Error al verificar conectividad:", error);
      return false;
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
      return;
    }

    setIsLoading(true);
    setError(null);
    setIntentos(prev => prev + 1);
    
    try {
      // Verificamos y forzamos las credenciales correctas
      const credenciales = {
        username: 'CE4032',
        password: '9525'
      };
      
      console.log(`Intento #${intentos + 1} - Verificando conexión a internet...`);
      
      // Verificamos la conectividad a internet primero
      const conectividadOK = await verificarConectividad();
      
      if (!conectividadOK) {
        throw new Error('No se detecta conexión a internet. Verifica tu conectividad y vuelve a intentarlo.');
      }
      
      console.log('Conectividad a internet: OK');
      console.log(`Cargando datos con credenciales: Usuario=${credenciales.username}, Contraseña=${credenciales.password}`);
      
      // Intentar extraer datos reales
      try {
        const result = await extraerTodosLosDatos(credenciales);
        
        if (result.length === 0) {
          throw new Error('No se pudieron extraer datos. La respuesta está vacía.');
        }
        
        // Guardar en caché si hay datos
        sessionStorage.setItem('futbol7-cached-data', JSON.stringify(result));
        
        setJugadores(result);
        setFilteredJugadores(result);
        setUsandoDatosFallback(false);
        
        toast({
          title: 'Datos cargados correctamente',
          description: `Se han encontrado ${result.length} jugadores`,
        });
        
        console.log(`Datos cargados correctamente: ${result.length} jugadores`);
      } catch (dataError) {
        console.error('Error al extraer datos reales:', dataError);
        
        // Verificar si hay datos en caché
        const cachedData = sessionStorage.getItem('futbol7-cached-data');
        if (cachedData) {
          try {
            const parsed = JSON.parse(cachedData);
            if (parsed.length > 0) {
              setJugadores(parsed);
              setFilteredJugadores(parsed);
              setUsandoDatosFallback(false);
              
              toast({
                title: 'Usando datos en caché',
                description: `No se pudieron obtener datos nuevos. Usando ${parsed.length} registros en caché.`,
              });
              
              console.log(`Usando datos en caché: ${parsed.length} jugadores`);
              return;
            }
          } catch (e) {
            console.error('Error al parsear datos en caché:', e);
          }
        }
        
        // Si no hay caché o está vacía, usar datos fallback
        const datosFallback = generarDatosFallback();
        setJugadores(datosFallback);
        setFilteredJugadores(datosFallback);
        setUsandoDatosFallback(true);
        
        let message = 'Error al cargar los datos';
        if (dataError instanceof Error) {
          message = dataError.message;
        }
        
        setError(message);
        
        toast({
          title: 'Usando datos simulados',
          description: `${message}. Se están mostrando datos simulados para demostración.`,
          variant: 'destructive',
        });
        
        console.log(`Usando datos fallback: ${datosFallback.length} jugadores simulados`);
      }
    } catch (error) {
      console.error('Error general al cargar datos:', error);
      let message = 'Error al cargar los datos';
      
      if (error instanceof Error) {
        message = error.message;
      }
      
      setError(message);
      
      // Usar datos fallback como último recurso
      const datosFallback = generarDatosFallback();
      setJugadores(datosFallback);
      setFilteredJugadores(datosFallback);
      setUsandoDatosFallback(true);
      
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

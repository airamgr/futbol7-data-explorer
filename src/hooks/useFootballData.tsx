
import { useEffect } from 'react';
import { Jugador, FiltroJugadores } from '@/services/futbolDataService';
import useBackendAvailability from './useBackendAvailability';
import useFilteredPlayers from './useFilteredPlayers';
import usePlayerData from './usePlayerData';

interface UseFootballDataProps {
  auth: { username: string; password: string } | null;
}

export const useFootballData = ({ auth }: UseFootballDataProps) => {
  const { backendDisponible } = useBackendAvailability();
  const { 
    jugadores, 
    isLoading, 
    error, 
    cargarDatos, 
    cargarDatosDesdeExcel, 
    dataSource 
  } = usePlayerData(auth);
  const { filteredJugadores, filtros, actualizarFiltros, resetearFiltros } = useFilteredPlayers(jugadores);

  // Carga inicial de datos
  useEffect(() => {
    if (auth) {
      cargarDatos();
    }
  }, [auth]);

  // Función para cargar datos desde un archivo Excel
  const handleExcelUpload = async (file: File) => {
    if (!auth) return;
    return await cargarDatosDesdeExcel(file, auth);
  };

  return {
    jugadores: filteredJugadores,
    isLoading,
    error,
    filtros,
    actualizarFiltros,
    resetearFiltros,
    cargarDatos,
    cargarDatosDesdeExcel: handleExcelUpload,
    dataSource,
    backendDisponible
  };
};

export default useFootballData;

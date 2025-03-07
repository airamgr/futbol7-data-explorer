
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
  const { jugadores, isLoading, error, cargarDatos, dataSource } = usePlayerData(auth);
  const { filteredJugadores, filtros, actualizarFiltros, resetearFiltros } = useFilteredPlayers(jugadores);

  // Carga inicial de datos
  useEffect(() => {
    if (auth) {
      cargarDatos();
    }
  }, [auth]);

  return {
    jugadores: filteredJugadores,
    isLoading,
    error,
    filtros,
    actualizarFiltros,
    resetearFiltros,
    cargarDatos,
    dataSource,
    backendDisponible
  };
};

export default useFootballData;

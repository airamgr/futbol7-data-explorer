
import { useState, useEffect } from 'react';
import { Jugador, FiltroJugadores, filtrarJugadores } from '@/services/futbolDataService';

export const useFilteredPlayers = (jugadores: Jugador[]) => {
  const [filtros, setFiltros] = useState<FiltroJugadores>({});
  const [filteredJugadores, setFilteredJugadores] = useState<Jugador[]>([]);

  // Aplicar filtros cuando cambian los filtros o los jugadores
  useEffect(() => {
    if (jugadores.length > 0) {
      setFilteredJugadores(filtrarJugadores(jugadores, filtros));
    } else {
      setFilteredJugadores([]);
    }
  }, [jugadores, filtros]);

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
    filteredJugadores,
    filtros,
    actualizarFiltros,
    resetearFiltros
  };
};

export default useFilteredPlayers;

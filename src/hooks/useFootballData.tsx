
import { useEffect, useState } from 'react';
import { Jugador, FiltroJugadores } from '@/services/futbolDataService';
import useBackendAvailability from './useBackendAvailability';
import useFilteredPlayers from './useFilteredPlayers';
import usePlayerData from './usePlayerData';
import { useToast } from '@/components/ui/use-toast';

interface UseFootballDataProps {
  auth: { username: string; password: string } | null;
}

export const useFootballData = ({ auth }: UseFootballDataProps) => {
  const { backendDisponible } = useBackendAvailability();
  const [showExcelUploader, setShowExcelUploader] = useState(true);
  const { toast } = useToast();
  
  const { 
    jugadores, 
    isLoading, 
    error, 
    cargarDatos, 
    cargarDatosDesdeExcel, 
    dataSource 
  } = usePlayerData(auth);
  
  const { filteredJugadores, filtros, actualizarFiltros, resetearFiltros } = useFilteredPlayers(jugadores);

  useEffect(() => {
    if (auth && !showExcelUploader) {
      // Cargamos datos automáticamente solo si no estamos mostrando el uploader
      // para priorizar la carga desde Excel
      cargarDatos();
    }
  }, [auth, showExcelUploader]);

  // Función para cargar datos desde un archivo Excel
  const handleExcelUpload = async (file: File) => {
    if (!auth) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para cargar datos",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await cargarDatosDesdeExcel(file, auth);
      setShowExcelUploader(false);
      return true;
    } catch (error) {
      console.error("Error al cargar el Excel:", error);
      toast({
        title: "Error al cargar Excel",
        description: error instanceof Error ? error.message : "Error desconocido al procesar el archivo",
        variant: "destructive"
      });
      return false;
    }
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
    backendDisponible,
    showExcelUploader,
    setShowExcelUploader
  };
};

export default useFootballData;

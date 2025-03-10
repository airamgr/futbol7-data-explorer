
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import useFilteredPlayers from './useFilteredPlayers';
import usePlayerData from './usePlayerData';

interface UseFootballDataProps {
  auth: { username: string; password: string } | null;
}

export const useFootballData = ({ auth }: UseFootballDataProps) => {
  const [showExcelUploader, setShowExcelUploader] = useState(true);
  const [uploadedPlayerCount, setUploadedPlayerCount] = useState<number | undefined>(undefined);
  const { toast } = useToast();
  
  const { 
    jugadores, 
    isLoading, 
    error, 
    cargarDatosDesdeExcel, 
    dataSource 
  } = usePlayerData(auth);
  
  const { filteredJugadores, filtros, actualizarFiltros, resetearFiltros } = useFilteredPlayers(jugadores);

  // Función para cargar datos desde un archivo Excel
  const handleExcelUpload = async (file: File) => {
    if (!auth) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para cargar datos",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      const result = await cargarDatosDesdeExcel(file, auth);
      setShowExcelUploader(false);
      setUploadedPlayerCount(result.length);
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
    cargarDatosDesdeExcel: handleExcelUpload,
    dataSource,
    showExcelUploader,
    setShowExcelUploader,
    uploadedPlayerCount
  };
};

export default useFootballData;


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
      console.log(`Iniciando carga del archivo: ${file.name}`);
      const result = await cargarDatosDesdeExcel(file, auth);
      
      if (result.length === 0) {
        toast({
          title: "Advertencia",
          description: "No se encontraron jugadores en el archivo. Verifica que el formato sea correcto y que contenga datos de jugadores.",
          variant: "destructive"
        });
        return false;
      }
      
      setShowExcelUploader(false);
      setUploadedPlayerCount(result.length);
      
      toast({
        title: "Excel procesado correctamente",
        description: `Se han encontrado ${result.length} jugadores en el archivo`,
      });
      
      return true;
    } catch (error) {
      console.error("Error al cargar el Excel:", error);
      
      // Obtener mensaje de error más detallado
      let errorMessage = "Error desconocido al procesar el archivo";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error al cargar Excel",
        description: errorMessage,
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

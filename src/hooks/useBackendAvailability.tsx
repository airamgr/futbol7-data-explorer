
import { useState, useEffect } from 'react';
import { verificarBackendDisponible } from '@/services/futbolDataService';
import { useToast } from '@/components/ui/use-toast';

export const useBackendAvailability = () => {
  const [backendDisponible, setBackendDisponible] = useState<boolean | null>(null);
  const { toast } = useToast();

  // Verificar disponibilidad del backend al inicio
  useEffect(() => {
    const verificarBackend = async () => {
      const disponible = await verificarBackendDisponible();
      setBackendDisponible(disponible);
      
      if (!disponible) {
        toast({
          title: "Backend no disponible",
          description: "El servidor Python no está disponible. Asegúrate de iniciarlo con 'uvicorn main:app --reload'",
          variant: "destructive",
        });
      }
    };
    
    verificarBackend();
  }, [toast]);

  return { backendDisponible };
};

export default useBackendAvailability;

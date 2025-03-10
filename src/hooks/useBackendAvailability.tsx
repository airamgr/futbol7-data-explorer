
import { useState } from 'react';

export const useBackendAvailability = () => {
  // Ya no verificamos la disponibilidad del backend
  // Solo informamos que no es necesario
  const [backendDisponible] = useState<boolean>(false);

  return { backendDisponible };
};

export default useBackendAvailability;

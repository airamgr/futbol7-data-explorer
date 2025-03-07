
import { AlertTriangle, WifiOff, Database, ServerCrash } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface ConnectionStatusProps {
  error: string | null;
  backendDisponible: boolean | null;
}

const ConnectionStatus = ({ error, backendDisponible }: ConnectionStatusProps) => {
  // Check for different types of errors
  const isSupabaseError = error?.includes('Supabase') || error?.includes('supabase');
  const isBackendError = error?.includes('backend') || error?.includes('Backend') || error?.includes('Python');
  const isExtractionError = error?.includes('extraer') || error?.includes('No se pudieron extraer');
  
  if (!error && backendDisponible !== false) return null;
  
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4 mr-2" />
      <AlertTitle>Problemas de conexión</AlertTitle>
      <AlertDescription className="flex flex-col space-y-2">
        <span>{error}</span>
        
        {isSupabaseError && (
          <div className="mt-2 p-2 bg-yellow-50 rounded-md text-sm">
            <p className="font-semibold flex items-center">
              <Database className="h-4 w-4 mr-1" /> 
              Ya estás conectado a Supabase
            </p>
            <p className="text-xs mt-1">
              Ahora es necesario crear la tabla para almacenar los datos. Por favor, ejecuta la aplicación del backend en Python para crear la primera carga de datos.
            </p>
          </div>
        )}
        
        {isExtractionError && (
          <div className="mt-2 p-2 bg-orange-50 rounded-md text-sm">
            <p className="font-semibold flex items-center">
              <ServerCrash className="h-4 w-4 mr-1" /> 
              Error al extraer datos
            </p>
            <p className="text-xs mt-1">
              El servidor Python está funcionando pero hay un error al extraer los datos. Verifica los logs del backend para más detalles.
              Posibles causas:
              - Credenciales incorrectas
              - Problema con las URLs de origen
              - Error en el proceso de scraping
            </p>
          </div>
        )}
        
        {!backendDisponible && (
          <Badge variant="outline" className="ml-2 bg-yellow-100 self-start">
            <WifiOff className="h-3 w-3 mr-1" />
            Backend no disponible - Ejecuta "uvicorn main:app --reload" en la carpeta backend
          </Badge>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ConnectionStatus;

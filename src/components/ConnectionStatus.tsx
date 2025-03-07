
import { AlertTriangle, WifiOff, Database } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface ConnectionStatusProps {
  error: string | null;
  backendDisponible: boolean | null;
}

const ConnectionStatus = ({ error, backendDisponible }: ConnectionStatusProps) => {
  // Check for Supabase connection error in the error message
  const isSupabaseError = error?.includes('Supabase') || error?.includes('supabase');
  
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
              Conexión a Supabase requerida
            </p>
            <p className="text-xs mt-1">
              Conecta este proyecto a Supabase haciendo clic en el botón "Supabase" en la parte superior derecha de la interfaz de Lovable.
            </p>
          </div>
        )}
        
        {!backendDisponible && (
          <Badge variant="outline" className="ml-2 bg-yellow-100 self-start">
            <WifiOff className="h-3 w-3 mr-1" />
            Backend no disponible
          </Badge>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ConnectionStatus;

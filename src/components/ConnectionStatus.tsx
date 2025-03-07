
import { AlertTriangle, WifiOff } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface ConnectionStatusProps {
  error: string | null;
  backendDisponible: boolean | null;
}

const ConnectionStatus = ({ error, backendDisponible }: ConnectionStatusProps) => {
  if (!error) return null;
  
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4 mr-2" />
      <AlertTitle>Problemas de conexión</AlertTitle>
      <AlertDescription className="flex items-center space-x-2">
        <span>{error}</span>
        {!backendDisponible && (
          <Badge variant="outline" className="ml-2 bg-yellow-100">
            <WifiOff className="h-3 w-3 mr-1" />
            Backend no disponible
          </Badge>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ConnectionStatus;


import { AlertTriangle, Database, FileSpreadsheet } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface ConnectionStatusProps {
  error: string | null;
  backendDisponible?: boolean | null;
}

const ConnectionStatus = ({ error }: ConnectionStatusProps) => {
  // Check for different types of errors
  const isSupabaseError = error?.includes('Supabase') || error?.includes('supabase');
  const isExcelError = error?.includes('Excel') || error?.includes('excel') || error?.includes('archivo');
  
  if (!error) return null;
  
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4 mr-2" />
      <AlertTitle className="text-lg">Problemas al procesar datos</AlertTitle>
      <AlertDescription className="flex flex-col space-y-2">
        <span className="font-medium">{error}</span>
        
        {isSupabaseError && (
          <div className="mt-2 p-2 bg-yellow-50 rounded-md text-sm">
            <p className="font-semibold flex items-center">
              <Database className="h-4 w-4 mr-1" /> 
              Error de conexión con Supabase
            </p>
            <p className="text-xs mt-1">
              Verifica tu conexión a internet y que las credenciales de Supabase sean correctas.
            </p>
          </div>
        )}
        
        {isExcelError && (
          <div className="mt-2 p-2 bg-orange-50 rounded-md text-sm">
            <p className="font-semibold flex items-center">
              <FileSpreadsheet className="h-4 w-4 mr-1" />
              Error al procesar el archivo Excel
            </p>
            <p className="text-xs mt-1">
              Posibles causas:
              <ul className="list-disc pl-5 mt-1">
                <li>Formato incorrecto del archivo</li>
                <li>Estructura de datos no reconocida</li>
                <li>Las columnas de jugador, equipo o goles no fueron detectadas</li>
                <li>Archivo dañado o corrupto</li>
              </ul>
            </p>
            <p className="text-xs mt-2">
              Intenta con otro archivo Excel que contenga columnas con nombres "Jugador", "Equipo" y "Goles". 
              O prueba volver a guardarlo con formato .xlsx.
            </p>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ConnectionStatus;

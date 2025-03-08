
import { AlertTriangle, WifiOff, Database, ServerCrash, FileText, Terminal } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface ConnectionStatusProps {
  error: string | null;
  backendDisponible: boolean | null;
}

const ConnectionStatus = ({ error, backendDisponible }: ConnectionStatusProps) => {
  // Check for different types of errors
  const isSupabaseError = error?.includes('Supabase') || error?.includes('supabase');
  const isBackendError = error?.includes('backend') || error?.includes('Backend') || error?.includes('Python');
  const isExtractionError = error?.includes('extraer') || error?.includes('No se pudieron extraer');
  const isServerError500 = error?.includes('500') || error?.includes('Error 500');
  
  if (!error && backendDisponible !== false) return null;
  
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4 mr-2" />
      <AlertTitle className="text-lg">Problemas de conexión</AlertTitle>
      <AlertDescription className="flex flex-col space-y-2">
        <span className="font-medium">{error}</span>
        
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
        
        {isServerError500 && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="error-500" className="border-none">
              <AccordionTrigger className="py-2 px-3 bg-red-50 rounded-t-md font-semibold flex items-center">
                <ServerCrash className="h-4 w-4 mr-2 text-red-500" /> 
                Error 500 del servidor Python
              </AccordionTrigger>
              <AccordionContent className="bg-red-50 p-3 rounded-b-md text-sm space-y-2">
                <p className="text-sm">
                  El servidor Python ha devuelto un error interno 500. Revisa los logs completos del servidor en la terminal para encontrar el error específico.
                </p>
                
                <div className="bg-gray-800 text-white p-3 rounded-md font-mono text-xs space-y-1">
                  <p className="text-green-400">$ python -u backend/main.py</p>
                  <p className="text-green-400">$ cd backend && uvicorn main:app --reload</p>
                </div>
                
                <div className="mt-3 space-y-1">
                  <p className="font-medium text-red-800">Busca una línea que contenga:</p>
                  <p className="font-mono bg-gray-100 p-1.5 rounded text-xs text-red-700 border border-red-200">
                    ERROR: <span className="opacity-75">mensaje del error específico</span>
                  </p>
                  <div className="flex items-center mt-1 text-xs">
                    <Terminal className="h-3 w-3 mr-1" />
                    <span>Si no ves un mensaje de ERROR, busca cualquier excepción o traceback en los logs</span>
                  </div>
                </div>
                
                <div className="mt-3">
                  <p className="font-medium">Posibles causas:</p>
                  <ul className="list-disc pl-5 mt-1 text-xs space-y-1">
                    <li>Error en el scraping de las páginas web (BeautifulSoup)</li>
                    <li>Credenciales incorrectas (actualmente se espera: usuario="CE4032", contraseña="9525")</li>
                    <li>Error de conexión con las URLs de origen (requests)</li>
                    <li>Excepción no controlada en el código Python</li>
                    <li>CORS o problemas de red entre el frontend y el backend</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
        
        {isExtractionError && !isServerError500 && (
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
        
        <div className="mt-3 p-3 bg-blue-50 rounded-md text-sm border border-blue-100">
          <p className="font-semibold flex items-center">
            <FileText className="h-4 w-4 mr-1 text-blue-500" /> 
            Solución recomendada
          </p>
          <ol className="list-decimal pl-5 mt-1 space-y-1 text-xs">
            <li>
              <strong>Verifica los logs completos del servidor Python</strong> en la terminal donde lo ejecutaste
              <div className="font-mono mt-1 text-xs bg-gray-100 p-1 rounded">
                Busca líneas que empiecen con <span className="text-red-500 font-semibold">ERROR:</span> o <span className="text-red-500 font-semibold">Exception:</span>
              </div>
            </li>
            <li>
              <strong>Copia y pega el mensaje de error exacto</strong> para entender el problema específico
            </li>
            <li>
              <strong>Corrige el problema</strong> (URLs incorrectas, credenciales, etc.)
            </li>
            <li>
              <strong>Reinicia el servidor</strong> Python con "uvicorn main:app --reload"
            </li>
            <li>
              <strong>Intenta actualizar los datos</strong> nuevamente desde la aplicación
            </li>
          </ol>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ConnectionStatus;

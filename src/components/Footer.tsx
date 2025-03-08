
import { Database, ServerCrash, Terminal, AlertTriangle, ArrowRight } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <p className="text-slate-400 text-sm">
              © 2023 Explorador de Datos de Fútbol 7 Base. Todos los derechos reservados.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center">
            <Database className="h-4 w-4 mr-2 text-blue-400" />
            <p className="text-slate-400 text-sm">
              Datos extraídos de intranet.rfcylf.es y almacenados en Supabase
            </p>
          </div>
        </div>
        
        <div className="mt-6">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="debug-guide" className="border-t border-slate-800">
              <AccordionTrigger className="py-2 text-sm text-slate-400 hover:text-slate-300">
                <div className="flex items-center">
                  <Terminal className="h-4 w-4 mr-2 text-green-400" />
                  <span>Guía de depuración y solución de errores</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-xs text-slate-400 space-y-4">
                <div className="bg-slate-800 p-3 rounded-md">
                  <p className="text-orange-400 flex items-center mb-2">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    <span className="font-medium">Cómo iniciar el backend Python</span>
                  </p>
                  <div className="bg-slate-900 p-2 rounded font-mono text-green-400 mb-2">
                    <p>cd backend</p>
                    <p>uvicorn main:app --reload</p>
                  </div>
                  <p className="text-xs text-slate-400">
                    El servidor se iniciará en <span className="font-mono bg-slate-900 px-1">http://localhost:8000</span>
                  </p>
                </div>
                
                <div className="bg-slate-800 p-3 rounded-md">
                  <p className="text-orange-400 flex items-center mb-2">
                    <ServerCrash className="h-3 w-3 mr-1" />
                    <span className="font-medium">Cómo resolver errores 500 del backend</span>
                  </p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>
                      Busca en los logs de la terminal mensajes que empiecen con <span className="font-mono bg-slate-900 px-1 text-red-400">ERROR:</span>
                    </li>
                    <li>
                      Identifica errores comunes:
                      <ul className="list-disc pl-5 mt-1">
                        <li><span className="text-orange-400">BeautifulSoup</span>: Problemas al parsear el HTML de la web</li>
                        <li><span className="text-orange-400">Credentials</span>: Credenciales incorrectas (usuario/contraseña)</li>
                        <li><span className="text-orange-400">Connection</span>: Problemas de conexión con URLs o servidores</li>
                        <li><span className="text-orange-400">Import Error</span>: Librerías Python faltantes</li>
                      </ul>
                    </li>
                    <li>
                      Si no encuentras el error, ejecuta Python en modo detallado:
                      <div className="bg-slate-900 p-1 mt-1 rounded font-mono">
                        <p>python -u backend/main.py</p>
                      </div>
                    </li>
                    <li>
                      Después de corregir el error, reinicia el servidor y actualiza los datos en la aplicación
                      <div className="flex items-center mt-1">
                        <ArrowRight className="h-3 w-3 mr-1 text-green-400" />
                        <span>El botón "Actualizar datos" en la parte superior de la página</span>
                      </div>
                    </li>
                  </ol>
                </div>
                
                <div className="text-center mt-2 text-xs">
                  <p>Una vez que el backend esté funcionando correctamente, los datos se almacenarán en Supabase</p>
                  <p className="mt-1">Después de la primera carga exitosa, podrás ver los datos incluso sin el backend en ejecución</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

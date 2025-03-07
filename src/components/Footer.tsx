
import { Database, ServerCrash } from 'lucide-react';

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
        <div className="mt-4 text-center text-xs text-slate-500">
          <p>Supabase está conectado. Ahora necesitas iniciar el backend Python y resolver cualquier error de extracción.</p>
          <p className="font-mono mt-1 bg-slate-800 p-1 rounded">cd backend && uvicorn main:app --reload</p>
          <p className="mt-2 text-orange-400 flex items-center justify-center">
            <ServerCrash className="h-3 w-3 mr-1" />
            Si ves un error 500, revisa los logs de Python para detalles del error de extracción
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

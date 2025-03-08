
import { Database, ServerCrash, Terminal } from 'lucide-react';

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
          <div className="mt-2 bg-slate-800 p-2 rounded-md text-left">
            <p className="text-orange-400 flex items-center">
              <ServerCrash className="h-3 w-3 mr-1" />
              Error 500 en el backend
            </p>
            <p className="text-slate-400 mt-1 text-xs">
              Si ves un error 500, revisa estos detalles en la terminal donde ejecutas Python:
            </p>
            <ul className="text-slate-400 mt-1 text-xs list-disc pl-5">
              <li>Errores de BeautifulSoup al parsear HTML</li>
              <li>Errores de conexión con las URLs de las categorías de fútbol</li>
              <li>Errores de autenticación (credenciales incorrectas)</li>
              <li>Excepciones no controladas en el código Python</li>
            </ul>
            <p className="flex items-center text-slate-400 mt-2 text-xs">
              <Terminal className="h-3 w-3 mr-1 text-green-400" />
              Busca la línea que dice <span className="font-mono bg-slate-900 px-1">ERROR:</span> en tus logs de Python
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

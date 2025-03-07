
import { Database } from 'lucide-react';

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
          <p>Para utilizar esta aplicación, debes conectar el proyecto a Supabase a través de la integración de Lovable.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

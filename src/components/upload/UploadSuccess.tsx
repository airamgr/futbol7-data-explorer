
import { CheckCircle, FileSpreadsheet } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface UploadSuccessProps {
  count?: number;
  fileType?: string;
}

const UploadSuccess = ({ count, fileType }: UploadSuccessProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      <h3 className="text-lg font-semibold text-green-700">¡Archivo procesado correctamente!</h3>
      {count !== undefined && count > 0 && (
        <p className="text-sm text-green-600 mt-1">
          Se han encontrado {count} jugadores en el archivo
          {fileType && <span className="ml-1">({fileType})</span>}
        </p>
      )}
      {count === 0 && (
        <div>
          <p className="text-sm text-amber-600 mt-1">
            No se encontraron jugadores en el archivo. 
          </p>
          <div className="mt-2 p-3 bg-amber-50 rounded-md text-sm">
            <p className="font-semibold flex items-center">
              <FileSpreadsheet className="h-4 w-4 mr-1" />
              Formato esperado:
            </p>
            <div className="text-xs mt-1 text-left">
              <p className="mb-1">El archivo Excel debe tener:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Columnas: Jugador, Equipo, Grupo, Partidos Jugados, Goles, Goles partido</li>
                <li>Datos de jugadores a partir de la fila 4</li>
                <li>Título y temporada en las primeras filas</li>
                <li>Si el archivo es antiguo, intenta abrirlo en Excel y guardarlo como .xlsx</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default UploadSuccess;

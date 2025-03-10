
import { CheckCircle, FileSpreadsheet } from 'lucide-react';
import { motion } from 'framer-motion';

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
              Consejos para Excel:
            </p>
            <ul className="text-xs list-disc pl-5 mt-1 text-left">
              <li>Verifica que el Excel contenga columnas para Jugador, Equipo y Goles</li>
              <li>Las columnas deben tener datos en al menos 2-3 filas para ser detectadas</li>
              <li>Guarda el archivo en formato .xlsx usando "Guardar como" en Excel</li>
              <li>Asegúrate que la primera hoja del libro contenga los datos</li>
            </ul>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default UploadSuccess;

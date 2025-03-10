
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface UploadSuccessProps {
  count?: number;
}

const UploadSuccess = ({ count }: UploadSuccessProps) => {
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
        </p>
      )}
      {count === 0 && (
        <p className="text-sm text-amber-600 mt-1">
          No se encontraron jugadores en el archivo. Verifica el formato.
        </p>
      )}
    </motion.div>
  );
};

export default UploadSuccess;

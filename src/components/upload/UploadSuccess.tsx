
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const UploadSuccess = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="h-8 w-8 text-green-600" />
      </div>
      <h3 className="text-lg font-semibold text-green-700">¡Archivo procesado con éxito!</h3>
    </motion.div>
  );
};

export default UploadSuccess;

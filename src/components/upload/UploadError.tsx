
import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface UploadErrorProps {
  errorMessage: string | null;
  onSelectAnother: () => void;
}

const UploadError = ({ errorMessage, onSelectAnother }: UploadErrorProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="h-8 w-8 text-red-600" />
      </div>
      <h3 className="text-lg font-semibold text-red-700">Error al procesar el archivo</h3>
      {errorMessage && (
        <p className="text-sm text-red-600 mt-1 mb-3">
          {errorMessage}
        </p>
      )}
      <Button 
        variant="outline" 
        size="sm"
        onClick={onSelectAnother}
      >
        <X className="h-4 w-4 mr-2" />
        Seleccionar otro archivo
      </Button>
    </motion.div>
  );
};

export default UploadError;

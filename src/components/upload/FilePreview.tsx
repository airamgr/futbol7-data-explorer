
import { Button } from '@/components/ui/button';
import { FileType } from 'lucide-react';
import { motion } from 'framer-motion';

interface FilePreviewProps {
  file: File;
  onCancel: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const FilePreview = ({ file, onCancel, onSubmit, isLoading }: FilePreviewProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg mb-4">
        <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
          <FileType className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button 
          onClick={onSubmit}
          disabled={isLoading}
        >
          Procesar archivo
        </Button>
      </div>
    </motion.div>
  );
};

export default FilePreview;

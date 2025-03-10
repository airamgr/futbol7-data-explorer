
import { Progress } from '@/components/ui/progress';
import { FileType } from 'lucide-react';
import { motion } from 'framer-motion';

interface UploadProgressProps {
  file: File | null;
  progress: number;
}

const UploadProgress = ({ file, progress }: UploadProgressProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full"
    >
      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg mb-4">
        <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
          <FileType className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{file?.name}</p>
          <Progress value={progress} className="h-2 mt-2" />
        </div>
      </div>
      
      <p className="text-center text-sm text-muted-foreground">
        Procesando archivo, por favor espera...
      </p>
    </motion.div>
  );
};

export default UploadProgress;

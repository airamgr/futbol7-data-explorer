
import { useRef } from 'react';
import { Upload, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface UploadIdleProps {
  accept: string;
  maxSize: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const UploadIdle = ({ accept, maxSize, onChange }: UploadIdleProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center"
      >
        <Upload className="h-6 w-6 text-primary" />
      </motion.div>
      
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-1">Carga tu archivo Excel</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Arrastra y suelta o haz clic para seleccionar
        </p>
        
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="relative"
        >
          <Button variant="outline" className="relative">
            <FileUp className="mr-2 h-4 w-4" />
            Seleccionar archivo
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={onChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </motion.div>
        
        <p className="text-xs text-muted-foreground mt-4">
          Formatos permitidos: {accept} (Máx: {maxSize}MB)
        </p>
      </div>
    </>
  );
};

export default UploadIdle;

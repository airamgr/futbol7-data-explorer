
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, FileType, FileUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  onFileUpload: (file: File) => Promise<void>;
  isLoading: boolean;
  accept: string;
  maxSize?: number; // tamaño máximo en MB
}

const FileUploader = ({ onFileUpload, isLoading, accept, maxSize = 10 }: FileUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const { toast } = useToast();
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const validateFile = (file: File): boolean => {
    // Validar tipo de archivo
    const fileType = file.type;
    const validTypes = accept.split(',').map(type => type.trim());
    
    if (!validTypes.some(type => fileType.includes(type.replace('*', '')))) {
      toast({
        title: 'Tipo de archivo no válido',
        description: `Solo se permiten archivos: ${accept}`,
        variant: 'destructive',
      });
      return false;
    }
    
    // Validar tamaño de archivo
    const fileSize = file.size / 1024 / 1024; // convertir a MB
    if (fileSize > maxSize) {
      toast({
        title: 'Archivo demasiado grande',
        description: `El tamaño máximo permitido es ${maxSize}MB`,
        variant: 'destructive',
      });
      return false;
    }
    
    return true;
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };
  
  const handleSubmit = async () => {
    if (!file) return;
    
    try {
      setUploadStatus('uploading');
      
      // Simular progreso de carga
      const simulateProgress = () => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 10;
          if (progress > 90) {
            clearInterval(interval);
          } else {
            setUploadProgress(Math.min(progress, 90));
          }
        }, 300);
        
        return interval;
      };
      
      const progressInterval = simulateProgress();
      
      // Procesar el archivo
      await onFileUpload(file);
      
      // Limpiar intervalo y completar progreso
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus('success');
      
      // Reiniciar después de 2 segundos
      setTimeout(() => {
        setFile(null);
        setUploadProgress(0);
        setUploadStatus('idle');
      }, 2000);
      
    } catch (error) {
      console.error('Error al cargar el archivo:', error);
      setUploadStatus('error');
      
      // Reiniciar después de 3 segundos
      setTimeout(() => {
        setUploadProgress(0);
        setUploadStatus('idle');
      }, 3000);
    }
  };
  
  return (
    <Card className={cn(
      "p-6 border-2 border-dashed transition-all duration-300",
      dragActive ? "border-primary bg-primary/5" : "border-border",
      uploadStatus === 'success' && "border-green-500 bg-green-50",
      uploadStatus === 'error' && "border-red-500 bg-red-50"
    )}>
      <div
        className="flex flex-col items-center justify-center gap-4 p-4"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {uploadStatus === 'idle' && !file && (
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
                  type="file"
                  accept={accept}
                  onChange={handleChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </motion.div>
              
              <p className="text-xs text-muted-foreground mt-4">
                Formatos permitidos: {accept} (Máx: {maxSize}MB)
              </p>
            </div>
          </>
        )}
        
        {file && uploadStatus === 'idle' && (
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
                onClick={() => setFile(null)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isLoading}
              >
                Procesar archivo
              </Button>
            </div>
          </motion.div>
        )}
        
        {uploadStatus === 'uploading' && (
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
                <Progress value={uploadProgress} className="h-2 mt-2" />
              </div>
            </div>
            
            <p className="text-center text-sm text-muted-foreground">
              Procesando archivo, por favor espera...
            </p>
          </motion.div>
        )}
        
        {uploadStatus === 'success' && (
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
        )}
        
        {uploadStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-700">Error al procesar el archivo</h3>
            <p className="text-sm text-red-600 mt-1">
              Por favor, inténtalo de nuevo con otro archivo
            </p>
          </motion.div>
        )}
      </div>
    </Card>
  );
};

export default FileUploader;

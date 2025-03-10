
import { useState, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface UseFileUploadProps {
  onFileUpload: (file: File) => Promise<void>;
  accept: string;
  maxSize: number;
}

export const useFileUpload = ({ onFileUpload, accept, maxSize }: UseFileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
    // Limpiar errores previos
    setErrorMessage(null);
    
    // Verificamos la extensión del archivo
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = accept.split(',')
      .map(ext => ext.trim().replace('.', '').toLowerCase());
    
    if (!fileExtension || !validExtensions.includes(fileExtension)) {
      const errorMsg = `Tipo de archivo no válido. Solo se permiten: ${accept}`;
      setErrorMessage(errorMsg);
      toast({
        title: 'Archivo no válido',
        description: errorMsg,
        variant: 'destructive',
      });
      return false;
    }
    
    // Validar tamaño de archivo
    const fileSize = file.size / 1024 / 1024; // convertir a MB
    if (fileSize > maxSize) {
      const errorMsg = `El archivo es demasiado grande. Tamaño máximo: ${maxSize}MB`;
      setErrorMessage(errorMsg);
      toast({
        title: 'Archivo demasiado grande',
        description: errorMsg,
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
        console.log(`Archivo seleccionado: ${selectedFile.name} (${selectedFile.size} bytes, tipo: ${selectedFile.type})`);
      }
    }
  };
  
  const resetForm = () => {
    setFile(null);
    setUploadProgress(0);
    setUploadStatus('idle');
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleSubmit = async () => {
    if (!file) return;
    
    try {
      setUploadStatus('uploading');
      setErrorMessage(null);
      
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
      console.log(`Iniciando carga del archivo: ${file.name}`);
      await onFileUpload(file);
      
      // Limpiar intervalo y completar progreso
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus('success');
      
      // Reiniciar después de 2 segundos
      setTimeout(() => {
        resetForm();
      }, 2000);
      
    } catch (error) {
      console.error('Error al cargar el archivo:', error);
      setUploadStatus('error');
      
      // Manejar el mensaje de error
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Error desconocido al procesar el archivo');
      }
      
      // Mantener el mensaje de error visible durante 5 segundos
      setTimeout(() => {
        setUploadProgress(0);
        setUploadStatus('idle');
      }, 5000);
    }
  };
  
  return {
    dragActive,
    file,
    uploadProgress,
    uploadStatus,
    errorMessage,
    fileInputRef,
    handleDrag,
    handleDrop,
    handleChange,
    handleSubmit,
    resetForm
  };
};

export default useFileUpload;

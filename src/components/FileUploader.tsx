
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import UploadIdle from './upload/UploadIdle';
import FilePreview from './upload/FilePreview';
import UploadProgress from './upload/UploadProgress';
import UploadSuccess from './upload/UploadSuccess';
import UploadError from './upload/UploadError';
import useFileUpload from './upload/useFileUpload';

interface FileUploaderProps {
  onFileUpload: (file: File) => Promise<void>;
  isLoading: boolean;
  accept: string;
  maxSize?: number; // tamaño máximo en MB
  successCount?: number; // número de registros procesados con éxito
}

const FileUploader = ({ onFileUpload, isLoading, accept, maxSize = 10, successCount }: FileUploaderProps) => {
  const {
    dragActive,
    file,
    uploadProgress,
    uploadStatus,
    errorMessage,
    handleDrag,
    handleDrop,
    handleChange,
    handleSubmit,
    resetForm
  } = useFileUpload({ onFileUpload, accept, maxSize });
  
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
          <UploadIdle 
            accept={accept} 
            maxSize={maxSize} 
            onChange={handleChange} 
          />
        )}
        
        {file && uploadStatus === 'idle' && (
          <FilePreview
            file={file}
            onCancel={() => resetForm()}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        )}
        
        {uploadStatus === 'uploading' && (
          <UploadProgress
            file={file}
            progress={uploadProgress}
          />
        )}
        
        {uploadStatus === 'success' && <UploadSuccess count={successCount} />}
        
        {uploadStatus === 'error' && (
          <UploadError
            errorMessage={errorMessage}
            onSelectAnother={resetForm}
          />
        )}
      </div>
    </Card>
  );
};

export default FileUploader;

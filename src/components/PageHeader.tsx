
import { Button } from '@/components/ui/button';
import { RefreshCw, LogOut, FileUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface PageHeaderProps {
  onRefreshData: () => void;
  onLogout: () => void;
  isLoading: boolean;
  onUploadClick?: () => void;
}

const PageHeader = ({ onRefreshData, onLogout, isLoading, onUploadClick }: PageHeaderProps) => {
  return (
    <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Explorador de Datos - Fútbol 7
        </h1>
        <p className="text-muted-foreground mt-2">
          Estadísticas de goleadores de la temporada actual
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        {onUploadClick && (
          <Button 
            variant="outline" 
            onClick={onUploadClick}
            className="flex items-center gap-2"
          >
            <FileUp className="h-4 w-4" />
            <span className="hidden sm:inline">Cargar Excel</span>
          </Button>
        )}
        
        <Button 
          variant="outline" 
          onClick={onRefreshData}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <motion.div
            animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
            transition={{ repeat: isLoading ? Infinity : 0, duration: 1, ease: "linear" }}
          >
            <RefreshCw className="h-4 w-4" />
          </motion.div>
          <span className="hidden sm:inline">Actualizar datos</span>
        </Button>
        
        <Button 
          variant="ghost" 
          onClick={onLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Cerrar sesión</span>
        </Button>
      </div>
    </div>
  );
};

export default PageHeader;

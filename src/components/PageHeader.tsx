
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { DownloadCloud, LogOut } from 'lucide-react';

interface PageHeaderProps {
  onRefreshData: () => void;
  onLogout: () => void;
  isLoading: boolean;
}

const PageHeader = ({ onRefreshData, onLogout, isLoading }: PageHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-8">
      <div>
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-3xl font-bold text-slate-800"
        >
          Explorador de Datos
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-slate-500"
        >
          Analiza el rendimiento de los jugadores de fútbol base
        </motion.p>
      </div>
      
      <div className="flex space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                onClick={onRefreshData} 
                disabled={isLoading}
                className="hover:bg-primary/5"
              >
                {isLoading ? (
                  <>
                    <motion.div
                      className="h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Cargando...
                  </>
                ) : (
                  <>
                    <DownloadCloud className="h-4 w-4 mr-2" />
                    Actualizar datos
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Intenta cargar datos actualizados del servidor</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <Button 
          variant="ghost" 
          onClick={onLogout}
          className="hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
};

export default PageHeader;

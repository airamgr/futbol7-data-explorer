
import { Badge } from '@/components/ui/badge';
import { Database, ServerCrash, WifiOff, FileSpreadsheet } from 'lucide-react';

interface DataSourceBadgesProps {
  dataSource: 'supabase' | 'backend' | 'excel' | null;
  backendDisponible: boolean | null;
}

const DataSourceBadges = ({ dataSource, backendDisponible }: DataSourceBadgesProps) => {
  return (
    <div className="mb-6">
      {dataSource === 'excel' && (
        <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200">
          <FileSpreadsheet className="h-3 w-3 mr-1" />
          Datos cargados desde Excel
        </Badge>
      )}
      
      {dataSource === 'supabase' && (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 ml-2">
          <Database className="h-3 w-3 mr-1" />
          Datos cargados desde Supabase
        </Badge>
      )}
      
      {dataSource === 'backend' && (
        <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 ml-2">
          <ServerCrash className="h-3 w-3 mr-1" />
          Datos actualizados desde backend
        </Badge>
      )}
      
      {!backendDisponible && (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200 ml-2">
          <WifiOff className="h-3 w-3 mr-1" />
          Backend no disponible
        </Badge>
      )}
    </div>
  );
};

export default DataSourceBadges;

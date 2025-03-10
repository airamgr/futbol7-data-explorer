
import { Badge } from '@/components/ui/badge';
import { Database, FileSpreadsheet } from 'lucide-react';

interface DataSourceBadgesProps {
  dataSource: 'supabase' | 'excel' | null;
  backendDisponible?: boolean | null;
}

const DataSourceBadges = ({ dataSource }: DataSourceBadgesProps) => {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {dataSource === 'excel' && (
        <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200">
          <FileSpreadsheet className="h-3 w-3 mr-1" />
          Datos cargados desde Excel
        </Badge>
      )}
      
      {dataSource === 'supabase' && (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200">
          <Database className="h-3 w-3 mr-1" />
          Datos cargados desde Supabase
        </Badge>
      )}
    </div>
  );
};

export default DataSourceBadges;


import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TablaJugadores from '@/components/TablaJugadores';
import Filtros from '@/components/Filtros';
import { Jugador, FiltroJugadores } from '@/services/futbolDataService';

interface DataTabsProps {
  jugadores: Jugador[];
  isLoading: boolean;
  filtros: FiltroJugadores;
  onFiltrosChange: (filtros: FiltroJugadores) => void;
  onResetFiltros: () => void;
}

const DataTabs = ({ 
  jugadores, 
  isLoading, 
  filtros, 
  onFiltrosChange, 
  onResetFiltros 
}: DataTabsProps) => {
  return (
    <Tabs defaultValue="tabla" className="w-full">
      <TabsList className="mb-8 bg-white/50 backdrop-blur-sm">
        <TabsTrigger value="tabla">Tabla de Datos</TabsTrigger>
        <TabsTrigger value="filtros">Filtros Avanzados</TabsTrigger>
      </TabsList>
      
      <TabsContent value="tabla" className="space-y-8">
        <TablaJugadores 
          jugadores={jugadores} 
          isLoading={isLoading} 
        />
      </TabsContent>
      
      <TabsContent value="filtros">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Filtros 
              jugadores={jugadores}
              filtros={filtros}
              onFiltrosChange={onFiltrosChange}
              onResetFiltros={onResetFiltros}
            />
          </div>
          
          <div className="md:col-span-2">
            <TablaJugadores 
              jugadores={jugadores} 
              isLoading={isLoading} 
            />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default DataTabs;

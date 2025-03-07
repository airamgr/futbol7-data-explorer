
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Jugador, FiltroJugadores } from '@/services/futbolDataService';
import { motion } from 'framer-motion';
import { Filter, X } from 'lucide-react';

interface FiltrosProps {
  jugadores: Jugador[];
  filtros: FiltroJugadores;
  onFiltrosChange: (filtros: FiltroJugadores) => void;
  onResetFiltros: () => void;
}

export const Filtros = ({ jugadores, filtros, onFiltrosChange, onResetFiltros }: FiltrosProps) => {
  // Estados locales para los rangos
  const [edadRange, setEdadRange] = useState<[number, number]>([6, 12]);
  const [golesMinimos, setGolesMinimos] = useState<number>(0);
  const [partidosMinimos, setPartidosMinimos] = useState<number>(0);
  
  // Extraer valores únicos de categorías y equipos
  const categorias = [...new Set(jugadores.map(j => j.categoria))].sort();
  const equipos = [...new Set(jugadores.map(j => j.equipo))].sort();
  
  // Rangos máximos calculados a partir de los datos
  const maxGoles = Math.max(...jugadores.map(j => j.goles), 0);
  const maxPartidos = Math.max(...jugadores.map(j => j.partidosJugados || 0), 0);
  
  // Sincronizar estados locales con filtros externos cuando cambian
  useEffect(() => {
    if (filtros.edadMinima !== undefined || filtros.edadMaxima !== undefined) {
      setEdadRange([
        filtros.edadMinima !== undefined ? filtros.edadMinima : 6,
        filtros.edadMaxima !== undefined ? filtros.edadMaxima : 12
      ]);
    } else {
      setEdadRange([6, 12]);
    }
    
    setGolesMinimos(filtros.golesMinimos !== undefined ? filtros.golesMinimos : 0);
    setPartidosMinimos(filtros.partidosMinimos !== undefined ? filtros.partidosMinimos : 0);
  }, [filtros]);
  
  // Aplicar filtros
  const aplicarFiltros = () => {
    onFiltrosChange({
      ...filtros,
      edadMinima: edadRange[0],
      edadMaxima: edadRange[1],
      golesMinimos,
      partidosMinimos
    });
  };
  
  // Contamos cuántos filtros activos hay
  const contarFiltrosActivos = () => {
    let count = 0;
    if (filtros.categoria) count++;
    if (filtros.equipo) count++;
    if (filtros.edadMinima !== undefined || filtros.edadMaxima !== undefined) count++;
    if (filtros.golesMinimos !== undefined && filtros.golesMinimos > 0) count++;
    if (filtros.partidosMinimos !== undefined && filtros.partidosMinimos > 0) count++;
    return count;
  };
  
  const filtrosActivos = contarFiltrosActivos();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="space-y-6 backdrop-blur-sm bg-white/20 dark:bg-black/20 rounded-lg p-6 border border-slate-200/30"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Filtros</h3>
        {filtrosActivos > 0 && (
          <Button variant="outline" size="sm" onClick={onResetFiltros} className="hover:bg-destructive/10">
            <X className="h-4 w-4 mr-2" />
            Limpiar filtros
            <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-xs font-semibold">
              {filtrosActivos}
            </span>
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Filtro por categoría */}
        <div className="space-y-2">
          <Label htmlFor="categoria">Categoría</Label>
          <Select
            value={filtros.categoria || ""}
            onValueChange={(value) => onFiltrosChange({ ...filtros, categoria: value || undefined })}
          >
            <SelectTrigger id="categoria">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas las categorías</SelectItem>
              {categorias.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Filtro por equipo */}
        <div className="space-y-2">
          <Label htmlFor="equipo">Equipo</Label>
          <Select
            value={filtros.equipo || ""}
            onValueChange={(value) => onFiltrosChange({ ...filtros, equipo: value || undefined })}
          >
            <SelectTrigger id="equipo">
              <SelectValue placeholder="Todos los equipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los equipos</SelectItem>
              {equipos.map((equipo) => (
                <SelectItem key={equipo} value={equipo}>{equipo}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Filtro por edad */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Rango de edad</Label>
          <span className="text-sm text-muted-foreground">
            {edadRange[0]} - {edadRange[1]} años
          </span>
        </div>
        <Slider
          defaultValue={[6, 12]}
          min={6}
          max={12}
          step={1}
          value={edadRange}
          onValueChange={setEdadRange}
          className="my-6"
        />
      </div>
      
      {/* Filtro por goles mínimos */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="goles">Goles mínimos</Label>
          <span className="text-sm text-muted-foreground">{golesMinimos}</span>
        </div>
        <Slider
          defaultValue={[0]}
          min={0}
          max={maxGoles}
          step={1}
          value={[golesMinimos]}
          onValueChange={([value]) => setGolesMinimos(value)}
        />
      </div>
      
      {/* Filtro por partidos mínimos */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="partidos">Partidos mínimos</Label>
          <span className="text-sm text-muted-foreground">{partidosMinimos}</span>
        </div>
        <Slider
          defaultValue={[0]}
          min={0}
          max={maxPartidos}
          step={1}
          value={[partidosMinimos]}
          onValueChange={([value]) => setPartidosMinimos(value)}
        />
      </div>
      
      {/* Botón de aplicar filtros */}
      <Button 
        className="w-full" 
        onClick={aplicarFiltros}
      >
        <Filter className="h-4 w-4 mr-2" />
        Aplicar filtros
      </Button>
    </motion.div>
  );
};

export default Filtros;

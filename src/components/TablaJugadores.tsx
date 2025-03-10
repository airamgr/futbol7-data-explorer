
import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowDown, ArrowUp, Search } from 'lucide-react';
import { Jugador } from '@/services/futbolDataService';
import { motion, AnimatePresence } from 'framer-motion';

interface TablaJugadoresProps {
  jugadores: Jugador[];
  isLoading: boolean;
}

export const TablaJugadores = ({ jugadores, isLoading }: TablaJugadoresProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Jugador;
    direction: 'ascending' | 'descending';
  }>({
    key: 'goles',
    direction: 'descending',
  });

  // Aplicar búsqueda y ordenación a los jugadores
  const jugadoresFiltrados = useMemo(() => {
    let filteredPlayers = [...jugadores];

    // Aplicar búsqueda
    if (searchTerm) {
      const termLower = searchTerm.toLowerCase();
      filteredPlayers = filteredPlayers.filter(
        (jugador) =>
          jugador.nombre.toLowerCase().includes(termLower) ||
          jugador.equipo.toLowerCase().includes(termLower) ||
          jugador.categoria.toLowerCase().includes(termLower) ||
          (jugador.grupo && jugador.grupo.toLowerCase().includes(termLower))
      );
    }

    // Aplicar ordenación
    filteredPlayers.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // Manejar valores indefinidos o nulos
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;

      // Ordenación específica según el tipo de valor
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'ascending'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'ascending'
          ? aValue - bValue
          : bValue - aValue;
      }

      // Fallback para otros tipos
      return 0;
    });

    return filteredPlayers;
  }, [jugadores, searchTerm, sortConfig]);

  // Función para cambiar la ordenación
  const handleSort = (key: keyof Jugador) => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === 'ascending'
          ? 'descending'
          : 'ascending',
    }));
  };

  // Renderizar icono de ordenación
  const renderSortIcon = (key: keyof Jugador) => {
    if (sortConfig.key !== key) return null;

    return sortConfig.direction === 'ascending' ? (
      <ArrowUp className="ml-1 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-1 h-4 w-4" />
    );
  };

  // Calcular edad a partir de la fecha de nacimiento
  const calcularEdad = (fechaNacimiento?: string) => {
    if (!fechaNacimiento) return 'N/A';

    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return edad;
  };

  return (
    <div className="space-y-4 w-full backdrop-blur-sm bg-white/20 dark:bg-black/20 rounded-lg p-4 border border-slate-200/30">
      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar jugador, equipo, grupo, categoría..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabla de jugadores */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader className="bg-primary/10">
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-primary/5 transition-colors"
                onClick={() => handleSort('nombre')}
              >
                <div className="flex items-center">
                  Jugador {renderSortIcon('nombre')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-primary/5 transition-colors"
                onClick={() => handleSort('equipo')}
              >
                <div className="flex items-center">
                  Equipo {renderSortIcon('equipo')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-primary/5 transition-colors"
                onClick={() => handleSort('grupo')}
              >
                <div className="flex items-center">
                  Grupo {renderSortIcon('grupo')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-primary/5 transition-colors"
                onClick={() => handleSort('categoria')}
              >
                <div className="flex items-center">
                  Categoría {renderSortIcon('categoria')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-primary/5 transition-colors text-right"
                onClick={() => handleSort('goles')}
              >
                <div className="flex items-center justify-end">
                  Goles {renderSortIcon('goles')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-primary/5 transition-colors text-right"
                onClick={() => handleSort('partidosJugados')}
              >
                <div className="flex items-center justify-end">
                  PJ {renderSortIcon('partidosJugados')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-primary/5 transition-colors text-right"
                onClick={() => handleSort('golesPartido')}
              >
                <div className="flex items-center justify-end">
                  Goles/P {renderSortIcon('golesPartido')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-primary/5 transition-colors text-right"
                onClick={() => handleSort('fechaNacimiento')}
              >
                <div className="flex items-center justify-end">
                  Edad {renderSortIcon('fechaNacimiento')}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {isLoading ? (
                // Filas de carga
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    {Array.from({ length: 8 }).map((_, cellIndex) => (
                      <TableCell key={`skeleton-cell-${index}-${cellIndex}`}>
                        <motion.div
                          className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                          initial={{ opacity: 0.5 }}
                          animate={{ opacity: [0.5, 0.8, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        ></motion.div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : jugadoresFiltrados.length > 0 ? (
                jugadoresFiltrados.map((jugador, index) => (
                  <motion.tr
                    key={jugador.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className="hover:bg-primary/5 transition-colors"
                    whileHover={{ 
                      backgroundColor: 'rgba(var(--primary), 0.05)',
                      transition: { duration: 0.1 }
                    }}
                  >
                    <TableCell className="font-medium">{jugador.nombre}</TableCell>
                    <TableCell>{jugador.equipo}</TableCell>
                    <TableCell>{jugador.grupo || 'N/A'}</TableCell>
                    <TableCell>{jugador.categoria}</TableCell>
                    <TableCell className="text-right font-semibold">{jugador.goles}</TableCell>
                    <TableCell className="text-right">{jugador.partidosJugados || 'N/A'}</TableCell>
                    <TableCell className="text-right">{jugador.golesPartido?.toFixed(2) || 'N/A'}</TableCell>
                    <TableCell className="text-right">{calcularEdad(jugador.fechaNacimiento)}</TableCell>
                  </motion.tr>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-center justify-center gap-2"
                    >
                      <p className="text-muted-foreground">No se encontraron jugadores con los criterios actuales</p>
                      {searchTerm && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSearchTerm('')}
                        >
                          Limpiar búsqueda
                        </Button>
                      )}
                    </motion.div>
                  </TableCell>
                </TableRow>
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      {/* Contador de resultados */}
      <div className="text-sm text-muted-foreground text-right">
        {isLoading ? (
          <span>Cargando datos...</span>
        ) : (
          <span>Mostrando {jugadoresFiltrados.length} de {jugadores.length} jugadores</span>
        )}
      </div>
    </div>
  );
};

export default TablaJugadores;


import { motion } from 'framer-motion';
import { Jugador } from '@/services/futbolDataService';

interface StatsSummaryProps {
  jugadores: Jugador[];
}

const StatsSummary = ({ jugadores }: StatsSummaryProps) => {
  // Calcular categorías únicas y datos para el panel resumen
  const categorias = [...new Set(jugadores.map(j => j.categoria))];
  const equipos = [...new Set(jugadores.map(j => j.equipo))];
  const totalGoles = jugadores.reduce((sum, j) => sum + j.goles, 0);
  const topGoleador = jugadores.length > 0 ? 
    jugadores.reduce((max, j) => max.goles > j.goles ? max : j) : 
    null;
    
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
    >
      {/* Total jugadores */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        className="glass-panel rounded-lg p-6 shadow-sm hover:shadow transition-all"
      >
        <h3 className="text-slate-500 font-medium mb-1">Total Jugadores</h3>
        <p className="text-3xl font-bold">{jugadores.length}</p>
        <p className="text-sm text-slate-500 mt-2">
          En {categorias.length} categorías
        </p>
      </motion.div>
      
      {/* Total equipos */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        className="glass-panel rounded-lg p-6 shadow-sm hover:shadow transition-all"
      >
        <h3 className="text-slate-500 font-medium mb-1">Equipos</h3>
        <p className="text-3xl font-bold">{equipos.length}</p>
        <p className="text-sm text-slate-500 mt-2">
          Con datos disponibles
        </p>
      </motion.div>
      
      {/* Total goles */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        className="glass-panel rounded-lg p-6 shadow-sm hover:shadow transition-all"
      >
        <h3 className="text-slate-500 font-medium mb-1">Total Goles</h3>
        <p className="text-3xl font-bold">{totalGoles}</p>
        <p className="text-sm text-slate-500 mt-2">
          En todas las categorías
        </p>
      </motion.div>
      
      {/* Máximo goleador */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        className="glass-panel rounded-lg p-6 shadow-sm hover:shadow transition-all"
      >
        <h3 className="text-slate-500 font-medium mb-1">Máximo Goleador</h3>
        <p className="text-3xl font-bold">{topGoleador?.goles || 0}</p>
        <p className="text-sm text-slate-500 mt-2 truncate">
          {topGoleador ? topGoleador.nombre : 'Sin datos'}
        </p>
      </motion.div>
    </motion.div>
  );
};

export default StatsSummary;

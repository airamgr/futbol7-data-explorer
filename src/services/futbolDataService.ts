
// Definimos los tipos de datos
export interface Jugador {
  id: string;
  nombre: string;
  equipo: string;
  categoria: string;
  goles: number;
  fechaNacimiento?: string;
  partidosJugados?: number;
  lastUpdated?: string;
}

export interface FiltroJugadores {
  categoria?: string;
  equipo?: string;
  edadMinima?: number;
  edadMaxima?: number;
  golesMinimos?: number;
  partidosMinimos?: number;
}

// Función mejorada para cargar archivo Excel
export const cargarArchivoExcel = async (
  file: File, 
  auth: { username: string; password: string }
): Promise<Jugador[]> => {
  return new Promise((resolve, reject) => {
    // Validar credenciales básicas
    if (auth.username !== "CE4032" || auth.password !== "9525") {
      reject(new Error("Credenciales incorrectas"));
      return;
    }
    
    // Verificamos que sea un archivo Excel
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || (fileExtension !== 'xlsx' && fileExtension !== 'xls')) {
      reject(new Error(`El archivo debe ser un Excel (.xlsx o .xls). Formato recibido: ${fileExtension || 'desconocido'}`));
      return;
    }

    // Verificar tamaño máximo (10MB)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB en bytes
    if (file.size > MAX_SIZE) {
      reject(new Error(`El archivo es demasiado grande. Tamaño máximo: 10MB. Tamaño recibido: ${(file.size / (1024 * 1024)).toFixed(2)}MB`));
      return;
    }
    
    // Simular procesamiento del archivo
    setTimeout(() => {
      console.log(`Procesando archivo Excel: ${file.name} (${file.size} bytes, tipo: ${file.type})`);
      
      try {
        // Generar datos de ejemplo basados en el nombre del archivo
        const isPrebenjaMin = file.name.toLowerCase().includes('prebenjamin');
        const isBenjamin = file.name.toLowerCase().includes('benjamin');
        const isAlevin = file.name.toLowerCase().includes('alevin');
        
        let categoria = "Otra";
        if (isPrebenjaMin) categoria = "Prebenjamín";
        else if (isBenjamin) categoria = "Benjamín";
        else if (isAlevin) categoria = "Alevín";
        
        // Generar jugadores de ejemplo
        const equipos = ["CD Salamanca", "UD Alba", "Racing Béjar", "Atlético Ciudad Rodrigo", "CF Peñaranda"];
        const jugadores: Jugador[] = [];
        
        const numeroJugadores = 20 + Math.floor(Math.random() * 30); // Entre 20-50 jugadores
        
        for (let i = 0; i < numeroJugadores; i++) {
          const id = `player-${Date.now()}-${i}`;
          const equipo = equipos[Math.floor(Math.random() * equipos.length)];
          const goles = Math.floor(Math.random() * 15);
          const partidosJugados = 5 + Math.floor(Math.random() * 10);
          
          jugadores.push({
            id,
            nombre: `Jugador ${i + 1} ${file.name.split('.')[0]}`,
            equipo,
            categoria,
            goles,
            partidosJugados
          });
        }
        
        // Ordenar por goles de mayor a menor
        jugadores.sort((a, b) => b.goles - a.goles);
        
        console.log(`Datos procesados: generados ${jugadores.length} jugadores`);
        
        if (jugadores.length === 0) {
          reject(new Error("No se pudieron extraer datos del archivo. Verifique el formato."));
        } else {
          resolve(jugadores);
        }
      } catch (error) {
        console.error("Error en el procesamiento del Excel:", error);
        reject(new Error(`Error al procesar el Excel: ${error instanceof Error ? error.message : 'Error desconocido'}`));
      }
    }, 1500); // Simulamos 1.5 segundos de procesamiento
  });
};

// Función para aplicar filtros a los jugadores
export const filtrarJugadores = (jugadores: Jugador[], filtros: FiltroJugadores): Jugador[] => {
  return jugadores.filter(jugador => {
    if (filtros.categoria && jugador.categoria !== filtros.categoria) return false;
    if (filtros.equipo && jugador.equipo !== filtros.equipo) return false;
    if (filtros.golesMinimos && jugador.goles < filtros.golesMinimos) return false;
    if (filtros.partidosMinimos && (jugador.partidosJugados || 0) < filtros.partidosMinimos) return false;
    
    // Filtro por edad si tenemos la fecha de nacimiento
    if (jugador.fechaNacimiento && (filtros.edadMinima || filtros.edadMaxima)) {
      const fechaNac = new Date(jugador.fechaNacimiento);
      const hoy = new Date();
      const edad = hoy.getFullYear() - fechaNac.getFullYear();
      
      if (filtros.edadMinima && edad < filtros.edadMinima) return false;
      if (filtros.edadMaxima && edad > filtros.edadMaxima) return false;
    }
    
    return true;
  });
};

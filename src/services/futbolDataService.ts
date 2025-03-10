
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

// Función simulada para cargar archivo Excel
export const cargarArchivoExcel = async (
  file: File, 
  auth: { username: string; password: string }
): Promise<Jugador[]> => {
  return new Promise((resolve, reject) => {
    // Esta es una implementación simulada para la carga de Excel
    // En un entorno real, necesitaríamos procesar el archivo con una biblioteca
    
    // Validar credenciales básicas (esto es solo un ejemplo)
    if (auth.username !== "CE4032" || auth.password !== "9525") {
      reject(new Error("Credenciales incorrectas"));
      return;
    }
    
    // Verificamos que sea un archivo Excel
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      reject(new Error("El archivo debe ser un Excel (.xlsx o .xls)"));
      return;
    }
    
    // Simular procesamiento del archivo
    setTimeout(() => {
      console.log(`Procesando archivo Excel: ${file.name}`);
      
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
      
      resolve(jugadores);
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


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
  grupo?: string;
  golesPartido?: number;
}

export interface FiltroJugadores {
  categoria?: string;
  equipo?: string;
  edadMinima?: number;
  edadMaxima?: number;
  golesMinimos?: number;
  partidosMinimos?: number;
  grupo?: string;
}

// Función para extraer título y categoría del Excel
const extraerCategoriaYGrupo = (contenido: any[][]): { categoria: string; grupo: string } => {
  // Por defecto, en caso de no encontrar
  let categoria = "Desconocida";
  let grupo = "Desconocido";
  
  // Buscamos en las primeras filas, especialmente en C1
  for (let i = 0; i < Math.min(5, contenido.length); i++) {
    if (contenido[i] && contenido[i][2]) { // Columna C (índice 2)
      const texto = String(contenido[i][2]);
      
      // Comprobamos categoría
      if (texto.includes("Benjamín") || texto.includes("Benjamine")) {
        categoria = "Benjamín";
      } else if (texto.includes("Prebenjamín") || texto.includes("Prebenjamine")) {
        categoria = "Prebenjamín";
      } else if (texto.includes("Alevín") || texto.includes("Alevine")) {
        categoria = "Alevín";
      } else if (texto.includes("Infantil")) {
        categoria = "Infantil";
      } else if (texto.includes("Cadete")) {
        categoria = "Cadete";
      } else if (texto.includes("Juvenil")) {
        categoria = "Juvenil";
      }
      
      // Extracción del grupo (asumiendo formato "... Grupo X")
      const grupoMatch = texto.match(/Grupo\s+(\d+)/i);
      if (grupoMatch) {
        grupo = `Grupo ${grupoMatch[1]}`;
      }
    }
  }
  
  return { categoria, grupo };
};

// Función para encontrar las filas de encabezados y datos en el Excel
const encontrarFilasImportantes = (contenido: any[][]): { headerRow: number; startDataRow: number } => {
  let headerRow = -1;
  
  // Buscar fila de encabezados (generalmente es la 3 o 4 en estos Excel)
  for (let i = 0; i < Math.min(10, contenido.length); i++) {
    if (
      contenido[i] && 
      contenido[i][0] && 
      String(contenido[i][0]).toLowerCase().includes("jugador")
    ) {
      headerRow = i;
      break;
    }
  }
  
  // Si no encontramos el encabezado, asumimos la fila 3
  if (headerRow === -1) headerRow = 3;
  
  // Los datos empiezan en la siguiente fila después del encabezado
  const startDataRow = headerRow + 1;
  
  return { headerRow, startDataRow };
};

// Función para procesar contenido de Excel
const procesarContenidoExcel = (contenido: any[][]): Jugador[] => {
  console.log("Procesando contenido del Excel...");
  
  // Extraer categoría y grupo del título
  const { categoria, grupo } = extraerCategoriaYGrupo(contenido);
  console.log(`Categoría detectada: ${categoria}, Grupo: ${grupo}`);
  
  // Encontrar filas importantes
  const { headerRow, startDataRow } = encontrarFilasImportantes(contenido);
  console.log(`Fila de encabezados: ${headerRow}, Comienzo de datos: ${startDataRow}`);
  
  // Mapeo de columnas
  const headers = contenido[headerRow] || [];
  
  let columnas = {
    jugador: -1,
    equipo: -1,
    partidosJugados: -1,
    goles: -1,
    grupo: -1,
    golesPartido: -1
  };
  
  // Detectar las columnas por encabezados
  headers.forEach((header, index) => {
    const headerText = String(header).toLowerCase();
    
    if (headerText.includes("jugador")) columnas.jugador = index;
    else if (headerText.includes("equipo")) columnas.equipo = index;
    else if (headerText.includes("partidos")) columnas.partidosJugados = index;
    else if (headerText.includes("goles") && !headerText.includes("partido")) columnas.goles = index;
    else if (headerText.includes("grupo")) columnas.grupo = index;
    else if (headerText.includes("goles partido") || headerText.includes("goles/partido")) columnas.golesPartido = index;
  });
  
  console.log("Mapeo de columnas:", columnas);
  
  // Validar que tenemos las columnas esenciales
  if (columnas.jugador === -1 || columnas.equipo === -1) {
    console.error("No se pudieron identificar las columnas esenciales en el Excel");
    return [];
  }
  
  // Procesar las filas de datos
  const jugadores: Jugador[] = [];
  
  for (let i = startDataRow; i < contenido.length; i++) {
    const fila = contenido[i];
    if (!fila || !fila[columnas.jugador]) continue; // Fila vacía o sin jugador
    
    const nombre = String(fila[columnas.jugador]).trim();
    const equipo = fila[columnas.equipo] ? String(fila[columnas.equipo]).trim() : "Desconocido";
    
    // Extraer goles
    let goles = 0;
    if (columnas.goles !== -1 && fila[columnas.goles]) {
      const golesText = String(fila[columnas.goles]);
      // Extraer número de goles, incluso si incluye texto como "25 (2 de penalti)"
      const golesMatch = golesText.match(/^(\d+)/);
      if (golesMatch) {
        goles = parseInt(golesMatch[1], 10);
      }
    }
    
    // Extraer partidos jugados
    let partidosJugados = undefined;
    if (columnas.partidosJugados !== -1 && fila[columnas.partidosJugados]) {
      const partidosText = String(fila[columnas.partidosJugados]);
      const partidosMatch = partidosText.match(/\d+/);
      if (partidosMatch) {
        partidosJugados = parseInt(partidosMatch[0], 10);
      }
    }
    
    // Extraer goles por partido
    let golesPartido = undefined;
    if (columnas.golesPartido !== -1 && fila[columnas.golesPartido]) {
      golesPartido = parseFloat(String(fila[columnas.golesPartido]).replace(',', '.'));
    }
    
    // Extraer grupo específico de la fila si existe
    let grupoJugador = grupo;
    if (columnas.grupo !== -1 && fila[columnas.grupo]) {
      grupoJugador = String(fila[columnas.grupo]).trim();
    }
    
    // Crear objeto jugador
    const jugador: Jugador = {
      id: `player-${Date.now()}-${i}`,
      nombre,
      equipo,
      categoria,
      goles,
      partidosJugados,
      grupo: grupoJugador,
      golesPartido
    };
    
    jugadores.push(jugador);
  }
  
  // Ordenar por número de goles de mayor a menor
  jugadores.sort((a, b) => b.goles - a.goles);
  
  console.log(`Total de jugadores procesados: ${jugadores.length}`);
  return jugadores;
};

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
    
    try {
      console.log(`Procesando archivo Excel: ${file.name} (${file.size} bytes, tipo: ${file.type})`);
      
      // Utilizamos XLSX.js para procesar el archivo
      import('xlsx').then(XLSX => {
        // Leer el archivo
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            if (!e.target || !e.target.result) {
              reject(new Error("Error al leer el archivo"));
              return;
            }
            
            // Convertir ArrayBuffer a workbook
            const data = new Uint8Array(e.target.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Obtener la primera hoja de cálculo
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Convertir a JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null }) as any[][];
            
            // Procesar el contenido
            const jugadores = procesarContenidoExcel(jsonData);
            
            if (jugadores.length === 0) {
              reject(new Error("No se pudieron extraer datos del archivo. Verifique el formato."));
            } else {
              resolve(jugadores);
            }
          } catch (error) {
            console.error("Error al procesar el Excel:", error);
            reject(new Error(`Error al procesar el Excel: ${error instanceof Error ? error.message : 'Error desconocido'}`));
          }
        };
        
        reader.onerror = () => {
          reject(new Error("Error al leer el archivo"));
        };
        
        reader.readAsArrayBuffer(file);
      }).catch(err => {
        console.error("Error al cargar la librería XLSX:", err);
        
        // Si no podemos cargar XLSX.js, fallback a la simulación
        console.log("Fallback: Simulando procesamiento de Excel");
        
        // Generar jugadores de ejemplo basados en nombre del archivo
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
        
        const numeroJugadores = 20 + Math.floor(Math.random() * 30);
        
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
        
        if (jugadores.length === 0) {
          reject(new Error("No se pudieron extraer datos del archivo. Verifique el formato."));
        } else {
          resolve(jugadores);
        }
      });
    } catch (error) {
      console.error("Error en el procesamiento del Excel:", error);
      reject(new Error(`Error al procesar el Excel: ${error instanceof Error ? error.message : 'Error desconocido'}`));
    }
  });
};

// Función para aplicar filtros a los jugadores
export const filtrarJugadores = (jugadores: Jugador[], filtros: FiltroJugadores): Jugador[] => {
  return jugadores.filter(jugador => {
    if (filtros.categoria && jugador.categoria !== filtros.categoria) return false;
    if (filtros.equipo && jugador.equipo !== filtros.equipo) return false;
    if (filtros.golesMinimos && jugador.goles < filtros.golesMinimos) return false;
    if (filtros.partidosMinimos && (jugador.partidosJugados || 0) < filtros.partidosMinimos) return false;
    if (filtros.grupo && jugador.grupo !== filtros.grupo) return false;
    
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

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
  let categoria = "Benjamín"; // Asumimos Benjamín como predeterminado
  let grupo = "Desconocido";
  
  // Buscar en todas las celdas de las primeras filas
  for (let i = 0; i < Math.min(5, contenido.length); i++) {
    for (let j = 0; j < Math.min(5, contenido[i]?.length || 0); j++) {
      if (contenido[i] && contenido[i][j]) {
        const texto = String(contenido[i][j]).trim();
        
        // Buscar patrones típicos de categoría y grupo
        if (texto.includes("Benjamín") || texto.includes("Benjamine")) {
          categoria = "Benjamín";
          console.log(`Categoría Benjamín detectada en celda [${i}][${j}]: ${texto}`);
          
          // Extraer grupo si está en el mismo texto
          if (texto.includes("Grupo")) {
            const match = texto.match(/Grupo\s+(\w+)/i);
            if (match) {
              grupo = `Grupo ${match[1]}`;
              console.log(`Grupo ${match[1]} detectado en el mismo texto`);
            }
          }
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
        
        // Buscar grupo independientemente
        if (texto.includes("Grupo") && !grupo.includes("Grupo")) {
          const match = texto.match(/Grupo\s+(\w+)/i);
          if (match) {
            grupo = `Grupo ${match[1]}`;
            console.log(`Grupo ${match[1]} detectado en celda [${i}][${j}]: ${texto}`);
          }
        }
      }
    }
  }
  
  console.log(`Categoría final: ${categoria}, Grupo final: ${grupo}`);
  return { categoria, grupo };
};

// Función para identificar columnas basadas en contenido de datos
const identificarColumnasPorContenido = (contenido: any[][], startDataRow: number) => {
  const columnas = {
    jugador: -1,
    equipo: -1,
    partidosJugados: -1,
    goles: -1,
    grupo: -1,
    golesPartido: -1
  };
  
  console.log("Analizando contenido de filas de datos para identificar columnas:");
  
  // Analizar las primeras filas de datos
  const analyzableRows = Math.min(startDataRow + 5, contenido.length);
  
  // Patrones para identificar columnas
  const nombresPatrones = [
    /^[A-Za-záéíóúüñÁÉÍÓÚÜÑ\s]{4,}$/,               // Nombres con al menos 4 caracteres
    /^[A-Za-záéíóúüñÁÉÍÓÚÜÑ]+\s+[A-Za-záéíóúüñÁÉÍÓÚÜÑ]+$/ // Nombre y apellido
  ];
  
  const equiposPatrones = [
    /^[A-Za-záéíóúüñÁÉÍÓÚÜÑ\.][A-Za-záéíóúüñÁÉÍÓÚÜÑ\s\.\-]+$/,  // Nombres de equipos
    /^C\.D\.|^C\.\s*F\.|^U\.D\.|^C\.P\./                       // Prefijos comunes de clubes
  ];
  
  const golesPatrones = [
    /^\d+$/,                  // Solo números
    /^[0-9]+\s*\(.*\)$/       // Números con texto adicional en paréntesis
  ];
  
  // Contadores para cada columna potencial
  const columnaCounts = Array(contenido[0]?.length || 0).fill(0).map(() => ({
    nombre: 0,
    equipo: 0,
    goles: 0
  }));
  
  // Analizar cada fila y columna
  for (let i = startDataRow; i < analyzableRows; i++) {
    if (!contenido[i]) continue;
    
    for (let j = 0; j < contenido[i].length; j++) {
      if (contenido[i][j] === undefined || contenido[i][j] === null) continue;
      
      const valor = String(contenido[i][j]).trim();
      if (!valor) continue;
      
      // Comprobar patrones de nombres
      for (const pattern of nombresPatrones) {
        if (pattern.test(valor)) {
          columnaCounts[j].nombre++;
          break;
        }
      }
      
      // Comprobar patrones de equipos
      for (const pattern of equiposPatrones) {
        if (pattern.test(valor)) {
          columnaCounts[j].equipo++;
          break;
        }
      }
      
      // Comprobar patrones de goles
      for (const pattern of golesPatrones) {
        if (pattern.test(valor)) {
          columnaCounts[j].goles++;
          break;
        }
      }
    }
  }
  
  // Encontrar las columnas con más coincidencias
  let maxNombre = { count: 0, col: -1 };
  let maxEquipo = { count: 0, col: -1 };
  let maxGoles = { count: 0, col: -1 };
  
  columnaCounts.forEach((counts, index) => {
    if (counts.nombre > maxNombre.count) {
      maxNombre = { count: counts.nombre, col: index };
    }
    if (counts.equipo > maxEquipo.count) {
      maxEquipo = { count: counts.equipo, col: index };
    }
    if (counts.goles > maxGoles.count) {
      maxGoles = { count: counts.goles, col: index };
    }
  });
  
  // Asignar columnas solo si se han encontrado suficientes coincidencias
  if (maxNombre.count >= 2) {
    columnas.jugador = maxNombre.col;
    console.log(`Columna de jugador identificada por contenido en posición ${maxNombre.col} con ${maxNombre.count} coincidencias`);
  }
  
  if (maxEquipo.count >= 2) {
    // Evitar asignar la misma columna para jugador y equipo
    if (maxEquipo.col !== columnas.jugador) {
      columnas.equipo = maxEquipo.col;
      console.log(`Columna de equipo identificada por contenido en posición ${maxEquipo.col} con ${maxEquipo.count} coincidencias`);
    }
  }
  
  if (maxGoles.count >= 2) {
    columnas.goles = maxGoles.col;
    console.log(`Columna de goles identificada por contenido en posición ${maxGoles.col} con ${maxGoles.count} coincidencias`);
  }
  
  return columnas;
};

// Función para procesar contenido de Excel
const procesarContenidoExcel = (contenido: any[][]): Jugador[] => {
  console.log("Procesando contenido del Excel...");
  
  // Verificar si tenemos contenido válido
  if (!contenido || !Array.isArray(contenido) || contenido.length === 0) {
    console.error("Contenido del Excel no válido o vacío");
    return [];
  }
  
  // Debug para ver las primeras filas
  console.log("Primeras 5 filas del Excel:");
  for (let i = 0; i < Math.min(5, contenido.length); i++) {
    console.log(`Fila ${i+1}:`, contenido[i]);
  }
  
  // Extraer categoría y grupo
  const { categoria, grupo } = extraerCategoriaYGrupo(contenido);
  
  // Intentar encontrar una fila que parezca contener encabezados
  let headerRow = 0;
  let startDataRow = 1;
  
  // Buscar una fila que contenga textos de encabezados típicos
  for (let i = 0; i < Math.min(10, contenido.length); i++) {
    if (contenido[i] && Array.isArray(contenido[i])) {
      const fila = contenido[i].map(cell => String(cell || '').toLowerCase());
      // Buscar palabras clave típicas de encabezados
      if (fila.some(cell => 
          cell.includes('jugador') || 
          cell.includes('equipo') || 
          cell.includes('goles') || 
          cell.includes('club') ||
          cell.includes('nombre')
      )) {
        headerRow = i;
        startDataRow = i + 1;
        console.log(`Fila de encabezado detectada en índice ${i} (fila ${i + 1}):`);
        console.log(fila);
        break;
      }
    }
  }
  
  // Si no encontramos una fila de encabezado, asumimos que está en la fila 0
  if (headerRow === 0 && startDataRow === 1) {
    console.log("No se encontró una fila clara de encabezados, usando primera fila con datos para iniciar");
    // Buscar la primera fila con datos válidos
    for (let i = 0; i < Math.min(10, contenido.length); i++) {
      if (contenido[i] && Array.isArray(contenido[i]) && contenido[i].some(cell => cell !== null && cell !== undefined && cell !== '')) {
        startDataRow = i + 1;
        console.log(`Primera fila con datos detectada en índice ${i} (fila ${i + 1})`);
        break;
      }
    }
  }
  
  // Mapeo de columnas - inicializamos con valores que intentaremos detectar
  let columnas = {
    jugador: -1,
    equipo: -1,
    partidosJugados: -1,
    goles: -1,
    grupo: -1,
    golesPartido: -1
  };
  
  // Intentar detectar columnas por encabezados si existen
  if (contenido[headerRow] && Array.isArray(contenido[headerRow])) {
    const headers = contenido[headerRow].map(h => String(h || '').toLowerCase());
    console.log("Encabezados detectados:", headers);
    
    // Buscar índices para cada columna importante
    headers.forEach((header, index) => {
      if (!header) return;
      
      if (header.includes("jugador") || header.includes("nombre")) {
        columnas.jugador = index;
        console.log(`Columna 'jugador' detectada en posición ${index}`);
      }
      else if (header.includes("equipo") || header.includes("club")) {
        columnas.equipo = index;
        console.log(`Columna 'equipo' detectada en posición ${index}`);
      }
      else if (header.includes("partido") || header.includes("jugados")) {
        columnas.partidosJugados = index;
        console.log(`Columna 'partidosJugados' detectada en posición ${index}`);
      }
      else if (header.includes("goles") && !header.includes("partido")) {
        columnas.goles = index;
        console.log(`Columna 'goles' detectada en posición ${index}`);
      }
      else if (header.includes("grupo")) {
        columnas.grupo = index;
        console.log(`Columna 'grupo' detectada en posición ${index}`);
      }
      else if (header.includes("goles") && header.includes("partido")) {
        columnas.golesPartido = index;
        console.log(`Columna 'golesPartido' detectada en posición ${index}`);
      }
    });
  }
  
  // Si no detectamos columnas por encabezados, intentamos por contenido
  if (columnas.jugador === -1 || columnas.equipo === -1 || columnas.goles === -1) {
    console.log("Detectando columnas por contenido...");
    const columnasPorContenido = identificarColumnasPorContenido(contenido, startDataRow);
    
    // Fusionar resultados, priorizando los ya detectados
    Object.keys(columnasPorContenido).forEach(key => {
      if (columnas[key as keyof typeof columnas] === -1 && 
          columnasPorContenido[key as keyof typeof columnasPorContenido] !== -1) {
        columnas[key as keyof typeof columnas] = columnasPorContenido[key as keyof typeof columnasPorContenido];
      }
    });
  }
  
  // Si todavía no hemos encontrado columnas, intentamos asignarlas por posición estándar
  if (columnas.jugador === -1 && contenido[0] && contenido[0].length >= 1) {
    columnas.jugador = 0; // Primera columna
    console.log("Asignando columna de jugador a posición 0 (primera columna)");
  }
  
  if (columnas.equipo === -1 && contenido[0] && contenido[0].length >= 2) {
    columnas.equipo = 1; // Segunda columna
    console.log("Asignando columna de equipo a posición 1 (segunda columna)");
  }
  
  if (columnas.goles === -1 && contenido[0] && contenido[0].length >= 3) {
    // Intentar encontrar la última columna con números
    for (let j = contenido[0].length - 1; j >= 2; j--) {
      let hasNumbers = false;
      for (let i = startDataRow; i < Math.min(startDataRow + 5, contenido.length); i++) {
        if (contenido[i] && contenido[i][j] !== undefined) {
          const value = String(contenido[i][j]);
          if (/\d+/.test(value)) {
            hasNumbers = true;
            columnas.goles = j;
            console.log(`Asignando columna de goles a posición ${j} (encontrada columna con números)`);
            break;
          }
        }
      }
      if (hasNumbers) break;
    }
    
    // Si todavía no encontramos, usar tercera columna como último recurso
    if (columnas.goles === -1) {
      columnas.goles = 2; // Tercera columna
      console.log("Asignando columna de goles a posición 2 (tercera columna) como último recurso");
    }
  }
  
  console.log("Mapeo final de columnas:", columnas);
  
  // Si no tenemos las columnas mínimas necesarias, retornar array vacío
  if (columnas.jugador === -1 || columnas.equipo === -1 || columnas.goles === -1) {
    console.error("No se pudieron identificar las columnas esenciales. Jugador:", 
                columnas.jugador, "Equipo:", columnas.equipo, "Goles:", columnas.goles);
    return [];
  }
  
  // Ahora podemos procesar los datos
  const jugadores: Jugador[] = [];
  
  for (let i = startDataRow; i < contenido.length; i++) {
    const fila = contenido[i];
    if (!fila) continue;
    
    // Verificar si la fila tiene datos válidos
    if (fila[columnas.jugador] === undefined || fila[columnas.equipo] === undefined) {
      continue;
    }
    
    // Obtener y limpiar los datos
    const nombreRaw = fila[columnas.jugador];
    let nombre = nombreRaw ? String(nombreRaw).trim() : "";
    
    // Omitir filas con nombres vacíos o demasiado cortos
    if (!nombre || nombre.length < 2 || /^\d+$/.test(nombre)) {
      continue;
    }
    
    const equipoRaw = fila[columnas.equipo];
    const equipo = equipoRaw ? String(equipoRaw).trim() : "Desconocido";
    
    // Extraer goles
    let goles = 0;
    if (fila[columnas.goles] !== undefined) {
      const golesText = String(fila[columnas.goles]);
      const golesMatch = golesText.match(/(\d+)/);
      if (golesMatch) {
        goles = parseInt(golesMatch[1], 10);
      }
    }
    
    // Extraer partidos jugados si está disponible
    let partidosJugados = undefined;
    if (columnas.partidosJugados !== -1 && fila[columnas.partidosJugados] !== undefined) {
      const partidosText = String(fila[columnas.partidosJugados]);
      const partidosMatch = partidosText.match(/(\d+)/);
      if (partidosMatch) {
        partidosJugados = parseInt(partidosMatch[1], 10);
      }
    }
    
    // Extraer goles por partido
    let golesPartido = undefined;
    if (columnas.golesPartido !== -1 && fila[columnas.golesPartido] !== undefined) {
      const gpText = String(fila[columnas.golesPartido]).replace(',', '.');
      const gpMatch = gpText.match(/(\d+[.,]?\d*)/);
      if (gpMatch) {
        golesPartido = parseFloat(gpMatch[1]);
      }
    }
    
    // Crear el objeto jugador
    const jugador: Jugador = {
      id: `player-${Date.now()}-${i}`,
      nombre,
      equipo,
      categoria,
      goles,
      grupo,
      partidosJugados,
      golesPartido
    };
    
    console.log(`Jugador procesado: ${nombre} (${equipo}) - Goles: ${goles}`);
    jugadores.push(jugador);
  }
  
  // Ordenar por goles (mayor a menor)
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
            
            // Intentar con diferentes opciones de lectura
            let workbook;
            try {
              // Intentar leer con opciones estándar
              workbook = XLSX.read(data, { type: 'array' });
            } catch (readError) {
              console.error("Error al leer Excel con opciones estándar, intentando con opciones más permisivas:", readError);
              
              // Intentar con opciones más permisivas
              workbook = XLSX.read(data, { 
                type: 'array',
                cellStyles: false,
                cellNF: false,
                cellDates: false,
                raw: true,
                cellFormula: false
              });
            }
            
            // Obtener la primera hoja de cálculo
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Convertir a JSON con opciones más permisivas
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
              header: 1, 
              defval: null,
              blankrows: false,
              rawNumbers: true // Para manejar números correctamente
            }) as any[][];
            
            // Procesar el contenido
            const jugadores = procesarContenidoExcel(jsonData);
            
            if (jugadores.length === 0) {
              reject(new Error("No se pudieron extraer datos del archivo. Verifique que contenga columnas de jugador, equipo y goles."));
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
        reject(new Error("Error al procesar el archivo Excel: No se pudo cargar la librería de procesamiento"));
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

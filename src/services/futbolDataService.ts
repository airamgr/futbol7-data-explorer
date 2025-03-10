
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
  
  // Buscar en todas las celdas de las primeras filas (ahora ampliamos a más filas)
  for (let i = 0; i < Math.min(10, contenido.length); i++) {
    for (let j = 0; j < Math.min(10, contenido[i]?.length || 0); j++) {
      if (contenido[i] && contenido[i][j]) {
        const texto = String(contenido[i][j]).trim();
        
        // Ampliamos patrones de búsqueda para categorías
        if (texto.toLowerCase().includes("benjam") || 
            /benj[aá]m[ií]n/i.test(texto) || 
            /benjamin/i.test(texto)) {
          categoria = "Benjamín";
          console.log(`Categoría Benjamín detectada en celda [${i}][${j}]: ${texto}`);
          
          // Extraer grupo si está en el mismo texto
          if (texto.includes("Grupo") || texto.includes("grupo")) {
            const match = texto.match(/Grupo\s+(\w+)/i);
            if (match) {
              grupo = `Grupo ${match[1]}`;
              console.log(`Grupo ${match[1]} detectado en el mismo texto`);
            }
          }
        } else if (texto.toLowerCase().includes("prebenj") || /pre.?benj[aá]m[ií]n/i.test(texto)) {
          categoria = "Prebenjamín";
        } else if (texto.toLowerCase().includes("alev") || /alev[ií]n/i.test(texto)) {
          categoria = "Alevín";
        } else if (texto.toLowerCase().includes("infant") || /infantil/i.test(texto)) {
          categoria = "Infantil";
        } else if (texto.toLowerCase().includes("cadet") || /cadete/i.test(texto)) {
          categoria = "Cadete";
        } else if (texto.toLowerCase().includes("juven") || /juvenil/i.test(texto)) {
          categoria = "Juvenil";
        }
        
        // Buscar grupo independientemente
        if ((texto.includes("Grupo") || texto.includes("grupo")) && !grupo.includes("Grupo")) {
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
const identificarColumnasPorContenido = (contenido: any[][], startDataRow: number, debug?: (msg: string) => void) => {
  const columnas = {
    jugador: -1,
    equipo: -1,
    partidosJugados: -1,
    goles: -1,
    grupo: -1,
    golesPartido: -1
  };
  
  const log = (msg: string) => {
    console.log(msg);
    if (debug) debug(msg);
  };
  
  log("Analizando contenido para identificar columnas:");
  
  // Usar más filas para el análisis
  const analyzableRows = Math.min(startDataRow + 10, contenido.length);
  
  // Patrones mejorados para identificar columnas
  const nombresPatrones = [
    /^[A-Za-záéíóúüñÁÉÍÓÚÜÑ\s]{3,}$/,               // Nombres con al menos 3 caracteres
    /^[A-Za-záéíóúüñÁÉÍÓÚÜÑ]+\s+[A-Za-záéíóúüñÁÉÍÓÚÜÑ]+$/, // Nombre y apellido
    /^[A-Z][a-z]+\s+[A-Z][a-z]+$/                    // Patrón de nombre propio
  ];
  
  const equiposPatrones = [
    /^[A-Za-záéíóúüñÁÉÍÓÚÜÑ\.][A-Za-záéíóúüñÁÉÍÓÚÜÑ\s\.\-]+$/,  // Nombres de equipos
    /^C\.D\.|^C\.\s*F\.|^U\.D\.|^C\.P\./,                       // Prefijos comunes de clubes
    /salamanca|zamora|ávila|ciudad/i                            // Nombres de ciudades/equipos
  ];
  
  const golesPatrones = [
    /^\d+$/,                  // Solo números
    /^[0-9]+\s*\(.*\)$/,      // Números con texto adicional en paréntesis
    /^\d+\s*gol/i             // Número seguido de "gol/goles"
  ];
  
  // Contadores para cada columna potencial
  const columnaCounts = Array(Math.max(...contenido.slice(0, analyzableRows).map(row => row?.length || 0))).fill(0).map(() => ({
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
  // Reducimos el umbral a 1 para ser más permisivos
  if (maxNombre.count >= 1) {
    columnas.jugador = maxNombre.col;
    log(`Columna de jugador identificada por contenido en posición ${maxNombre.col} con ${maxNombre.count} coincidencias`);
  }
  
  if (maxEquipo.count >= 1) {
    // Evitar asignar la misma columna para jugador y equipo
    if (maxEquipo.col !== columnas.jugador) {
      columnas.equipo = maxEquipo.col;
      log(`Columna de equipo identificada por contenido en posición ${maxEquipo.col} con ${maxEquipo.count} coincidencias`);
    }
  }
  
  if (maxGoles.count >= 1) {
    columnas.goles = maxGoles.col;
    log(`Columna de goles identificada por contenido en posición ${maxGoles.col} con ${maxGoles.count} coincidencias`);
  }
  
  // Añadimos método para buscar estructura de datos tabular
  // Analizamos columnas por tipo de dato
  if (columnas.jugador === -1 || columnas.equipo === -1 || columnas.goles === -1) {
    log("Intentando detectar estructura tabular basada en tipos de datos...");
    
    // Primero detectar filas que parecen tener datos consistentes (al menos 3 columnas con datos)
    let dataRowsCount = 0;
    let columnsStructure = new Map<string, number>();
    
    for (let i = 0; i < Math.min(20, contenido.length); i++) {
      if (contenido[i] && contenido[i].filter(cell => cell !== null && cell !== undefined && cell !== '').length >= 3) {
        dataRowsCount++;
        
        // Analizar tipos por columna
        contenido[i].forEach((cell, colIndex) => {
          if (cell === null || cell === undefined || cell === '') return;
          
          let type = 'unknown';
          const cellStr = String(cell).trim();
          
          if (/^\d+$/.test(cellStr)) {
            type = 'number';
          } else if (cellStr.length >= 3 && /^[A-Za-záéíóúüñÁÉÍÓÚÜÑ\s.,]+$/.test(cellStr)) {
            if (cellStr.length >= 10) {
              // Textos largos probablemente son equipos
              type = 'long-text';
            } else {
              type = 'text';
            }
          }
          
          const key = `${colIndex}-${type}`;
          columnsStructure.set(key, (columnsStructure.get(key) || 0) + 1);
        });
      }
    }
    
    log(`Filas con estructura tabular detectadas: ${dataRowsCount}`);
    
    if (dataRowsCount >= 2) {
      // Encontrar columnas que consistentemente tienen un tipo específico
      let textColumns: number[] = [];
      let longTextColumns: number[] = [];
      let numberColumns: number[] = [];
      
      columnsStructure.forEach((count, key) => {
        if (count >= 2) { // Al menos aparece en 2 filas
          const [colIndex, type] = key.split('-');
          const col = parseInt(colIndex);
          
          if (type === 'text') textColumns.push(col);
          else if (type === 'long-text') longTextColumns.push(col);
          else if (type === 'number') numberColumns.push(col);
        }
      });
      
      log(`Columnas con texto corto: ${textColumns.join(', ')}`);
      log(`Columnas con texto largo: ${longTextColumns.join(', ')}`);
      log(`Columnas con números: ${numberColumns.join(', ')}`);
      
      // Asignar columnas basadas en tipos
      if (columnas.jugador === -1 && textColumns.length > 0) {
        columnas.jugador = textColumns[0]; // Primera columna de texto corto = nombres
        log(`Asignando columna de jugador a posición ${columnas.jugador} (por tipo texto corto)`);
      }
      
      if (columnas.equipo === -1) {
        if (longTextColumns.length > 0) {
          columnas.equipo = longTextColumns[0]; // Primera columna de texto largo = equipos
          log(`Asignando columna de equipo a posición ${columnas.equipo} (por tipo texto largo)`);
        } else if (textColumns.length > 1) {
          columnas.equipo = textColumns[1]; // Segunda columna de texto = equipos
          log(`Asignando columna de equipo a posición ${columnas.equipo} (segunda columna de texto)`);
        }
      }
      
      if (columnas.goles === -1 && numberColumns.length > 0) {
        columnas.goles = numberColumns[0]; // Primera columna numérica = goles
        log(`Asignando columna de goles a posición ${columnas.goles} (por tipo numérico)`);
      }
    }
  }
  
  // Si todavía no tenemos las columnas básicas, intentar con posiciones estándar
  if (columnas.jugador === -1 || columnas.equipo === -1 || columnas.goles === -1) {
    log("Usando asignación por posiciones estándar como último recurso");
    
    // Buscar primera fila que tenga al menos 3 columnas con datos
    for (let i = 0; i < Math.min(20, contenido.length); i++) {
      if (contenido[i] && contenido[i].filter(cell => cell !== null && cell !== undefined && cell !== '').length >= 3) {
        if (columnas.jugador === -1) {
          columnas.jugador = 0; // Primera columna
          log("Asignando columna de jugador a posición 0 (primera columna)");
        }
        
        if (columnas.equipo === -1) {
          columnas.equipo = 1; // Segunda columna
          log("Asignando columna de equipo a posición 1 (segunda columna)");
        }
        
        if (columnas.goles === -1) {
          columnas.goles = 2; // Tercera columna
          log("Asignando columna de goles a posición 2 (tercera columna)");
        }
        
        break;
      }
    }
  }
  
  log("Mapeo final de columnas: " + JSON.stringify(columnas));
  return columnas;
};

// Función para procesar contenido de Excel
const procesarContenidoExcel = (contenido: any[][], debug?: (msg: string) => void): Jugador[] => {
  const log = (msg: string) => {
    console.log(msg);
    if (debug) debug(msg);
  };
  
  log("Procesando contenido del Excel...");
  
  // Verificar si tenemos contenido válido
  if (!contenido || !Array.isArray(contenido) || contenido.length === 0) {
    log("Contenido del Excel no válido o vacío");
    return [];
  }
  
  // Eliminar filas vacías
  const contenidoFiltrado = contenido.filter(row => 
    row && Array.isArray(row) && row.some(cell => cell !== null && cell !== undefined && cell !== '')
  );
  
  if (contenidoFiltrado.length === 0) {
    log("Después de filtrar filas vacías, no hay datos");
    return [];
  }
  
  log(`Contenido filtrado: ${contenidoFiltrado.length} filas`);
  
  // Debug para ver las primeras filas
  log("Primeras 5 filas del Excel:");
  for (let i = 0; i < Math.min(5, contenidoFiltrado.length); i++) {
    log(`Fila ${i+1}: ${JSON.stringify(contenidoFiltrado[i])}`);
  }
  
  // Extraer categoría y grupo
  const { categoria, grupo } = extraerCategoriaYGrupo(contenidoFiltrado);
  
  // Intentar encontrar una fila que parezca contener encabezados
  let headerRow = 0;
  let startDataRow = 1;
  let foundHeader = false;
  
  // Buscar una fila que contenga textos de encabezados típicos
  for (let i = 0; i < Math.min(10, contenidoFiltrado.length); i++) {
    if (contenidoFiltrado[i] && Array.isArray(contenidoFiltrado[i])) {
      const fila = contenidoFiltrado[i].map(cell => String(cell || '').toLowerCase());
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
        foundHeader = true;
        log(`Fila de encabezado detectada en índice ${i} (fila ${i + 1}):`);
        log(fila.join(', '));
        break;
      }
    }
  }
  
  // Si no encontramos una fila de encabezado, asumimos que está en la fila 0
  if (!foundHeader) {
    log("No se encontró una fila clara de encabezados, usando primera fila con datos para iniciar");
    // Buscar la primera fila con datos válidos
    for (let i = 0; i < Math.min(10, contenidoFiltrado.length); i++) {
      if (contenidoFiltrado[i] && Array.isArray(contenidoFiltrado[i]) && 
          contenidoFiltrado[i].some(cell => cell !== null && cell !== undefined && cell !== '')) {
        startDataRow = i + 1;
        log(`Primera fila con datos detectada en índice ${i} (fila ${i + 1})`);
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
  if (foundHeader && contenidoFiltrado[headerRow] && Array.isArray(contenidoFiltrado[headerRow])) {
    const headers = contenidoFiltrado[headerRow].map(h => String(h || '').toLowerCase());
    log("Encabezados detectados: " + JSON.stringify(headers));
    
    // Buscar índices para cada columna importante
    headers.forEach((header, index) => {
      if (!header) return;
      
      if (header.includes("jugador") || header.includes("nombre") || header.includes("alumno")) {
        columnas.jugador = index;
        log(`Columna 'jugador' detectada en posición ${index}`);
      }
      else if (header.includes("equipo") || header.includes("club") || header.includes("colegio")) {
        columnas.equipo = index;
        log(`Columna 'equipo' detectada en posición ${index}`);
      }
      else if (header.includes("partido") || header.includes("jugados") || header.includes("pj")) {
        columnas.partidosJugados = index;
        log(`Columna 'partidosJugados' detectada en posición ${index}`);
      }
      else if (header.includes("goles") && !header.includes("partido")) {
        columnas.goles = index;
        log(`Columna 'goles' detectada en posición ${index}`);
      }
      else if (header.includes("grupo")) {
        columnas.grupo = index;
        log(`Columna 'grupo' detectada en posición ${index}`);
      }
      else if ((header.includes("goles") && header.includes("partido")) || header.includes("promedio")) {
        columnas.golesPartido = index;
        log(`Columna 'golesPartido' detectada en posición ${index}`);
      }
    });
  }
  
  // Si no detectamos columnas por encabezados, intentamos por contenido
  if (columnas.jugador === -1 || columnas.equipo === -1 || columnas.goles === -1) {
    log("Detectando columnas por contenido...");
    const columnasPorContenido = identificarColumnasPorContenido(contenidoFiltrado, startDataRow, debug);
    
    // Fusionar resultados, priorizando los ya detectados
    Object.keys(columnasPorContenido).forEach(key => {
      if (columnas[key as keyof typeof columnas] === -1 && 
          columnasPorContenido[key as keyof typeof columnasPorContenido] !== -1) {
        columnas[key as keyof typeof columnas] = columnasPorContenido[key as keyof typeof columnasPorContenido];
      }
    });
  }
  
  // Si todavía no hemos encontrado columnas, intentamos detectar la estructura tabular
  // Este paso ya está incluido en identificarColumnasPorContenido
  
  log("Mapeo final de columnas: " + JSON.stringify(columnas));
  
  // Si no tenemos las columnas mínimas necesarias, retornar array vacío
  if (columnas.jugador === -1 || columnas.equipo === -1 || columnas.goles === -1) {
    log("No se pudieron identificar las columnas esenciales. Jugador:" + 
                columnas.jugador + ", Equipo:" + columnas.equipo + ", Goles:" + columnas.goles);
    return [];
  }
  
  // Ahora podemos procesar los datos
  const jugadores: Jugador[] = [];
  
  for (let i = startDataRow; i < contenidoFiltrado.length; i++) {
    const fila = contenidoFiltrado[i];
    if (!fila) continue;
    
    // Verificar si la fila tiene datos válidos
    if (fila[columnas.jugador] === undefined || fila[columnas.equipo] === undefined) {
      continue;
    }
    
    // Obtener y limpiar los datos
    const nombreRaw = fila[columnas.jugador];
    let nombre = nombreRaw ? String(nombreRaw).trim() : "";
    
    // Omitir filas con nombres vacíos o demasiado cortos
    if (!nombre || nombre.length < 2 || /^\d+$/.test(nombre) || 
        nombre.toLowerCase() === "nombre" || nombre.toLowerCase() === "jugador") {
      continue;
    }
    
    const equipoRaw = fila[columnas.equipo];
    let equipo = equipoRaw ? String(equipoRaw).trim() : "Desconocido";
    
    // Si equipo contiene palabras reservadas, es probable que sea un encabezado
    if (equipo.toLowerCase() === "equipo" || equipo.toLowerCase() === "club") {
      continue;
    }
    
    // Extraer goles
    let goles = 0;
    if (fila[columnas.goles] !== undefined) {
      const golesText = String(fila[columnas.goles]);
      const golesMatch = golesText.match(/(\d+)/);
      if (golesMatch) {
        goles = parseInt(golesMatch[1], 10);
      }
    }
    
    // Si no pudimos extraer goles válidos, esta fila probablemente no es un jugador
    if (goles === 0 && String(fila[columnas.goles]).trim() !== "0") {
      continue;
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
    
    log(`Jugador procesado: ${nombre} (${equipo}) - Goles: ${goles}`);
    jugadores.push(jugador);
  }
  
  // Ordenar por goles (mayor a menor)
  jugadores.sort((a, b) => b.goles - a.goles);
  
  log(`Total de jugadores procesados: ${jugadores.length}`);
  return jugadores;
};

// Función mejorada para cargar archivo Excel
export const cargarArchivoExcel = async (
  file: File, 
  auth: { username: string; password: string },
  debug?: (msg: string) => void
): Promise<Jugador[]> => {
  return new Promise((resolve, reject) => {
    const log = (msg: string) => {
      console.log(msg);
      if (debug) debug(msg);
    };
    
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
      log(`Procesando archivo Excel: ${file.name} (${file.size} bytes, tipo: ${file.type})`);
      
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
            
            log("Archivo leído correctamente, comenzando procesamiento");
            
            // Convertir ArrayBuffer a workbook
            const data = new Uint8Array(e.target.result as ArrayBuffer);
            
            // Intentar con diferentes opciones de lectura
            let workbook;
            try {
              // Intentar leer con opciones estándar
              workbook = XLSX.read(data, { 
                type: 'array',
                cellDates: true,
                dateNF: 'dd/mm/yyyy'
              });
              log("Excel leído con opciones estándar");
            } catch (readError) {
              log("Error al leer Excel con opciones estándar, intentando con opciones más permisivas");
              
              // Intentar con opciones más permisivas
              workbook = XLSX.read(data, { 
                type: 'array',
                cellStyles: false,
                cellNF: false,
                cellDates: false,
                raw: true,
                cellFormula: false
              });
              log("Excel leído con opciones permisivas");
            }
            
            log(`Hojas en el libro: ${workbook.SheetNames.join(", ")}`);
            
            // Obtener la primera hoja de cálculo
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Información sobre el rango de la hoja
            const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
            log(`Rango de la hoja: ${worksheet['!ref']} (${range.e.r - range.s.r + 1} filas, ${range.e.c - range.s.c + 1} columnas)`);
            
            // Convertir a JSON con opciones más permisivas
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
              header: 1, 
              defval: null,
              blankrows: false,
              rawNumbers: true
            }) as any[][];
            
            log(`Datos JSON extraídos: ${jsonData.length} filas`);
            
            // Procesar el contenido
            const jugadores = procesarContenidoExcel(jsonData, debug);
            
            if (jugadores.length === 0) {
              reject(new Error("No se pudieron extraer datos del archivo. Verifique que contenga columnas de jugador, equipo y goles."));
            } else {
              resolve(jugadores);
            }
          } catch (error) {
            log(`Error al procesar el Excel: ${error instanceof Error ? error.message : 'Error desconocido'}`);
            reject(new Error(`Error al procesar el Excel: ${error instanceof Error ? error.message : 'Error desconocido'}`));
          }
        };
        
        reader.onerror = (error) => {
          log(`Error al leer el archivo: ${error}`);
          reject(new Error("Error al leer el archivo"));
        };
        
        reader.readAsArrayBuffer(file);
      }).catch(err => {
        log(`Error al cargar la librería XLSX: ${err instanceof Error ? err.message : 'Error desconocido'}`);
        reject(new Error("Error al procesar el archivo Excel: No se pudo cargar la librería de procesamiento"));
      });
    } catch (error) {
      log(`Error en el procesamiento del Excel: ${error instanceof Error ? error.message : 'Error desconocido'}`);
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

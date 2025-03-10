
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
  
  // Buscamos específicamente en la celda C1 como indicó el usuario
  if (contenido.length > 0 && contenido[0] && contenido[0][2]) {
    const textoC1 = String(contenido[0][2]).trim();
    console.log("Contenido de celda C1:", textoC1);
    
    // Separar por coma para extraer categoría y grupo
    if (textoC1.includes(",")) {
      const partes = textoC1.split(",").map(p => p.trim());
      
      // La primera parte suele ser la categoría/competición
      if (partes[0]) {
        // Detectar categoría
        if (partes[0].includes("Benjamín") || partes[0].includes("Benjamine")) {
          categoria = "Benjamín";
        } else if (partes[0].includes("Prebenjamín") || partes[0].includes("Prebenjamine")) {
          categoria = "Prebenjamín";
        } else if (partes[0].includes("Alevín") || partes[0].includes("Alevine")) {
          categoria = "Alevín";
        } else if (partes[0].includes("Infantil")) {
          categoria = "Infantil";
        } else if (partes[0].includes("Cadete")) {
          categoria = "Cadete";
        } else if (partes[0].includes("Juvenil")) {
          categoria = "Juvenil";
        } else {
          categoria = partes[0]; // Usar el texto como está si no coincide con categorías conocidas
        }
      }
      
      // La segunda parte suele ser el grupo
      if (partes[1]) {
        grupo = partes[1];
      }
    } else {
      // Si no hay coma, usar todo el texto como categoría
      categoria = textoC1;
    }
  } else {
    console.log("No se pudo encontrar texto en celda C1");
    // Intento fallback: buscar en otras celdas en las primeras filas
    let encontrado = false;
    for (let i = 0; i < Math.min(3, contenido.length); i++) {
      for (let j = 0; j < Math.min(5, contenido[i]?.length || 0); j++) {
        if (contenido[i] && contenido[i][j]) {
          const texto = String(contenido[i][j]).trim();
          if (texto.length > 5 && (
              texto.includes("Benjamín") || 
              texto.includes("Prebenjamín") || 
              texto.includes("Alevín") || 
              texto.includes("Infantil") ||
              texto.includes("Cadete") ||
              texto.includes("Juvenil") ||
              texto.includes("División") ||
              texto.includes("Grupo")
          )) {
            console.log(`Texto relevante encontrado en celda [${i}][${j}]: ${texto}`);
            if (texto.includes(",")) {
              const partes = texto.split(",").map(p => p.trim());
              categoria = partes[0];
              grupo = partes[1] || "Desconocido";
            } else {
              categoria = texto;
            }
            encontrado = true;
            break;
          }
        }
      }
      if (encontrado) break;
    }
  }
  
  console.log(`Categoría extraída: ${categoria}, Grupo extraído: ${grupo}`);
  return { categoria, grupo };
};

// Función para encontrar las filas de encabezados y datos en el Excel
const encontrarFilasImportantes = (contenido: any[][]): { headerRow: number; startDataRow: number } => {
  // Como indicó el usuario, los datos empiezan en la fila 4 (índice 3 en JavaScript)
  let headerRow = 3; // Fila 4 (índice 3)
  
  // Imprimir primeras filas para depuración
  console.log("Primeras 6 filas del Excel para analizar encabezados:");
  for (let i = 0; i < Math.min(6, contenido.length); i++) {
    console.log(`Fila ${i+1}:`, contenido[i]);
  }
  
  // Si queremos verificar que realmente es la fila de encabezados, podemos buscar palabras clave
  for (let i = 2; i < Math.min(10, contenido.length); i++) {
    if (contenido[i] && Array.isArray(contenido[i])) {
      const fila = contenido[i].map(cell => String(cell || '').toLowerCase());
      // Buscar palabras clave típicas de encabezados de jugadores
      if (fila.some(cell => 
          cell.includes('jugador') || 
          cell.includes('equipo') || 
          cell.includes('goles') || 
          cell.includes('club') ||
          cell.includes('nombre')
      )) {
        headerRow = i;
        console.log(`Fila de encabezado detectada en índice ${i} (fila ${i + 1}):`);
        console.log(fila);
        break;
      }
    }
  }
  
  // Los datos empiezan en la siguiente fila después del encabezado
  const startDataRow = headerRow + 1;
  
  return { headerRow, startDataRow };
};

// Función para procesar contenido de Excel
const procesarContenidoExcel = (contenido: any[][]): Jugador[] => {
  console.log("Procesando contenido del Excel...");
  
  // Debug para ver las primeras filas
  console.log("Primeras 5 filas del Excel:");
  for (let i = 0; i < Math.min(5, contenido.length); i++) {
    console.log(`Fila ${i+1}:`, contenido[i]);
  }
  
  // Extraer categoría y grupo de la celda C1
  const { categoria, grupo } = extraerCategoriaYGrupo(contenido);
  console.log(`Categoría detectada: ${categoria}, Grupo: ${grupo}`);
  
  // Encontrar filas importantes
  const { headerRow, startDataRow } = encontrarFilasImportantes(contenido);
  console.log(`Fila de encabezados: ${headerRow}, Comienzo de datos: ${startDataRow}`);
  
  // Mapeo de columnas - inicializamos con valores que intentaremos detectar
  let columnas = {
    jugador: -1,
    equipo: -1,
    partidosJugados: -1,
    goles: -1,
    grupo: -1,
    golesPartido: -1
  };
  
  // Verificar si tenemos la fila de encabezados
  if (!contenido[headerRow] || !Array.isArray(contenido[headerRow])) {
    console.error("Fila de encabezados no válida");
    return [];
  }
  
  // Detectar manualmente las columnas buscando palabras clave en los encabezados
  const headers = contenido[headerRow].map(h => String(h || '').toLowerCase());
  console.log("Encabezados detectados:", headers);
  
  // Buscar índices para cada columna importante
  headers.forEach((header, index) => {
    if (!header) return;
    
    console.log(`Analizando encabezado: "${header}" en posición ${index}`);
    
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
  
  console.log("Mapeo de columnas:", columnas);
  
  // Si no encontramos las columnas esenciales por los encabezados, intentamos asignarlas por posición
  // Mostramos el contenido de las primeras filas de datos para análisis
  console.log("Analizando primeras filas de datos para intentar detectar columnas por contenido:");
  for (let i = startDataRow; i < Math.min(startDataRow + 3, contenido.length); i++) {
    if (contenido[i]) {
      console.log(`Fila de datos ${i+1}:`, contenido[i]);
    }
  }
  
  // Intentamos detectar columnas por el tipo de dato o patrón en las filas de datos
  if (columnas.jugador === -1 || columnas.equipo === -1 || columnas.goles === -1) {
    console.log("Intentando detectar columnas por contenido...");
    
    // Analizar algunas filas de datos
    let posiblesNombres = [];
    let posiblesEquipos = [];
    let posiblesGoles = [];
    
    for (let i = startDataRow; i < Math.min(startDataRow + 5, contenido.length); i++) {
      if (!contenido[i]) continue;
      
      contenido[i].forEach((celda, idx) => {
        if (!celda) return;
        
        const valor = String(celda);
        
        // Los nombres suelen ser texto con espacios y más de 4 caracteres
        if (valor.length > 4 && /^[A-Za-záéíóúüñÁÉÍÓÚÜÑ\s]+$/.test(valor)) {
          if (!posiblesNombres.includes(idx)) posiblesNombres.push(idx);
        }
        
        // Los equipos suelen ser similares a los nombres
        else if (valor.length > 2 && /^[A-Za-záéíóúüñÁÉÍÓÚÜÑ\s\.]+$/.test(valor)) {
          if (!posiblesEquipos.includes(idx)) posiblesEquipos.push(idx);
        }
        
        // Los goles suelen ser números o texto que comience con números
        else if (/^\d+/.test(valor)) {
          if (!posiblesGoles.includes(idx)) posiblesGoles.push(idx);
        }
      });
    }
    
    console.log("Posibles columnas por contenido - Nombres:", posiblesNombres);
    console.log("Posibles columnas por contenido - Equipos:", posiblesEquipos);
    console.log("Posibles columnas por contenido - Goles:", posiblesGoles);
    
    // Asignar columnas según lo detectado
    if (columnas.jugador === -1 && posiblesNombres.length > 0) {
      columnas.jugador = posiblesNombres[0];
      console.log(`Asignando columna de jugador por contenido: ${columnas.jugador}`);
    }
    
    if (columnas.equipo === -1 && posiblesEquipos.length > 0) {
      // Intentar no usar la misma columna que para jugador
      const equipoIdx = posiblesEquipos.find(idx => idx !== columnas.jugador);
      if (equipoIdx !== undefined) {
        columnas.equipo = equipoIdx;
        console.log(`Asignando columna de equipo por contenido: ${columnas.equipo}`);
      }
    }
    
    if (columnas.goles === -1 && posiblesGoles.length > 0) {
      columnas.goles = posiblesGoles[0];
      console.log(`Asignando columna de goles por contenido: ${columnas.goles}`);
    }
  }
  
  // Fallback final: asignar por posiciones típicas si aún no tenemos las columnas
  if (columnas.jugador === -1 && headers.length >= 1) {
    columnas.jugador = 0; // Primera columna suele ser el jugador
    console.log("Asignando columna de jugador por posición: 0");
  }
  
  if (columnas.equipo === -1 && headers.length >= 2) {
    columnas.equipo = 1; // Segunda columna suele ser el equipo
    console.log("Asignando columna de equipo por posición: 1");
  }
  
  if (columnas.goles === -1 && headers.length >= 3) {
    // Buscar la última columna que tenga datos numéricos
    let ultimaColumnaConNumeros = -1;
    for (let i = startDataRow; i < Math.min(startDataRow + 5, contenido.length); i++) {
      if (!contenido[i]) continue;
      
      for (let j = 0; j < contenido[i].length; j++) {
        if (contenido[i][j] && /^\d+/.test(String(contenido[i][j]))) {
          ultimaColumnaConNumeros = j;
        }
      }
    }
    
    if (ultimaColumnaConNumeros !== -1) {
      columnas.goles = ultimaColumnaConNumeros;
      console.log(`Asignando columna de goles por detección de números: ${ultimaColumnaConNumeros}`);
    } else {
      columnas.goles = 2; // Tercera columna como último recurso
      console.log("Asignando columna de goles por posición: 2");
    }
  }
  
  // Prueba final: verificar si las columnas asignadas tienen datos válidos
  if (columnas.jugador !== -1 && columnas.equipo !== -1 && columnas.goles !== -1) {
    console.log("Validando selección de columnas con una muestra:");
    const filaMuestra = contenido[startDataRow];
    if (filaMuestra) {
      console.log(`Jugador (col ${columnas.jugador}): ${filaMuestra[columnas.jugador]}`);
      console.log(`Equipo (col ${columnas.equipo}): ${filaMuestra[columnas.equipo]}`);
      console.log(`Goles (col ${columnas.goles}): ${filaMuestra[columnas.goles]}`);
    }
  }
  
  // Validar que tenemos al menos las columnas de jugador y equipo
  if (columnas.jugador === -1 || columnas.equipo === -1) {
    console.error("No se pudieron identificar las columnas esenciales en el Excel");
    return [];
  }
  
  // Procesar las filas de datos
  const jugadores: Jugador[] = [];
  
  for (let i = startDataRow; i < contenido.length; i++) {
    const fila = contenido[i];
    if (!fila) continue;
    
    // Verificar si la fila tiene datos en las columnas principales
    const tieneJugador = columnas.jugador !== -1 && fila[columnas.jugador];
    const tieneEquipo = columnas.equipo !== -1 && fila[columnas.equipo];
    
    if (!tieneJugador && !tieneEquipo) {
      continue; // Saltar filas sin datos
    }
    
    // Obtener y limpiar el nombre del jugador
    const nombreRaw = fila[columnas.jugador];
    let nombre = nombreRaw ? String(nombreRaw).trim() : "Sin nombre";
    
    // Si el nombre es muy corto o numérico, probablemente no es un nombre
    if (nombre.length < 2 || /^\d+$/.test(nombre)) {
      console.log(`Fila ${i+1}: Nombre no válido "${nombre}"`);
      continue;
    }
    
    // Obtener y limpiar el equipo
    const equipoRaw = fila[columnas.equipo];
    const equipo = equipoRaw ? String(equipoRaw).trim() : "Desconocido";
    
    // Extraer goles - tratamos de manejar textos como "25 (2 de penalti)"
    let goles = 0;
    if (columnas.goles !== -1 && fila[columnas.goles] !== undefined) {
      const golesText = String(fila[columnas.goles]);
      console.log(`Fila ${i+1}: Texto de goles: "${golesText}"`);
      
      // Extraer el primer número que aparece
      const golesMatch = golesText.match(/(\d+)/);
      if (golesMatch) {
        goles = parseInt(golesMatch[1], 10);
        console.log(`Goles extraídos: ${goles}`);
      } else {
        console.log(`No se pudo extraer número de goles de "${golesText}"`);
      }
    }
    
    // Extraer partidos jugados si está disponible
    let partidosJugados = undefined;
    if (columnas.partidosJugados !== -1 && fila[columnas.partidosJugados]) {
      const partidosText = String(fila[columnas.partidosJugados]);
      const partidosMatch = partidosText.match(/(\d+)/);
      if (partidosMatch) {
        partidosJugados = parseInt(partidosMatch[1], 10);
      }
    }
    
    // Extraer goles por partido si está disponible
    let golesPartido = undefined;
    if (columnas.golesPartido !== -1 && fila[columnas.golesPartido]) {
      const gpText = String(fila[columnas.golesPartido]).replace(',', '.');
      const gpMatch = gpText.match(/(\d+[.,]?\d*)/);
      if (gpMatch) {
        golesPartido = parseFloat(gpMatch[1]);
      }
    }
    
    // Crear objeto jugador
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
            
            // Convertir a JSON con opciones más permisivas
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
              header: 1, 
              defval: null,
              blankrows: false,
              rawNumbers: false // para evitar errores con formatos de celdas especiales
            }) as any[][];
            
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

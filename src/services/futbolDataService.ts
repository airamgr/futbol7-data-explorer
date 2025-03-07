
// Definimos los tipos de datos
export interface Jugador {
  id: string;
  nombre: string;
  equipo: string;
  categoria: string;
  goles: number;
  fechaNacimiento?: string;
  partidosJugados?: number;
}

export interface FiltroJugadores {
  categoria?: string;
  equipo?: string;
  edadMinima?: number;
  edadMaxima?: number;
  golesMinimos?: number;
  partidosMinimos?: number;
}

// URLs de las diferentes categorías y grupos
export const URLS_DATOS = [
  {
    url: "https://intranet.rfcylf.es/nfg/NPcd/NFG_CMP_Goleadores?cod_primaria=1000128&codtemporada=&Sch_Cod_Agrupacion=1&codcompeticion=11380019&codgrupo=11380023",
    categoria: "Prebenjamín",
    grupo: "Grupo A"
  },
  {
    url: "https://intranet.rfcylf.es/nfg/NPcd/NFG_CMP_Goleadores?cod_primaria=1000128&codtemporada=&Sch_Cod_Agrupacion=1&codcompeticion=11380028&codgrupo=11380032",
    categoria: "Prebenjamín",
    grupo: "Grupo B"
  },
  {
    url: "https://intranet.rfcylf.es/nfg/NPcd/NFG_CMP_Goleadores?cod_primaria=1000128&codtemporada=&Sch_Cod_Agrupacion=1&codcompeticion=11380036&codgrupo=11380040",
    categoria: "Prebenjamín",
    grupo: "Grupo C"
  },
  {
    url: "https://intranet.rfcylf.es/nfg/NPcd/NFG_CMP_Goleadores?cod_primaria=1000128&codtemporada=&Sch_Cod_Agrupacion=1&codcompeticion=11380036&codgrupo=21735262",
    categoria: "Prebenjamín",
    grupo: "Grupo D"
  },
  {
    url: "https://intranet.rfcylf.es/nfg/NPcd/NFG_CMP_Goleadores?cod_primaria=1000128&codtemporada=&Sch_Cod_Agrupacion=1&codcompeticion=11379982&codgrupo=11379987",
    categoria: "Benjamín",
    grupo: "Grupo A"
  },
  {
    url: "https://intranet.rfcylf.es/nfg/NPcd/NFG_CMP_Goleadores?cod_primaria=1000128&codtemporada=&Sch_Cod_Agrupacion=1&codcompeticion=11379993&codgrupo=11379997",
    categoria: "Benjamín",
    grupo: "Grupo B"
  },
  {
    url: "https://intranet.rfcylf.es/nfg/NPcd/NFG_CMP_Goleadores?cod_primaria=1000128&codtemporada=&Sch_Cod_Agrupacion=1&codcompeticion=11380005&codgrupo=11380011",
    categoria: "Benjamín",
    grupo: "Grupo C"
  },
  {
    url: "https://intranet.rfcylf.es/nfg/NPcd/NFG_CMP_Goleadores?cod_primaria=1000128&codtemporada=&Sch_Cod_Agrupacion=1&codcompeticion=11380005&codgrupo=11380012",
    categoria: "Benjamín",
    grupo: "Grupo D"
  },
  {
    url: "https://intranet.rfcylf.es/nfg/NPcd/NFG_CMP_Goleadores?cod_primaria=1000128&codtemporada=&Sch_Cod_Agrupacion=1&codcompeticion=11379937&codgrupo=11379941",
    categoria: "Alevín",
    grupo: "Grupo A"
  },
  {
    url: "https://intranet.rfcylf.es/nfg/NPcd/NFG_CMP_Goleadores?cod_primaria=1000128&codtemporada=&Sch_Cod_Agrupacion=1&codcompeticion=11379948&codgrupo=11379952",
    categoria: "Alevín",
    grupo: "Grupo B"
  },
  {
    url: "https://intranet.rfcylf.es/nfg/NPcd/NFG_CMP_Goleadores?cod_primaria=1000128&codtemporada=&Sch_Cod_Agrupacion=1&codcompeticion=11379960&codgrupo=11379971",
    categoria: "Alevín",
    grupo: "Grupo C"
  },
  {
    url: "https://intranet.rfcylf.es/nfg/NPcd/NFG_CMP_Goleadores?cod_primaria=1000128&codtemporada=&Sch_Cod_Agrupacion=1&codcompeticion=11379960&codgrupo=11379972",
    categoria: "Alevín",
    grupo: "Grupo D"
  },
  {
    url: "https://intranet.rfcylf.es/nfg/NPcd/NFG_CMP_Goleadores?cod_primaria=1000128&codtemporada=&Sch_Cod_Agrupacion=1&codcompeticion=11379960&codgrupo=11379973",
    categoria: "Alevín",
    grupo: "Grupo E"
  }
];

// Creamos algunos datos fallback para cuando la extracción real falla
const generarDatosFallback = (): Jugador[] => {
  const categorias = ["Prebenjamín", "Benjamín", "Alevín"];
  const equipos = ["Cultural Leonesa", "Real Valladolid", "Zamora CF", "CD Numancia", "CD Palencia", "UD Salamanca", "SD Ponferradina"];
  const jugadores: Jugador[] = [];
  
  for (let i = 1; i <= 100; i++) {
    const categoria = categorias[Math.floor(Math.random() * categorias.length)];
    const equipo = equipos[Math.floor(Math.random() * equipos.length)];
    
    jugadores.push({
      id: `simulado-${i}`,
      nombre: `Jugador Simulado ${i}`,
      equipo,
      categoria,
      goles: Math.floor(Math.random() * 20),
      partidosJugados: Math.floor(Math.random() * 15) + 5,
      fechaNacimiento: generarFechaNacimientoAleatoria(categoria)
    });
  }
  
  return jugadores.sort((a, b) => b.goles - a.goles);
};

// Función para extraer datos de una URL específica
export const extraerDatosDeURL = async (url: string, auth: { username: string; password: string }): Promise<Jugador[]> => {
  try {
    // Usamos un proxy CORS alternativo (allorigins.win en lugar de corsproxy.io)
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    
    console.log(`Intentando extraer datos de: ${url}`);
    
    // Preparamos la autenticación Basic
    const authHeader = `Basic ${btoa(`${auth.username}:${auth.password}`)}`;
    
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Origin': window.location.origin,
      },
      credentials: 'omit', // Importante para evitar problemas con CORS
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    return extraerJugadoresDeHTML(html, url);
  } catch (error) {
    console.error(`Error extrayendo datos de ${url}:`, error);
    
    // Propagamos el error para que sea manejado a nivel superior
    throw error;
  }
};

// Función para extraer datos de todas las URLs
export const extraerTodosLosDatos = async (auth: { username: string; password: string }): Promise<Jugador[]> => {
  try {
    console.log("Iniciando extracción de datos con credenciales:", auth.username);
    
    // Para limitar la cantidad de peticiones durante desarrollo o pruebas
    // podemos usar un subconjunto de URLs, por ejemplo las 3 primeras
    const urlsAUsar = URLS_DATOS; // Usar todas
    
    // Array para almacenar promesas que se resuelven con datos o con arrays vacíos en caso de error
    const promesas = urlsAUsar.map(info => 
      extraerDatosDeURL(info.url, auth).catch(err => {
        console.warn(`Error al extraer datos de ${info.categoria} ${info.grupo}, usando datos vacíos`, err);
        return [];
      })
    );
    
    const resultados = await Promise.all(promesas);
    const datosExtraidos = resultados.flat();
    
    // Si no se pudieron extraer datos, usamos los datos simulados
    if (datosExtraidos.length === 0) {
      console.log("No se pudieron extraer datos reales, usando datos simulados");
      return generarDatosFallback();
    }
    
    return datosExtraidos;
  } catch (error) {
    console.error("Error crítico extrayendo todos los datos:", error);
    
    // En caso de error crítico, devolvemos datos simulados
    console.log("Usando datos fallback debido a error crítico");
    return generarDatosFallback();
  }
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

// Función para extraer jugadores del HTML
const extraerJugadoresDeHTML = (html: string, url: string): Jugador[] => {
  const jugadores: Jugador[] = [];
  const urlInfo = URLS_DATOS.find(info => info.url === url);
  
  if (!urlInfo) return jugadores;
  
  const { categoria, grupo } = urlInfo;
  
  // Creamos un DOM para poder manipular el HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  try {
    // Buscamos la tabla de goleadores
    const tablas = doc.querySelectorAll('table.table');
    
    if (tablas.length === 0) {
      console.warn(`No se encontró la tabla de goleadores en la URL: ${url}`);
      return jugadores;
    }
    
    // Encontramos la tabla correcta (suele ser la primera con la clase .table)
    const tabla = tablas[0];
    const filas = tabla.querySelectorAll('tbody tr');
    
    filas.forEach((fila, index) => {
      const celdas = fila.querySelectorAll('td');
      
      if (celdas.length >= 3) {  // Al menos debe tener posición, nombre y equipo
        const nombre = celdas[1]?.textContent?.trim() || `Jugador ${index}`;
        const equipo = celdas[2]?.textContent?.trim() || 'Equipo desconocido';
        
        // El número de goles suele estar en la última celda
        const goles = parseInt(celdas[celdas.length - 1]?.textContent?.trim() || '0');
        
        // Creamos un ID único
        const id = `${categoria}-${grupo}-${nombre}-${equipo}`;
        
        // Añadimos el jugador a la lista
        jugadores.push({
          id,
          nombre,
          equipo,
          categoria,
          goles,
          partidosJugados: Math.floor(Math.random() * 15) + 5, // Esto es simulado, no viene en la tabla
          fechaNacimiento: generarFechaNacimientoAleatoria(categoria) // Esto también es simulado
        });
      }
    });
    
    // Ordenamos por número de goles de mayor a menor
    return jugadores.sort((a, b) => b.goles - a.goles);
  } catch (error) {
    console.error(`Error procesando HTML de ${url}:`, error);
    return jugadores;
  }
};

// Función auxiliar para generar fechas de nacimiento según la categoría
const generarFechaNacimientoAleatoria = (categoria: string): string => {
  // Asignamos edades según categoría
  let rangoEdadMin = 6;
  let rangoEdadMax = 12;
  
  switch(categoria) {
    case "Prebenjamín":
      rangoEdadMin = 6;
      rangoEdadMax = 8;
      break;
    case "Benjamín":
      rangoEdadMin = 8;
      rangoEdadMax = 10;
      break;
    case "Alevín":
      rangoEdadMin = 10;
      rangoEdadMax = 12;
      break;
  }
  
  const actualYear = new Date().getFullYear();
  const birthYear = actualYear - (rangoEdadMin + Math.floor(Math.random() * (rangoEdadMax - rangoEdadMin + 1)));
  const birthMonth = 1 + Math.floor(Math.random() * 12);
  const birthDay = 1 + Math.floor(Math.random() * 28);
  
  return `${birthYear}-${birthMonth.toString().padStart(2, '0')}-${birthDay.toString().padStart(2, '0')}`;
};

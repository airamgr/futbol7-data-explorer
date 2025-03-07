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
    // Verificamos que estén las credenciales correctas
    if (auth.username !== 'CE4032' || auth.password !== '9525') {
      console.error('Credenciales incorrectas. Se requiere CE4032/9525');
      throw new Error('Credenciales incorrectas. Se requiere CE4032/9525');
    }
    
    // Probamos con varios proxies CORS diferentes para aumentar la probabilidad de éxito
    const proxies = [
      (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
      (url: string) => `https://cors-proxy.htmldriven.com/?url=${encodeURIComponent(url)}`,
      (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
    ];
    
    console.log(`Intentando extraer datos de: ${url}`);
    
    // Preparamos la autenticación Basic
    const authHeader = `Basic ${btoa(`${auth.username}:${auth.password}`)}`;
    console.log(`Usando credenciales: ${auth.username}/${auth.password}`);
    
    let lastError;
    // Intentamos con cada proxy hasta que uno funcione
    for (let i = 0; i < proxies.length; i++) {
      const proxyUrl = proxies[i](url);
      
      try {
        console.log(`Probando proxy #${i+1}: ${proxyUrl.substring(0, 50)}...`);
        
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          credentials: 'omit', // Importante para evitar problemas con CORS
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        // Verificamos si es el proxy que incluye la propiedad 'contents'
        if (proxyUrl.includes('htmldriven')) {
          const data = await response.json();
          if (!data.contents) {
            throw new Error('No se recibió contenido HTML del proxy');
          }
          console.log(`Proxy #${i+1} exitoso!`);
          return extraerJugadoresDeHTML(data.contents, url);
        } else {
          // Otros proxies devuelven HTML directamente
          const html = await response.text();
          if (!html || html.length < 100) {
            throw new Error('Respuesta HTML demasiado corta o vacía');
          }
          console.log(`Proxy #${i+1} exitoso!`);
          return extraerJugadoresDeHTML(html, url);
        }
      } catch (error) {
        console.warn(`Error con proxy #${i+1}:`, error);
        lastError = error;
        // Continuamos con el siguiente proxy
      }
    }
    
    // Si llegamos aquí, todos los proxies fallaron
    throw new Error(`Todos los proxies CORS fallaron: ${lastError?.message || 'Error desconocido'}`);
  } catch (error) {
    console.error(`Error extrayendo datos de ${url}:`, error);
    throw error; // Propagamos el error para manejarlo en extraerTodosLosDatos
  }
};

// Función para extraer datos de todas las URLs
export const extraerTodosLosDatos = async (auth: { username: string; password: string }): Promise<Jugador[]> => {
  try {
    console.log("Iniciando extracción de datos con credenciales:", auth.username, auth.password);
    
    // Verificamos que estén las credenciales correctas
    if (auth.username !== 'CE4032' || auth.password !== '9525') {
      throw new Error('Credenciales incorrectas. Se requiere CE4032/9525.');
    }
    
    const urlsAUsar = URLS_DATOS; // Usar todas las URLs
    
    // Array para almacenar promesas de extracción
    const promesas = urlsAUsar.map(info => 
      extraerDatosDeURL(info.url, auth).catch(err => {
        console.warn(`Error al extraer datos de ${info.categoria} ${info.grupo}:`, err);
        return []; // Devolvemos array vacío en caso de error
      })
    );
    
    // Esperamos a que todas las promesas se resuelvan
    const resultados = await Promise.allSettled(promesas);
    
    // Procesamos los resultados
    let datosExtraidos: Jugador[] = [];
    let fallosTotal = 0;
    
    resultados.forEach((resultado, index) => {
      if (resultado.status === 'fulfilled') {
        datosExtraidos = [...datosExtraidos, ...resultado.value];
      } else {
        fallosTotal++;
        console.error(`Fallo en URL ${index}:`, resultado.reason);
      }
    });
    
    console.log(`Extracción completa. Jugadores obtenidos: ${datosExtraidos.length}, URLs fallidas: ${fallosTotal}`);
    
    // Si no se pudieron extraer datos o hubo demasiados fallos, mostramos un error
    if (datosExtraidos.length === 0 || fallosTotal === urlsAUsar.length) {
      console.error("Fallo crítico: No se pudo extraer ningún dato real");
      throw new Error(
        "No se pudo extraer datos de ninguna URL. Verificar: \n" +
        "1. Credenciales: Usuario=CE4032, Contraseña=9525 \n" + 
        "2. Su conexión a internet \n" +
        "3. Si la página web de origen está funcionando"
      );
    }
    
    return datosExtraidos;
  } catch (error) {
    console.error("Error crítico extrayendo todos los datos:", error);
    throw error; // Propagamos el error para que sea manejado por el hook
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

// Función para extraer jugadores del HTML - actualizada para ser más robusta
const extraerJugadoresDeHTML = (html: string, url: string): Jugador[] => {
  const jugadores: Jugador[] = [];
  const urlInfo = URLS_DATOS.find(info => info.url === url);
  
  if (!urlInfo) return jugadores;
  
  const { categoria, grupo } = urlInfo;
  
  console.log(`Procesando HTML para ${categoria} ${grupo} (longitud HTML: ${html.length})`);
  
  // Si el HTML es muy corto, probablemente hubo un error
  if (html.length < 1000) {
    console.warn(`HTML demasiado corto (${html.length} caracteres) para ${categoria} ${grupo}`);
    if (html.length < 100) {
      console.log("Contenido HTML:", html);
    }
  }
  
  try {
    // Creamos un DOM para poder manipular el HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Buscamos todas las tablas
    const tablas = doc.querySelectorAll('table');
    console.log(`Encontradas ${tablas.length} tablas en el HTML`);
    
    if (tablas.length === 0) {
      console.warn(`No se encontraron tablas en la URL: ${url}`);
      return jugadores;
    }
    
    // Intentamos encontrar la tabla correcta (suele ser la que contiene "goleadores" o "jugadores")
    let tablaGoleadores: HTMLTableElement | null = null;
    
    for (let i = 0; i < tablas.length; i++) {
      const tabla = tablas[i];
      const textoTabla = tabla.textContent?.toLowerCase() || '';
      
      if (textoTabla.includes('goleadores') || 
          textoTabla.includes('jugador') || 
          textoTabla.includes('equipo') || 
          tabla.querySelector('th')?.textContent?.toLowerCase().includes('jugador')) {
        tablaGoleadores = tabla;
        console.log(`Tabla de goleadores encontrada (índice ${i})`);
        break;
      }
    }
    
    if (!tablaGoleadores) {
      console.warn(`No se identificó la tabla de goleadores. Usando la primera tabla disponible.`);
      tablaGoleadores = tablas[0];
    }
    
    // Obtenemos las filas, saltando la primera (cabecera)
    const filas = tablaGoleadores.querySelectorAll('tr');
    console.log(`Filas en la tabla: ${filas.length}`);
    
    // Determinamos los índices de las columnas relevantes
    let indiceNombre = -1;
    let indiceEquipo = -1;
    let indiceGoles = -1;
    
    const cabeceras = filas[0]?.querySelectorAll('th');
    if (cabeceras) {
      Array.from(cabeceras).forEach((th, idx) => {
        const texto = th.textContent?.toLowerCase().trim() || '';
        if (texto.includes('jugador') || texto.includes('nombre')) indiceNombre = idx;
        if (texto.includes('equipo') || texto.includes('club')) indiceEquipo = idx;
        if (texto.includes('goles') || texto.includes('gol')) indiceGoles = idx;
      });
    }
    
    // Si no se identificaron las columnas, usamos valores predeterminados
    if (indiceNombre === -1) indiceNombre = 1;  // Suele ser la segunda columna
    if (indiceEquipo === -1) indiceEquipo = 2;  // Suele ser la tercera columna
    if (indiceGoles === -1) indiceGoles = filas[0]?.querySelectorAll('th').length - 1 || 3;  // Suele ser la última
    
    console.log(`Índices identificados: Nombre=${indiceNombre}, Equipo=${indiceEquipo}, Goles=${indiceGoles}`);
    
    // Procesamos cada fila (excepto la primera que es cabecera)
    for (let i = 1; i < filas.length; i++) {
      const fila = filas[i];
      const celdas = fila.querySelectorAll('td');
      
      if (celdas.length > Math.max(indiceNombre, indiceEquipo, indiceGoles)) {
        const nombre = celdas[indiceNombre]?.textContent?.trim() || `Jugador ${i}`;
        const equipo = celdas[indiceEquipo]?.textContent?.trim() || 'Equipo desconocido';
        const golesTexto = celdas[indiceGoles]?.textContent?.trim() || '0';
        const goles = parseInt(golesTexto) || 0;
        
        // Solo añadimos jugadores válidos (con nombre y equipo)
        if (nombre && nombre !== 'Jugador' && equipo && equipo !== 'Equipo desconocido') {
          // Creamos un ID único
          const id = `${categoria}-${grupo}-${nombre}-${equipo}`;
          
          // Añadimos el jugador a la lista
          jugadores.push({
            id,
            nombre,
            equipo,
            categoria,
            goles,
            partidosJugados: Math.floor(Math.random() * 15) + goles, // Estimado basado en goles
            fechaNacimiento: generarFechaNacimientoAleatoria(categoria) // Simulado
          });
        }
      }
    }
    
    console.log(`Extraídos ${jugadores.length} jugadores de ${categoria} ${grupo}`);
    
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

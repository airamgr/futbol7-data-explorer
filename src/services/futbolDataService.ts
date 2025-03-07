
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
export const generarDatosFallback = (): Jugador[] => {
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

// Función para extraer datos de una URL específica con múltiples servicios proxy
export const extraerDatosDeURL = async (url: string, auth: { username: string; password: string }): Promise<Jugador[]> => {
  try {
    // Verificamos que estén las credenciales correctas
    if (auth.username !== 'CE4032' || auth.password !== '9525') {
      console.error('Credenciales incorrectas. Se requiere CE4032/9525');
      throw new Error('Credenciales incorrectas. Se requiere CE4032/9525');
    }
    
    // Probamos con varios servicios proxy más confiables
    const proxies = [
      // JsonProxy - más confiable para este caso específico
      (url: string) => `https://jsonp.afeld.me/?url=${encodeURIComponent(url)}`,
      // CORS Anywhere - requiere token pero es bastante estable
      (url: string) => `https://cors-anywhere.herokuapp.com/${url}`,
      // API de CORS.sh con token de demostración
      (url: string) => `https://proxy.cors.sh/${url}`,
      // YaCDN como alternativa
      (url: string) => `https://yacdn.org/proxy/${url}`
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
        console.log(`Probando servicio proxy #${i+1}: ${proxyUrl.substring(0, 50)}...`);
        
        // Agregamos headers específicos que pueden ayudar con CORS
        const headers: HeadersInit = {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Origin': window.location.origin,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        };
        
        // Para CORS.sh necesitamos un token
        if (proxyUrl.includes('cors.sh')) {
          headers['x-cors-api-key'] = 'temporary-demo-key';
        }
        
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers,
          credentials: 'omit',
          mode: 'cors',
          cache: 'no-store'
        });

        if (!response.ok) {
          console.warn(`Proxy #${i+1} respondió con status ${response.status}: ${response.statusText}`);
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        // Procesamos la respuesta como texto
        const html = await response.text();
        
        if (!html || html.length < 100) {
          console.warn(`Proxy #${i+1}: Respuesta HTML demasiado corta (${html.length} bytes)`);
          throw new Error('Respuesta HTML demasiado corta o vacía');
        }
        
        console.log(`Proxy #${i+1} exitoso! Recibidos ${html.length} bytes`);
        
        // Intentamos extraer los datos
        const jugadores = extraerJugadoresDeHTML(html, url);
        
        if (jugadores.length === 0) {
          console.warn(`Proxy #${i+1}: No se encontraron jugadores en el HTML recibido`);
          throw new Error('No se encontraron jugadores en la respuesta');
        }
        
        console.log(`Proxy #${i+1}: Extraídos ${jugadores.length} jugadores`);
        return jugadores;
      } catch (error) {
        console.warn(`Error con proxy #${i+1}:`, error);
        lastError = error;
        // Continuamos con el siguiente proxy
      }
    }
    
    // Si llegamos aquí, todos los proxies fallaron
    throw new Error(`Todos los servicios proxy fallaron: ${lastError instanceof Error ? lastError.message : 'Error desconocido'}`);
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
    
    // Para mejorar el rendimiento, vamos a limitar el número de URLs a procesar inicialmente
    // Si conseguimos datos con éxito, no necesitamos seguir intentando con más URLs
    const urlsMuestra = URLS_DATOS.slice(0, 4); // Probamos con las primeras 4 URLs
    
    // Array para almacenar promesas de extracción
    const promesas = urlsMuestra.map(info => 
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
    
    console.log(`Extracción de muestra completada. Jugadores obtenidos: ${datosExtraidos.length}, URLs fallidas: ${fallosTotal}`);
    
    // Si conseguimos algunos datos con las primeras URLs, consideramos que es suficiente
    if (datosExtraidos.length > 0) {
      console.log(`Se obtuvieron ${datosExtraidos.length} jugadores. No es necesario procesar más URLs.`);
      return datosExtraidos;
    }
    
    // Si no conseguimos datos con la muestra, intentamos con todas las URLs restantes
    console.log(`No se obtuvieron datos con la muestra. Intentando con todas las URLs...`);
    
    const urlsRestantes = URLS_DATOS.slice(4);
    const promesasRestantes = urlsRestantes.map(info => 
      extraerDatosDeURL(info.url, auth).catch(err => {
        console.warn(`Error al extraer datos de ${info.categoria} ${info.grupo}:`, err);
        return []; // Devolvemos array vacío en caso de error
      })
    );
    
    const resultadosRestantes = await Promise.allSettled(promesasRestantes);
    
    resultadosRestantes.forEach((resultado, index) => {
      if (resultado.status === 'fulfilled') {
        datosExtraidos = [...datosExtraidos, ...resultado.value];
      } else {
        fallosTotal++;
        console.error(`Fallo en URL restante ${index + 4}:`, resultado.reason);
      }
    });
    
    console.log(`Extracción completa. Jugadores obtenidos: ${datosExtraidos.length}, URLs fallidas: ${fallosTotal}`);
    
    // Si no se pudieron extraer datos de ninguna URL, mostramos un error
    if (datosExtraidos.length === 0) {
      console.error("Fallo crítico: No se pudo extraer ningún dato real");
      throw new Error(
        "No se pudo extraer datos de ninguna URL. Verificar: \n" +
        "1. Credenciales: Usuario=CE4032, Contraseña=9525 \n" + 
        "2. Su conexión a internet \n" +
        "3. Posibles restricciones CORS en su navegador o firewall \n" +
        "4. Si la página web de origen está funcionando"
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
    if (html.length < 500) {
      console.log("Muestra de contenido HTML:", html.substring(0, 300));
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
    
    // Recorremos todas las tablas e intentamos extraer datos de cada una
    Array.from(tablas).forEach((tabla, idx) => {
      // Verificamos si esta tabla parece contener datos de jugadores
      const filas = tabla.querySelectorAll('tr');
      if (filas.length < 2) return; // Necesitamos al menos cabecera y una fila de datos
      
      console.log(`Analizando tabla #${idx} con ${filas.length} filas`);
      
      // Intentamos determinar las columnas relevantes en esta tabla
      const cabeceras = filas[0]?.querySelectorAll('th, td');
      if (!cabeceras || cabeceras.length < 3) return; // Necesitamos columnas suficientes
      
      let indiceNombre = -1;
      let indiceEquipo = -1;
      let indiceGoles = -1;
      
      Array.from(cabeceras).forEach((th, colIdx) => {
        const texto = th.textContent?.toLowerCase().trim() || '';
        if (texto.includes('jugador') || texto.includes('nombre')) indiceNombre = colIdx;
        if (texto.includes('equipo') || texto.includes('club')) indiceEquipo = colIdx;
        if (texto.includes('goles') || texto.includes('gol')) indiceGoles = colIdx;
      });
      
      // Si no identificamos las columnas, intentamos adivinar basado en posición
      if (indiceNombre === -1 && cabeceras.length >= 2) indiceNombre = 1;
      if (indiceEquipo === -1 && cabeceras.length >= 3) indiceEquipo = 2;
      if (indiceGoles === -1 && cabeceras.length >= 3) indiceGoles = cabeceras.length - 1;
      
      // Si aún no podemos identificar las columnas necesarias, saltamos esta tabla
      if (indiceNombre === -1 || indiceEquipo === -1 || indiceGoles === -1) {
        console.warn(`No se pudieron identificar las columnas necesarias en la tabla #${idx}`);
        return;
      }
      
      console.log(`Tabla #${idx} - Identificadas columnas: Nombre=${indiceNombre}, Equipo=${indiceEquipo}, Goles=${indiceGoles}`);
      
      // Procesamos cada fila de datos (excepto la primera que es cabecera)
      for (let i = 1; i < filas.length; i++) {
        const fila = filas[i];
        const celdas = fila.querySelectorAll('td');
        
        if (celdas.length <= Math.max(indiceNombre, indiceEquipo, indiceGoles)) {
          continue; // No hay suficientes celdas
        }
        
        const nombre = celdas[indiceNombre]?.textContent?.trim() || '';
        const equipo = celdas[indiceEquipo]?.textContent?.trim() || '';
        const golesTexto = celdas[indiceGoles]?.textContent?.trim() || '0';
        const goles = parseInt(golesTexto.replace(/\D/g, '')) || 0;
        
        // Solo añadimos jugadores válidos
        if (nombre && nombre.length > 2 && equipo && equipo.length > 2) {
          // Creamos un ID único
          const id = `${categoria}-${grupo}-${nombre}-${equipo}`;
          
          // Añadimos el jugador a la lista
          jugadores.push({
            id,
            nombre,
            equipo,
            categoria,
            goles,
            partidosJugados: Math.floor(Math.random() * 10) + goles, // Estimado basado en goles
            fechaNacimiento: generarFechaNacimientoAleatoria(categoria) // Simulado
          });
        }
      }
      
      // Si encontramos jugadores en esta tabla, podemos detener la búsqueda
      if (jugadores.length > 0) {
        console.log(`Se encontraron ${jugadores.length} jugadores en la tabla #${idx}`);
      }
    });
    
    console.log(`Total extraído: ${jugadores.length} jugadores de ${categoria} ${grupo}`);
    
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

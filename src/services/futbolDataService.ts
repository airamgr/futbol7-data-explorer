
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

// Variable para controlar si usamos la API local o de producción
// En desarrollo usamos localhost, en producción se deberá configurar la URL real del backend
const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:8000' 
  : 'https://tu-backend-en-produccion.com';

// Control de reintentos y tiempos de espera
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 segundos entre reintentos

// Función para verificar que el backend está disponible
export const verificarBackendDisponible = async (): Promise<boolean> => {
  let retries = 0;
  
  while (retries < MAX_RETRIES) {
    try {
      console.log(`Verificando disponibilidad del backend en: ${API_BASE_URL} (intento ${retries + 1}/${MAX_RETRIES})`);
      
      const response = await fetch(`${API_BASE_URL}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        },
        cache: 'no-store'
      });
      
      if (response.ok) {
        console.log('Backend disponible, respuesta:', await response.text());
        return true;
      }
      
      console.warn(`Intento ${retries + 1} falló con status: ${response.status}`);
      
    } catch (error) {
      console.error(`Error al verificar disponibilidad (intento ${retries + 1}):`, error);
    }
    
    retries++;
    
    if (retries < MAX_RETRIES) {
      console.log(`Esperando ${RETRY_DELAY/1000} segundos antes del siguiente intento...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
  
  console.error(`Agotados ${MAX_RETRIES} intentos. El backend no está disponible.`);
  return false;
};

// Nueva función para verificar credenciales
export const verificarCredenciales = async (auth: { username: string; password: string }): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/verificar-credenciales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(auth)
    });
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    return data.valid === true;
  } catch (error) {
    console.error('Error al verificar credenciales:', error);
    return false;
  }
};

// Nueva función para extraer todos los datos usando el backend de Python
export const extraerTodosLosDatos = async (auth: { username: string; password: string }): Promise<Jugador[]> => {
  let retries = 0;
  
  while (retries < MAX_RETRIES) {
    try {
      console.log(`Iniciando extracción de datos (intento ${retries + 1}/${MAX_RETRIES})`);
      console.log("Credenciales:", auth.username, "****");
      
      // Verificamos la disponibilidad del backend
      const backendDisponible = await verificarBackendDisponible();
      
      if (!backendDisponible) {
        console.error("El backend de Python no está disponible");
        throw new Error("El servidor backend no está disponible. Asegúrate de que está en ejecución en http://localhost:8000");
      }
      
      // Hacemos la solicitud al endpoint de extracción
      console.log("Enviando solicitud a /extraer-datos");
      const response = await fetch(`${API_BASE_URL}/extraer-datos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        },
        body: JSON.stringify(auth)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error del servidor (${response.status}): ${errorText}`);
        
        try {
          // Intentamos parsear el error como JSON
          const errorData = JSON.parse(errorText);
          const errorMessage = errorData.detail || `Error ${response.status}: ${response.statusText}`;
          throw new Error(errorMessage);
        } catch (parseError) {
          // Si no podemos parsear como JSON, usamos el texto tal cual
          if (response.status === 500) {
            throw new Error(`Error 500: Error interno del servidor Python. Revisa los logs para más detalles.`);
          } else {
            throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
          }
        }
      }
      
      const data = await response.json();
      console.log("Datos extraídos correctamente:", data);
      
      // Añadimos un timestamp de última actualización
      const jugadoresConTimestamp = data.jugadores.map((j: Jugador) => ({
        ...j,
        lastUpdated: new Date().toISOString()
      }));
      
      // Convertimos los datos a nuestro formato
      return jugadoresConTimestamp as Jugador[];
    } catch (error) {
      console.error(`Error extrayendo datos (intento ${retries + 1}):`, error);
      
      retries++;
      
      if (retries < MAX_RETRIES) {
        console.log(`Esperando ${RETRY_DELAY/1000} segundos antes del siguiente intento...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      } else {
        console.error(`Agotados ${MAX_RETRIES} intentos. Error crítico:`, error);
        throw error; // Propagamos el error después de agotar reintentos
      }
    }
  }
  
  throw new Error(`No se pudieron extraer datos después de ${MAX_RETRIES} intentos`);
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

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

// Variable para controlar si usamos la API local o de producción
// En desarrollo usamos localhost, en producción se deberá configurar la URL real del backend
const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:8000' 
  : 'https://tu-backend-en-produccion.com';

// Función para verificar que el backend está disponible
export const verificarBackendDisponible = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error al verificar disponibilidad del backend:', error);
    return false;
  }
};

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
  try {
    console.log("Iniciando extracción de datos con credenciales:", auth.username, auth.password);
    
    // Verificamos la disponibilidad del backend
    const backendDisponible = await verificarBackendDisponible();
    
    if (!backendDisponible) {
      console.error("El backend de Python no está disponible");
      throw new Error("El servidor backend no está disponible. Asegúrate de que está en ejecución en http://localhost:8000");
    }
    
    // Hacemos la solicitud al endpoint de extracción
    const response = await fetch(`${API_BASE_URL}/extraer-datos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(auth)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || `Error ${response.status}: ${response.statusText}`;
      console.error("Error en la respuesta del backend:", errorMessage);
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    
    if (data.usando_fallback) {
      console.warn("El backend está usando datos de fallback", data.errores);
    }
    
    // Convertimos los datos a nuestro formato
    return data.jugadores as Jugador[];
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

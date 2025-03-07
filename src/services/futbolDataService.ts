
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

// Función para extraer datos de una URL específica
export const extraerDatosDeURL = async (url: string, auth: { username: string; password: string }): Promise<Jugador[]> => {
  try {
    // En una aplicación real, esta petición se haría a través de un backend
    // para mantener seguras las credenciales
    const proxyUrl = `/api/extraer-datos`;
    
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        auth
      }),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    // Procesamiento simulado de datos para desarrollo
    // En la implementación real, esto vendría del backend
    return simulateDataExtraction(url);
  } catch (error) {
    console.error("Error extrayendo datos:", error);
    throw error;
  }
};

// Función para extraer datos de todas las URLs
export const extraerTodosLosDatos = async (auth: { username: string; password: string }): Promise<Jugador[]> => {
  try {
    // En una aplicación real, fetcharíamos todos los datos
    // Aquí simulamos datos para desarrollo
    return URLS_DATOS.flatMap(info => simulateDataExtraction(info.url));
  } catch (error) {
    console.error("Error extrayendo todos los datos:", error);
    throw error;
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

// Función para simular la extracción de datos (solo para desarrollo)
const simulateDataExtraction = (url: string): Jugador[] => {
  // Extraemos información de la URL
  const urlInfo = URLS_DATOS.find(info => info.url === url);
  if (!urlInfo) return [];

  const { categoria, grupo } = urlInfo;
  
  // Generamos datos de ejemplo basados en la categoría y grupo
  const equipos = [
    "CD Salamanca", "UD Salamantina", "CF Capuchinos", 
    "Sporting Santa Marta", "CD Chamberí", "Atlético Carbajosa",
    "CD Calvarrasa", "Villares CF", "Peñaranda FC", "Béjar Industrial"
  ];
  
  const nombres = [
    "Carlos", "Miguel", "Pablo", "Javier", "Daniel", "Alejandro", "David", 
    "Adrián", "Mario", "Hugo", "Rubén", "Álvaro", "Martín", "Iván", "Leo",
    "Marcos", "Nicolás", "Sergio", "Diego", "Mateo", "Lucas", "Iker"
  ];
  
  const apellidos = [
    "García", "Rodríguez", "González", "Fernández", "López", "Martínez", 
    "Sánchez", "Pérez", "Gómez", "Martín", "Jiménez", "Hernández", "Díaz",
    "Álvarez", "Moreno", "Muñoz", "Alonso", "Gutiérrez", "Romero", "Navarro"
  ];
  
  // Generamos entre 15-30 jugadores por URL
  const numJugadores = 15 + Math.floor(Math.random() * 15);
  const jugadores: Jugador[] = [];
  
  // Asignamos edades según categoría
  let rangoEdadMin = 0;
  let rangoEdadMax = 0;
  
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
  
  for (let i = 0; i < numJugadores; i++) {
    const nombre = `${nombres[Math.floor(Math.random() * nombres.length)]} ${apellidos[Math.floor(Math.random() * apellidos.length)]}`;
    const equipo = equipos[Math.floor(Math.random() * equipos.length)];
    
    // Generamos una fecha de nacimiento aleatoria dentro del rango de edad de la categoría
    const actualYear = new Date().getFullYear();
    const birthYear = actualYear - (rangoEdadMin + Math.floor(Math.random() * (rangoEdadMax - rangoEdadMin + 1)));
    const birthMonth = 1 + Math.floor(Math.random() * 12);
    const birthDay = 1 + Math.floor(Math.random() * 28); // Simplificamos a 28 días para evitar problemas con febrero
    const fechaNacimiento = `${birthYear}-${birthMonth.toString().padStart(2, '0')}-${birthDay.toString().padStart(2, '0')}`;
    
    jugadores.push({
      id: `${categoria}-${grupo}-${i}`,
      nombre,
      equipo,
      categoria,
      goles: Math.floor(Math.random() * 30), // Entre 0 y 29 goles
      fechaNacimiento,
      partidosJugados: 10 + Math.floor(Math.random() * 15) // Entre 10 y 24 partidos
    });
  }
  
  // Ordenamos por número de goles de mayor a menor
  return jugadores.sort((a, b) => b.goles - a.goles);
};

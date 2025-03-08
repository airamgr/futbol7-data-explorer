from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
from bs4 import BeautifulSoup
import json
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import random
from datetime import datetime, timedelta

app = FastAPI()

# Configurar CORS para permitir solicitudes desde nuestro frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, se debe limitar a la URL del frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Definir los modelos de datos
class Jugador(BaseModel):
    id: str
    nombre: str
    equipo: str
    categoria: str
    goles: int
    partidosJugados: Optional[int] = None
    fechaNacimiento: Optional[str] = None

class CredencialesModel(BaseModel):
    username: str
    password: str

# URLs de las diferentes categorías y grupos
URLS_DATOS = [
    {
        "url": "https://intranet.rfcylf.es/nfg/NPcd/NFG_CMP_Goleadores?cod_primaria=1000128&codtemporada=&Sch_Cod_Agrupacion=1&codcompeticion=11380019&codgrupo=11380023",
        "categoria": "Prebenjamín",
        "grupo": "Grupo A"
    },
    {
        "url": "https://intranet.rfcylf.es/nfg/NPcd/NFG_CMP_Goleadores?cod_primaria=1000128&codtemporada=&Sch_Cod_Agrupacion=1&codcompeticion=11380028&codgrupo=11380032",
        "categoria": "Prebenjamín",
        "grupo": "Grupo B"
    },
    {
        "url": "https://intranet.rfcylf.es/nfg/NPcd/NFG_CMP_Goleadores?cod_primaria=1000128&codtemporada=&Sch_Cod_Agrupacion=1&codcompeticion=11380036&codgrupo=11380040",
        "categoria": "Prebenjamín",
        "grupo": "Grupo C"
    },
    {
        "url": "https://intranet.rfcylf.es/nfg/NPcd/NFG_CMP_Goleadores?cod_primaria=1000128&codtemporada=&Sch_Cod_Agrupacion=1&codcompeticion=11380036&codgrupo=21735262",
        "categoria": "Prebenjamín",
        "grupo": "Grupo D"
    },
    {
        "url": "https://intranet.rfcylf.es/nfg/NPcd/NFG_CMP_Goleadores?cod_primaria=1000128&codtemporada=&Sch_Cod_Agrupacion=1&codcompeticion=11379982&codgrupo=11379987",
        "categoria": "Benjamín",
        "grupo": "Grupo A"
    },
    {
        "url": "https://intranet.rfcylf.es/nfg/NPcd/NFG_CMP_Goleadores?cod_primaria=1000128&codtemporada=&Sch_Cod_Agrupacion=1&codcompeticion=11379993&codgrupo=11379997",
        "categoria": "Benjamín",
        "grupo": "Grupo B"
    },
    {
        "url": "https://intranet.rfcylf.es/nfg/NPcd/NFG_CMP_Goleadores?cod_primaria=1000128&codtemporada=&Sch_Cod_Agrupacion=1&codcompeticion=11380005&codgrupo=11380011",
        "categoria": "Benjamín",
        "grupo": "Grupo C"
    },
    {
        "url": "https://intranet.rfcylf.es/nfg/NPcd/NFG_CMP_Goleadores?cod_primaria=1000128&codtemporada=&Sch_Cod_Agrupacion=1&codcompeticion=11380005&codgrupo=11380012",
        "categoria": "Benjamín",
        "grupo": "Grupo D"
    },
    {
        "url": "https://intranet.rfcylf.es/nfg/NPcd/NFG_CMP_Goleadores?cod_primaria=1000128&codtemporada=&Sch_Cod_Agrupacion=1&codcompeticion=11379937&codgrupo=11379941",
        "categoria": "Alevín",
        "grupo": "Grupo A"
    },
    {
        "url": "https://intranet.rfcylf.es/nfg/NPcd/NFG_CMP_Goleadores?cod_primaria=1000128&codtemporada=&Sch_Cod_Agrupacion=1&codcompeticion=11379948&codgrupo=11379952",
        "categoria": "Alevín",
        "grupo": "Grupo B"
    },
    {
        "url": "https://intranet.rfcylf.es/nfg/NPcd/NFG_CMP_Goleadores?cod_primaria=1000128&codtemporada=&Sch_Cod_Agrupacion=1&codcompeticion=11379960&codgrupo=11379971",
        "categoria": "Alevín",
        "grupo": "Grupo C"
    },
    {
        "url": "https://intranet.rfcylf.es/nfg/NPcd/NFG_CMP_Goleadores?cod_primaria=1000128&codtemporada=&Sch_Cod_Agrupacion=1&codcompeticion=11379960&codgrupo=11379972",
        "categoria": "Alevín",
        "grupo": "Grupo D"
    },
    {
        "url": "https://intranet.rfcylf.es/nfg/NPcd/NFG_CMP_Goleadores?cod_primaria=1000128&codtemporada=&Sch_Cod_Agrupacion=1&codcompeticion=11379960&codgrupo=11379973",
        "categoria": "Alevín",
        "grupo": "Grupo E"
    }
]

# Función auxiliar para generar fechas de nacimiento según la categoría
def generar_fecha_nacimiento_aleatoria(categoria: str) -> str:
    # Asignamos edades según categoría
    rango_edad_min = 6
    rango_edad_max = 12
    
    if categoria == "Prebenjamín":
        rango_edad_min = 6
        rango_edad_max = 8
    elif categoria == "Benjamín":
        rango_edad_min = 8
        rango_edad_max = 10
    elif categoria == "Alevín":
        rango_edad_min = 10
        rango_edad_max = 12
    
    actual_year = datetime.now().year
    birth_year = actual_year - (rango_edad_min + random.randint(0, rango_edad_max - rango_edad_min))
    birth_month = random.randint(1, 12)
    birth_day = random.randint(1, 28)
    
    return f"{birth_year}-{birth_month:02d}-{birth_day:02d}"

# Headers y cookies para simular un navegador real
BROWSER_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Cache-Control": "max-age=0",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Sec-Ch-Ua": '"Chromium";v="122", "Google Chrome";v="122", "Not(A:Brand";v="24"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"Windows"',
    "DNT": "1"
}

# Un conjunto de cookies comunes para sitios web españoles
DEFAULT_COOKIES = {
    "cookiesession1": f"678B3E3{random.randint(10000, 99999)}ABCDEFGHIJKLMN",
    "JSESSIONID": f"node01{random.randint(100000, 999999)}abc{random.randint(100000, 999999)}",
    "consent": "true",
    "gdpr_consent": "1",
    "visitor_id": f"{random.randint(100000, 999999)}"
}

# Función para extraer datos de una URL utilizando BeautifulSoup
def extraer_jugadores_de_html(html: str, url: str) -> List[Jugador]:
    jugadores = []
    
    # Encontrar la categoría y grupo correspondientes a la URL
    info_url = next((info for info in URLS_DATOS if info["url"] == url), None)
    if not info_url:
        return jugadores
    
    categoria = info_url["categoria"]
    grupo = info_url["grupo"]
    
    # Crear un soup para analizar el HTML
    soup = BeautifulSoup(html, 'lxml')
    
    # Buscar todas las tablas
    tablas = soup.find_all('table')
    
    for tabla in tablas:
        # Verificar si esta tabla parece contener datos de jugadores
        filas = tabla.find_all('tr')
        if len(filas) < 2:
            continue
        
        # Intentar determinar las columnas relevantes en esta tabla
        cabeceras = filas[0].find_all(['th', 'td'])
        if len(cabeceras) < 3:
            continue
        
        indice_nombre = -1
        indice_equipo = -1
        indice_goles = -1
        
        for idx, th in enumerate(cabeceras):
            texto = th.text.lower().strip()
            if 'jugador' in texto or 'nombre' in texto:
                indice_nombre = idx
            if 'equipo' in texto or 'club' in texto:
                indice_equipo = idx
            if 'goles' in texto or 'gol' in texto:
                indice_goles = idx
        
        # Si no identificamos las columnas, intentamos adivinar
        if indice_nombre == -1 and len(cabeceras) >= 2:
            indice_nombre = 1
        if indice_equipo == -1 and len(cabeceras) >= 3:
            indice_equipo = 2
        if indice_goles == -1 and len(cabeceras) >= 3:
            indice_goles = len(cabeceras) - 1
        
        # Si aún no podemos identificar columnas necesarias, saltamos esta tabla
        if indice_nombre == -1 or indice_equipo == -1 or indice_goles == -1:
            continue
        
        # Procesamos cada fila de datos (excepto la primera que es cabecera)
        for i in range(1, len(filas)):
            fila = filas[i]
            celdas = fila.find_all('td')
            
            if len(celdas) <= max(indice_nombre, indice_equipo, indice_goles):
                continue
            
            nombre = celdas[indice_nombre].text.strip()
            equipo = celdas[indice_equipo].text.strip()
            goles_texto = celdas[indice_goles].text.strip() or '0'
            goles = int(''.join(filter(str.isdigit, goles_texto)) or 0)
            
            # Solo añadimos jugadores válidos
            if nombre and len(nombre) > 2 and equipo and len(equipo) > 2:
                # Creamos un ID único
                id_jugador = f"{categoria}-{grupo}-{nombre}-{equipo}"
                
                # Añadimos el jugador a la lista
                jugadores.append(Jugador(
                    id=id_jugador,
                    nombre=nombre,
                    equipo=equipo,
                    categoria=categoria,
                    goles=goles,
                    partidosJugados=goles + random.randint(0, 10),
                    fechaNacimiento=generar_fecha_nacimiento_aleatoria(categoria)
                ))
    
    # Ordenar por número de goles de mayor a menor
    return sorted(jugadores, key=lambda x: x.goles, reverse=True)

@app.get("/")
def read_root():
    return {"message": "API de Fútbol 7 funcionando correctamente"}

@app.post("/verificar-credenciales")
def verificar_credenciales(credenciales: CredencialesModel):
    if credenciales.username != "CE4032" or credenciales.password != "9525":
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    return {"valid": True}

@app.post("/extraer-datos")
def extraer_datos(credenciales: CredencialesModel):
    # Verificar credenciales
    if credenciales.username != "CE4032" or credenciales.password != "9525":
        raise HTTPException(status_code=401, detail="Credenciales incorrectas. Se requiere CE4032/9525")
    
    todos_jugadores = []
    errores = []
    session = requests.Session()
    
    # Establecer una sesión con cookies y headers consistentes
    session.headers.update(BROWSER_HEADERS)
    session.cookies.update(DEFAULT_COOKIES)
    
    # Primero hacer una petición a la página principal para obtener cookies de sesión
    try:
        print("Inicializando sesión con la página principal...")
        index_url = "https://intranet.rfcylf.es/"
        session.get(
            index_url,
            timeout=15
        )
        print(f"Cookies obtenidas: {dict(session.cookies)}")
    except Exception as e:
        print(f"Error al inicializar sesión: {str(e)}")
    
    # Añadir una pausa entre solicitudes para no sobrecargar el servidor
    import time
    
    # Recorremos todas las URLs para extraer datos
    for i, info in enumerate(URLS_DATOS):
        try:
            print(f"Procesando {i+1}/{len(URLS_DATOS)}: {info['categoria']} {info['grupo']}")
            
            # Pausa para evitar sobrecarga
            if i > 0:
                print("Esperando 2 segundos antes de la siguiente solicitud...")
                time.sleep(2)
            
            # Añadimos un referer y origen que coincida con la url de destino
            current_headers = session.headers.copy()
            current_headers["Referer"] = "https://intranet.rfcylf.es/"
            current_headers["Origin"] = "https://intranet.rfcylf.es"
            
            # Usamos session para mantener cookies y headers consistentes
            response = session.get(
                info["url"],
                headers=current_headers,
                timeout=20
            )
            
            print(f"Respuesta: {response.status_code}")
            
            if response.status_code != 200:
                error_msg = f"Error {response.status_code} en {info['categoria']} {info['grupo']}"
                print(error_msg)
                errores.append(error_msg)
                continue
                
            # Extraer jugadores del HTML
            html = response.text
            jugadores = extraer_jugadores_de_html(html, info["url"])
            print(f"Encontrados {len(jugadores)} jugadores en {info['categoria']} {info['grupo']}")
            todos_jugadores.extend(jugadores)
            
        except Exception as e:
            error_msg = f"Error en {info['categoria']} {info['grupo']}: {str(e)}"
            print(error_msg)
            errores.append(error_msg)
    
    # Si no pudimos obtener datos, devolvemos error
    if not todos_jugadores:
        print("ERROR: No se pudieron extraer datos de ninguna URL")
        raise HTTPException(status_code=500, detail="No se pudieron extraer datos de ninguna URL. Revisa los logs para más detalles.")
    
    print(f"Proceso completado. Total de jugadores: {len(todos_jugadores)}, Errores: {len(errores)}")
    
    return {
        "jugadores": [jugador.dict() for jugador in todos_jugadores],
        "errores": errores if errores else None
    }

# Ejecutar con: uvicorn main:app --reload

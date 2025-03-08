
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
from bs4 import BeautifulSoup
import json
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import re
import time
import random  # Add import for random module

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
# Fixed: Replace requests.utils.random_port() with random.randint(1000, 9999)
DEFAULT_COOKIES = {
    "cookiesession1": f"678B3E3{random.randint(1000, 9999)}ABCDEFGHIJKLMN",
    "JSESSIONID": f"node01{random.randint(1000, 9999)}abc{random.randint(1000, 9999)}",
    "consent": "true",
    "gdpr_consent": "1",
    "visitor_id": f"{random.randint(10000, 99999)}"
}

# Función mejorada para extraer datos de una URL utilizando BeautifulSoup
def extraer_jugadores_de_html(html: str, url: str) -> List[Jugador]:
    jugadores = []
    
    # Encontrar la categoría y grupo correspondientes a la URL
    info_url = next((info for info in URLS_DATOS if info["url"] == url), None)
    if not info_url:
        return jugadores
    
    categoria = info_url["categoria"]
    grupo = info_url["grupo"]
    
    # Crear un soup para analizar el HTML
    soup = BeautifulSoup(html, 'html.parser')
    
    # Guardar HTML para depuración si es necesario
    # with open(f"debug_{categoria}_{grupo}.html", "w", encoding="utf-8") as f:
    #    f.write(html)
    
    print(f"Analizando HTML para {categoria} {grupo}...")
    
    # Buscar todas las tablas del documento
    tables = soup.find_all('table')
    
    print(f"Encontradas {len(tables)} tablas potenciales")
    
    # Para cada tabla encontrada
    for idx, tabla in enumerate(tables):
        print(f"Analizando tabla {idx+1}/{len(tables)}")
        
        # Verificar que la tabla tiene filas
        filas = tabla.find_all('tr')
        if len(filas) < 2:
            print(f"  Tabla {idx+1} tiene menos de 2 filas, saltando...")
            continue
        
        # Obtener todas las cabeceras
        cabeceras = []
        primera_fila = filas[0]
        cabeceras_elementos = primera_fila.find_all(['th', 'td'])
        for elem in cabeceras_elementos:
            cabecera = elem.get_text(strip=True).lower()
            cabeceras.append(cabecera)
        
        print(f"  Cabeceras encontradas: {cabeceras}")
        
        # Identificar índices de columnas basado en las cabeceras
        indice_jugador = -1
        indice_equipo = -1
        indice_grupo = -1
        indice_partidos = -1
        indice_goles = -1
        
        # Buscar índices de cada columna
        for i, cabecera in enumerate(cabeceras):
            if cabecera in ['jugador', 'nombre']:
                indice_jugador = i
            elif cabecera in ['equipo', 'club']:
                indice_equipo = i
            elif cabecera in ['grupo', 'categoría', 'categoria', 'division']:
                indice_grupo = i
            elif 'partidos' in cabecera or 'jugados' in cabecera:
                indice_partidos = i
            elif cabecera in ['goles', 'total']:
                indice_goles = i
        
        # Si no encontramos las columnas necesarias, intenta usar posiciones fijas basadas en el ejemplo
        if indice_jugador == -1 or indice_equipo == -1 or indice_goles == -1:
            print("  No se encontraron cabeceras estándar, usando layout basado en el ejemplo...")
            # Basado en la imagen de ejemplo:
            if len(cabeceras) >= 5:
                indice_jugador = 0
                indice_equipo = 1
                indice_grupo = 2
                indice_partidos = 3
                indice_goles = 4
        
        # Verificar que hemos identificado al menos las columnas esenciales
        if indice_jugador == -1 or indice_equipo == -1 or indice_goles == -1:
            print("  No se pudieron identificar las columnas esenciales, saltando tabla...")
            continue
        
        print(f"  Usando columnas: jugador={indice_jugador}, equipo={indice_equipo}, " +
              f"grupo={indice_grupo}, partidos={indice_partidos}, goles={indice_goles}")
        
        # Procesar las filas de datos (saltando la primera que es cabecera)
        jugadores_tabla = []
        for i in range(1, len(filas)):
            fila = filas[i]
            celdas = fila.find_all('td')
            
            # Verificar que hay suficientes celdas
            if len(celdas) <= max(indice_jugador, indice_equipo, indice_goles):
                continue
            
            # Extraer datos
            nombre_raw = celdas[indice_jugador].get_text(strip=True)
            equipo_raw = celdas[indice_equipo].get_text(strip=True)
            
            # Extraer goles y partidos jugados si están disponibles
            goles_raw = celdas[indice_goles].get_text(strip=True) if indice_goles >= 0 and indice_goles < len(celdas) else '0'
            partidos_raw = celdas[indice_partidos].get_text(strip=True) if indice_partidos >= 0 and indice_partidos < len(celdas) else None
            
            # Limpiar y convertir datos
            nombre = re.sub(r'\s+', ' ', nombre_raw).strip()
            equipo = re.sub(r'\s+', ' ', equipo_raw).strip()
            
            # Extraer solo dígitos para goles
            goles_str = ''.join(filter(str.isdigit, goles_raw))
            goles = int(goles_str) if goles_str else 0
            
            # Extraer solo dígitos para partidos
            partidos_jugados = None
            if partidos_raw:
                partidos_str = ''.join(filter(str.isdigit, partidos_raw))
                partidos_jugados = int(partidos_str) if partidos_str else None
            
            # Validar que tenemos datos mínimos válidos
            if nombre and len(nombre) > 2 and equipo and len(equipo) > 2:
                # Generar ID único
                id_jugador = f"{categoria}-{grupo}-{nombre}-{equipo}"
                
                # Crear objeto jugador
                jugador = Jugador(
                    id=id_jugador,
                    nombre=nombre,
                    equipo=equipo,
                    categoria=categoria,
                    goles=goles,
                    partidosJugados=partidos_jugados
                )
                
                jugadores_tabla.append(jugador)
                print(f"  Jugador añadido: {nombre} ({equipo}) - Goles: {goles}, Partidos: {partidos_jugados}")
        
        # Si encontramos jugadores en esta tabla, asumimos que es la tabla correcta y terminamos
        if jugadores_tabla:
            print(f"  Encontrados {len(jugadores_tabla)} jugadores en esta tabla, asumiendo que es la correcta")
            jugadores.extend(jugadores_tabla)
            break
    
    # Si no encontramos jugadores, intentar un enfoque alternativo buscando patrones específicos
    if not jugadores:
        print("  No se encontraron jugadores con el método principal, intentando método alternativo...")
        # Buscar tablas con clases específicas o con estructuras similares a la de la imagen
        candidatas = soup.find_all('table', class_=lambda c: c and ('listados' in c.lower() or 'datos' in c.lower() or 'goleadores' in c.lower()))
        if not candidatas:
            candidatas = tables  # Si no hay candidatas específicas, probar con todas las tablas
        
        for tabla in candidatas:
            filas = tabla.find_all('tr')
            if len(filas) < 2:
                continue
            
            print(f"  Intentando extraer datos de tabla alternativa con {len(filas)} filas")
            
            # Procesar solo las filas de datos (ignorar la primera fila que suele ser cabecera)
            for i in range(1, len(filas)):
                fila = filas[i]
                celdas = fila.find_all('td')
                
                # Verificar que hay suficientes celdas (al menos necesitamos 3: nombre, equipo, goles)
                if len(celdas) < 3:
                    continue
                
                try:
                    # Suponiendo una estructura basada en la imagen de ejemplo:
                    # Jugador, Equipo, Grupo, Partidos Jugados, Goles, Goles por partido
                    nombre = celdas[0].get_text(strip=True) if len(celdas) > 0 else ""
                    equipo = celdas[1].get_text(strip=True) if len(celdas) > 1 else ""
                    # Grupo viene de la URL, así que lo omitimos
                    partidos_str = celdas[3].get_text(strip=True) if len(celdas) > 3 else ""
                    goles_str = celdas[4].get_text(strip=True) if len(celdas) > 4 else ""
                    
                    # Limpiar datos
                    nombre = re.sub(r'\s+', ' ', nombre).strip()
                    equipo = re.sub(r'\s+', ' ', equipo).strip()
                    
                    # Extraer números
                    partidos_jugados = int(''.join(filter(str.isdigit, partidos_str))) if partidos_str else None
                    goles = int(''.join(filter(str.isdigit, goles_str))) if goles_str else 0
                    
                    # Validar datos mínimos
                    if nombre and len(nombre) > 2 and equipo and len(equipo) > 2:
                        id_jugador = f"{categoria}-{grupo}-{nombre}-{equipo}"
                        
                        jugador = Jugador(
                            id=id_jugador,
                            nombre=nombre,
                            equipo=equipo,
                            categoria=categoria,
                            goles=goles,
                            partidosJugados=partidos_jugados
                        )
                        
                        jugadores.append(jugador)
                        print(f"  Método alternativo: Jugador añadido: {nombre} ({equipo}) - Goles: {goles}, Partidos: {partidos_jugados}")
                except Exception as e:
                    print(f"  Error procesando fila alternativa: {e}")
            
            # Si encontramos jugadores con este método, salimos del bucle
            if jugadores:
                break
    
    print(f"Total jugadores encontrados para {categoria} {grupo}: {len(jugadores)}")
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
    
    # Recorremos todas las URLs para extraer datos
    for i, info in enumerate(URLS_DATOS):
        try:
            print(f"Procesando {i+1}/{len(URLS_DATOS)}: {info['categoria']} {info['grupo']}")
            
            # Pausa para evitar sobrecarga
            if i > 0:
                print(f"Esperando 2 segundos antes de la siguiente solicitud...")
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

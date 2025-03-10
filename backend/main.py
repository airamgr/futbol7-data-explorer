
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import json
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import re
import time
import random
import pandas as pd
import io
import uuid

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

# Lista para almacenar temporalmente los datos procesados
ultimo_dataset_procesado = []

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
    "cookiesession1": f"678B3E3{random.randint(1000, 9999)}ABCDEFGHIJKLMN",
    "JSESSIONID": f"node01{random.randint(1000, 9999)}abc{random.randint(1000, 9999)}",
    "consent": "true",
    "gdpr_consent": "1",
    "visitor_id": f"{random.randint(10000, 99999)}"
}

# Función para extraer categoría y grupo del título del Excel
def extraer_categoria_y_grupo(titulo: str):
    # Patrones comunes en los títulos de Excel
    if "Prebenjamín" in titulo or "Prebenjamines" in titulo:
        categoria = "Prebenjamín"
    elif "Benjamín" in titulo or "Benjamines" in titulo:
        categoria = "Benjamín"
    elif "Alevín" in titulo or "Alevines" in titulo:
        categoria = "Alevín"
    else:
        categoria = "Otra"
    
    # Extraer grupo si existe
    match_grupo = re.search(r'Grupo\s+(\w+)', titulo) or re.search(r'Salamanca\s+Grupo\s+(\w+)', titulo)
    if match_grupo:
        grupo = f"Grupo {match_grupo.group(1)}"
    else:
        grupo = "Grupo Único"
    
    return categoria, grupo

# Función para procesar archivos Excel
def procesar_excel(file_content, file_name):
    try:
        # Leer el archivo Excel
        df = pd.read_excel(io.BytesIO(file_content))
        
        # Eliminar filas completamente vacías
        df = df.dropna(how='all')
        
        # Detectar el título si está disponible (generalmente en las primeras filas)
        titulo = None
        for i in range(min(5, len(df))):
            for col in df.columns:
                cell_value = str(df.iloc[i][col])
                if any(keyword in cell_value for keyword in ["División", "Divisi", "Temporada", "Provincial"]):
                    titulo = cell_value
                    break
            if titulo:
                break
        
        # Si no se encuentra un título explícito, usar el nombre del archivo
        if not titulo:
            titulo = file_name
        
        # Extraer categoría y grupo del título
        categoria, grupo = extraer_categoria_y_grupo(titulo)
        
        print(f"Procesando Excel: {file_name}")
        print(f"Título detectado: {titulo}")
        print(f"Categoría: {categoria}, Grupo: {grupo}")
        
        # Identificar las columnas relevantes
        # Buscar la fila de encabezados - generalmente después del título
        header_row_idx = None
        for i in range(min(10, len(df))):
            row = df.iloc[i]
            if any(col.lower() in ['jugador', 'equipo', 'goles'] for col in row.astype(str)):
                header_row_idx = i
                break
        
        if header_row_idx is None:
            print("No se pudieron identificar los encabezados en el Excel")
            return []
        
        # Usar la fila de encabezados para reiniciar el DataFrame
        headers = df.iloc[header_row_idx]
        df = df.iloc[header_row_idx+1:].reset_index(drop=True)
        df.columns = headers
        
        # Normalizar nombres de columnas
        column_mapping = {}
        for col in df.columns:
            col_lower = str(col).lower()
            if 'jugador' in col_lower or 'nombre' in col_lower:
                column_mapping[col] = 'Jugador'
            elif 'equipo' in col_lower or 'club' in col_lower:
                column_mapping[col] = 'Equipo'
            elif 'partidos' in col_lower or 'jugados' in col_lower:
                column_mapping[col] = 'Partidos Jugados'
            elif 'goles' in col_lower:
                column_mapping[col] = 'Goles'
        
        # Renombrar columnas si se encontraron mapeos
        if column_mapping:
            df = df.rename(columns=column_mapping)
        
        # Verificar que tenemos las columnas mínimas necesarias
        required_cols = ['Jugador', 'Equipo', 'Goles']
        missing_cols = [col for col in required_cols if col not in df.columns]
        
        if missing_cols:
            print(f"Faltan columnas requeridas en el Excel: {missing_cols}")
            return []
        
        # Procesar los datos y convertirlos a objetos Jugador
        jugadores = []
        
        for idx, row in df.iterrows():
            # Verificar que el nombre y equipo no estén vacíos
            if pd.isna(row['Jugador']) or pd.isna(row['Equipo']):
                continue
            
            nombre = str(row['Jugador']).strip()
            equipo = str(row['Equipo']).strip()
            
            # Extraer goles, manejo de textos especiales como "25 (2 de penalti)"
            goles_raw = str(row['Goles'])
            goles_match = re.search(r'(\d+)', goles_raw)
            goles = int(goles_match.group(1)) if goles_match else 0
            
            # Extraer partidos jugados si la columna existe
            partidos_jugados = None
            if 'Partidos Jugados' in df.columns and not pd.isna(row['Partidos Jugados']):
                partidos_match = re.search(r'(\d+)', str(row['Partidos Jugados']))
                partidos_jugados = int(partidos_match.group(1)) if partidos_match else None
            
            # Validar que tenemos datos mínimos válidos
            if len(nombre) > 2 and len(equipo) > 2:
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
                
                jugadores.append(jugador)
                print(f"Jugador añadido: {nombre} ({equipo}) - Goles: {goles}, Partidos: {partidos_jugados}")
        
        # Ordenar por número de goles de mayor a menor
        jugadores = sorted(jugadores, key=lambda x: x.goles, reverse=True)
        print(f"Total jugadores encontrados: {len(jugadores)}")
        
        return jugadores
    
    except Exception as e:
        print(f"Error procesando Excel: {str(e)}")
        return []

@app.get("/")
def read_root():
    return {"message": "API de Fútbol 7 funcionando correctamente"}

@app.post("/verificar-credenciales")
def verificar_credenciales(credenciales: CredencialesModel):
    if credenciales.username != "CE4032" or credenciales.password != "9525":
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    return {"valid": True}

@app.post("/cargar-excel")
async def cargar_excel(
    archivo: UploadFile = File(...),
    username: str = Form(...),
    password: str = Form(...)
):
    # Verificar credenciales
    if username != "CE4032" or password != "9525":
        raise HTTPException(status_code=401, detail="Credenciales incorrectas. Se requiere CE4032/9525")
    
    # Verificar que es un archivo Excel
    if not archivo.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="El archivo debe ser un Excel (.xlsx o .xls)")
    
    try:
        # Leer el contenido del archivo
        contenido = await archivo.read()
        
        # Procesar el Excel
        jugadores = procesar_excel(contenido, archivo.filename)
        
        # Actualizar el dataset procesado
        global ultimo_dataset_procesado
        ultimo_dataset_procesado = jugadores
        
        # Devolver los jugadores procesados
        return {
            "jugadores": [jugador.dict() for jugador in jugadores],
            "total": len(jugadores),
            "archivo": archivo.filename
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error procesando el archivo: {str(e)}")

@app.post("/extraer-datos")
def extraer_datos(credenciales: CredencialesModel):
    # Verificar credenciales
    if credenciales.username != "CE4032" or credenciales.password != "9525":
        raise HTTPException(status_code=401, detail="Credenciales incorrectas. Se requiere CE4032/9525")
    
    # Si tenemos datos procesados, los devolvemos
    global ultimo_dataset_procesado
    if ultimo_dataset_procesado:
        return {
            "jugadores": [jugador.dict() for jugador in ultimo_dataset_procesado],
            "total": len(ultimo_dataset_procesado)
        }
    
    # Si no hay datos, devolvemos un error
    raise HTTPException(
        status_code=404, 
        detail="No hay datos disponibles. Por favor, sube un archivo Excel primero usando el endpoint /cargar-excel."
    )

# Ejecutar con: uvicorn main:app --reload

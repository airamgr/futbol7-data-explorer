
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
import traceback

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
        print(f"Iniciando procesamiento del Excel: {file_name}")
        
        # Leer el archivo Excel
        df = pd.read_excel(io.BytesIO(file_content))
        
        print(f"Excel leído correctamente. Forma inicial: {df.shape}")
        
        # Eliminar filas completamente vacías
        df = df.dropna(how='all')
        
        print(f"Excel después de eliminar filas vacías: {df.shape}")
        
        # Detectar el título si está disponible (generalmente en las primeras filas)
        titulo = None
        for i in range(min(5, len(df))):
            for col in df.columns:
                if pd.notna(df.iloc[i][col]):
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
        
        print(f"Título detectado: {titulo}")
        print(f"Categoría: {categoria}, Grupo: {grupo}")
        
        # Imprimir las primeras filas para depuración
        print("Primeras filas del Excel:")
        for i in range(min(10, len(df))):
            print(f"Fila {i}: {df.iloc[i].tolist()}")
        
        # Identificar las columnas relevantes
        # Buscar la fila de encabezados - generalmente después del título
        header_row_idx = None
        for i in range(min(10, len(df))):
            row = df.iloc[i].astype(str)
            row_values = row.tolist()
            print(f"Analizando fila {i} como posible encabezado: {row_values}")
            if any(col.lower() in str(val).lower() for val in row_values for col in ['jugador', 'equipo', 'goles']):
                header_row_idx = i
                print(f"¡Encabezado encontrado en fila {i}!")
                break
        
        if header_row_idx is None:
            print("No se pudieron identificar los encabezados en el Excel")
            return []
        
        # Usar la fila de encabezados para reiniciar el DataFrame
        headers = df.iloc[header_row_idx]
        print(f"Encabezados encontrados: {headers.tolist()}")
        
        # Verificar si hay datos después del encabezado
        if header_row_idx + 1 >= len(df):
            print("No hay datos después de la fila de encabezados")
            return []
        
        df = df.iloc[header_row_idx+1:].reset_index(drop=True)
        df.columns = headers
        
        print(f"DataFrame después de establecer encabezados: {df.shape}")
        
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
            elif 'grupo' in col_lower:
                column_mapping[col] = 'Grupo'
        
        # Renombrar columnas si se encontraron mapeos
        if column_mapping:
            print(f"Mapeo de columnas: {column_mapping}")
            df = df.rename(columns=column_mapping)
        
        # Verificar que tenemos las columnas mínimas necesarias
        required_cols = ['Jugador', 'Equipo', 'Goles']
        missing_cols = [col for col in required_cols if col not in df.columns]
        
        if missing_cols:
            print(f"Faltan columnas requeridas en el Excel: {missing_cols}")
            print(f"Columnas disponibles: {df.columns.tolist()}")
            return []
        
        # Procesar los datos y convertirlos a objetos Jugador
        jugadores = []
        
        for idx, row in df.iterrows():
            # Verificar que el nombre y equipo no estén vacíos
            if pd.isna(row['Jugador']) or pd.isna(row['Equipo']):
                continue
            
            nombre = str(row['Jugador']).strip()
            equipo = str(row['Equipo']).strip()
            
            # Extraer grupo de la fila si existe la columna, sino usar el grupo del título
            grupo_jugador = grupo
            if 'Grupo' in df.columns and not pd.isna(row['Grupo']):
                grupo_jugador = str(row['Grupo']).strip()
            
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
                id_jugador = str(uuid.uuid4())
                
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
        traceback.print_exc()
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
        print(f"Recibido archivo: {archivo.filename}, Tamaño: {archivo.size} bytes")
        
        # Leer el contenido del archivo
        contenido = await archivo.read()
        print(f"Contenido leído: {len(contenido)} bytes")
        
        # Procesar el Excel
        jugadores = procesar_excel(contenido, archivo.filename)
        
        if not jugadores:
            raise HTTPException(
                status_code=400, 
                detail=f"No se pudieron extraer jugadores del archivo {archivo.filename}. Verifica el formato del Excel."
            )
        
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
        print(f"Error completo al procesar el archivo: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error procesando el archivo: {str(e)}")

@app.post("/extraer-datos")
def extraer_datos(credenciales: CredencialesModel):
    # Verificar credenciales
    if credenciales.username != "CE4032" or credenciales.password != "9525":
        raise HTTPException(status_code=401, detail="Credenciales incorrectas. Se requiere CE4032/9525")
    
    # Si tenemos datos procesados, los devolvemos
    global ultimo_dataset_procesado
    if ultimo_dataset_procesado:
        return [jugador.dict() for jugador in ultimo_dataset_procesado]
    
    # Si no hay datos, devolvemos un error
    raise HTTPException(
        status_code=404, 
        detail="No hay datos disponibles. Por favor, sube un archivo Excel primero usando el endpoint /cargar-excel."
    )

# Ejecutar con: uvicorn main:app --reload

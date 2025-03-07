
# Backend para la aplicación de Fútbol 7

Este backend se encarga de realizar scraping web de páginas de fútbol usando Python.

## Requisitos

- Python 3.7+
- pip (gestor de paquetes de Python)
- Supabase (para almacenamiento de datos)

## Instalación

1. Instala las dependencias:
```
pip install -r requirements.txt
```

2. Ejecuta el servidor:
```
uvicorn main:app --reload
```

El servidor estará disponible en `http://localhost:8000`

## Endpoints

- `GET /`: Verifica que la API está funcionando
- `POST /verificar-credenciales`: Verifica si las credenciales son correctas
- `POST /extraer-datos`: Extrae datos de jugadores de fútbol 7

## Credenciales

- Usuario: CE4032
- Contraseña: 9525

## Integración con Supabase

Esta aplicación utiliza Supabase para almacenar los datos obtenidos mediante web scraping.
Los datos se almacenan en la tabla `jugadores` con la siguiente estructura:

- `id`: Identificador único del jugador (string)
- `nombre`: Nombre del jugador (string)
- `equipo`: Equipo al que pertenece (string)
- `categoria`: Categoría (Prebenjamín, Benjamín o Alevín) (string) 
- `goles`: Número de goles (number)
- `partidosJugados`: Número de partidos jugados (number)
- `fechaNacimiento`: Fecha de nacimiento (date)
- `lastUpdated`: Fecha de última actualización (timestamp)

Para configurar Supabase:

1. Crea una cuenta en Supabase (https://supabase.com)
2. Crea un nuevo proyecto
3. En SQL Editor, ejecuta el siguiente SQL para crear la tabla:

```sql
CREATE TABLE jugadores (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  equipo TEXT NOT NULL,
  categoria TEXT NOT NULL, 
  goles INTEGER DEFAULT 0,
  partidosJugados INTEGER DEFAULT 0,
  fechaNacimiento DATE,
  lastUpdated TIMESTAMP DEFAULT NOW()
);
```

4. Configura las variables de entorno en el frontend:
   - VITE_SUPABASE_URL: URL de tu proyecto Supabase
   - VITE_SUPABASE_ANON_KEY: Clave anónima de tu proyecto Supabase

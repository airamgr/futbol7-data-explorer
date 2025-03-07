
# Backend para la aplicación de Fútbol 7

Este backend se encarga de realizar scraping web de páginas de fútbol usando Python.

## Requisitos

- Python 3.7+
- pip (gestor de paquetes de Python)

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

# Sistema de Filiales en Django

Proyecto base en Django 5.1 LTS para gestionar filiales, integrantes, acciones, entradas, foro y dashboard.

## Estructura
- `config/`: configuración del proyecto.
- `apps/`: aplicaciones internas divididas por dominio.
- `core/`: utilidades compartidas.
- `frontend/`: carpeta para el build de React.
- `requirements/`: dependencias de Python.
- `docker/`: archivos para despliegue en contenedores.

## Configuración inicial
1. Crea un entorno virtual e instala dependencias:
   ```bash
   pip install -r requirements/requirements.txt
   ```
2. Define un archivo `.env` en la raíz con al menos:
   ```env
   SECRET_KEY=tu-clave-secreta
   DEBUG=True
   DATABASE_URL=sqlite:///db.sqlite3
   ALLOWED_HOSTS=localhost,127.0.0.1
   ```
3. Ejecuta migraciones y crea un superusuario:
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```
4. Ejecuta el servidor de desarrollo:
   ```bash
   python manage.py runserver
   ```

## Tests
Para ejecutar las pruebas básicas:
```bash
pytest
```

## Docker
Construcción y levantamiento del entorno con Docker Compose:
```bash
cd docker
docker compose up --build
```

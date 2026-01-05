# Sistema de Gestión de Filiales

Sistema full-stack construido con **Django 4 + Django REST Framework** (backend) y **React + Vite** (frontend) para administrar las filiales de Estudiantes de La Plata. Incluye autenticación JWT, control de accesos por rol, auditoría, webhooks, notificaciones por correo y un conjunto completo de endpoints REST documentados en Swagger.

## Requisitos

### Backend
- Docker 24+ (recomendado)
- Docker Compose 2+ (recomendado)
- Python 3.12+ (para desarrollo local)
- PostgreSQL 15+ (o SQLite para desarrollo)

### Frontend
- Node.js 18+ y npm/yarn/pnpm

## Variables de entorno

Cree un archivo `.env` a partir de `.env.example` y ajuste los valores según su entorno.

| Variable | Descripción |
| --- | --- |
| `DJANGO_SETTINGS_MODULE` | Módulo de settings de Django (por defecto `config.settings.development`). |
| `SECRET_KEY` | Clave secreta de Django. |
| `DEBUG` | Habilita modo debug (`true`/`false`). |
| `USE_SQLITE` | Forzar uso de SQLite en entornos locales/tests. |
| `DB_*` | Configuración de la base PostgreSQL. |
| `CORS_ALLOWED_ORIGINS` | Orígenes permitidos (coma separada). |
| `EMAIL_BACKEND`, `DEFAULT_FROM_EMAIL`, `EMAILS_ENABLED` | Configuración de envío de correos. |
| `WEBHOOKS_ENABLED`, `WEBHOOK_URL_AUDITORIA`, `WEBHOOK_URL_EVENTOS` | Webhooks para auditoría y eventos. |
| `PGADMIN_DEFAULT_*` | Credenciales para PgAdmin opcional. |

## Uso con Docker

```bash
make up          # levanta api + db + pgadmin
make migrate     # aplica migraciones
make superuser   # crea superusuario interactivo
make seed        # genera ~156 filiales y datos demo
make logs        # visualiza logs del servicio api
make down        # detiene y elimina contenedores
```

> El comando `make seed` crea usuarios demo:
>
> - `admin_global` (ADMINISTRADOR)
> - `coordinador_global` (COORDINADOR)
> - `admin_filial_1`, `user_filial_1`
> - `admin_filial_2`, `user_filial_2`
>
> Además genera catálogo de productos, partidos, pedidos, solicitudes y conversaciones.

## Entorno de desarrollo local

### Backend (sin Docker)

Si desea ejecutar el backend sin Docker utilice SQLite habilitando `USE_SQLITE=true` y ejecute:

```bash
pip install -r filiales_django/requirements/requirements.txt
export DJANGO_SETTINGS_MODULE=config.settings.development
python filiales_django/manage.py migrate
python filiales_django/manage.py runserver
```

### Frontend

Para ejecutar el frontend en modo desarrollo:

```bash
cd frontend
npm install
npm run dev
```

El frontend estará disponible en `http://localhost:5173` y se conectará automáticamente al backend en `http://localhost:8000`.

### Desarrollo completo (Backend + Frontend)

1. **Iniciar el backend** (en una terminal):
   ```bash
   make up          # Si usa Docker
   # O
   python filiales_django/manage.py runserver  # Si usa desarrollo local
   ```

2. **Iniciar el frontend** (en otra terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Acceder a la aplicación:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:8000`
   - Swagger UI: `http://localhost:8000/swagger/`
   - Admin Django: `http://localhost:8000/admin/`

## Tests y calidad

```bash
make lint        # ruff + black --check + isort --check
make fmt         # corrige estilo automáticamente
make test        # pytest con coverage (>=85 %)
```

La integración continua (GitHub Actions) ejecuta lint y tests en cada push/PR.

## Roles y permisos

| Rol | Alcance |
| --- | --- |
| `ADMINISTRADOR` | CRUD completo sobre todos los recursos y filiales. |
| `COORDINADOR` | Acceso global de solo lectura. |
| `USUARIO_FILIAL` | CRUD limitado a su filial. Los intentos sobre otras filiales son rechazados. |

El endpoint `GET /api/me` devuelve `{ user, role, filialId, permisos }` para que el frontend configure la UI.

## Endpoints principales

Todos los endpoints usan kebab-case y están paginados (50 items por página). Se admiten filtros por querystring (`?estado=...`, `?search=...`, `?ordering=...`).

| Recurso | Endpoint | Acciones destacadas |
| --- | --- | --- |
| Autenticación | `POST /api/auth/login` `POST /api/auth/refresh` | JWT SimpleJWT. |
| Filiales | `GET/POST /api/filiales/` | `POST /filiales/{id}/habilitar`, `POST /deshabilitar`, `POST /cambiar-autoridades`. |
| Autoridades | `CRUD /api/autoridades/` | Solo administradores. |
| Partidos | `CRUD /api/partidos/` | `POST /{id}/cerrar`, `POST /{id}/cancelar`. |
| Solicitudes de entradas | `CRUD /api/solicitudes-entrada/` | `POST /{id}/aprobar`, `POST /{id}/rechazar`. `GET /api/asignaciones-entrada/` sólo lectura. |
| Productos | `CRUD /api/productos/` | Filtros por `activo`, `categoria`, `sku`. |
| Pedidos | `CRUD /api/pedidos/` | `POST /{id}/aprobar`, `POST /{id}/rechazar`, `POST /{id}/marcar-entregado`. Items en `/api/pedido-items/`. |
| Conversaciones | `CRUD /api/conversaciones/` | Visibilidad `FILIAL` o `GLOBAL`. Mensajes en `/api/mensajes/`. `POST /mensajes/{id}/marcar-leido`. |
| Auditoría | `GET /api/auditoria/` | Export CSV en `GET /api/auditoria/exportar/`. |
| Perfil actual | `GET /api/me` | Datos del usuario autenticado. |

La documentación interactiva está disponible en **`/swagger/`** (UI) y **`/swagger.json`** (OpenAPI). Configurada con esquema de seguridad Bearer.

## Auditoría, webhooks y correos

Cada operación de CRUD y acción de negocio genera un registro en `auditoria.Accion` con payload, usuario, filial y metadatos de request. Si `WEBHOOKS_ENABLED=true` se envía un POST JSON a los webhooks configurados. Las notificaciones por correo se disparan para aprobación/rechazo de pedidos y solicitudes, cambios de autoridades y habilitación/deshabilitación de filiales.

## Salud y monitoreo

- `GET /health/` responde `ok` para los healthchecks del contenedor.
- Logging estructurado (formato verbose) en consola.

## Convenciones

- Código formateado con **black** e importaciones ordenadas con **isort**.
- Análisis estático con **ruff**.
- Tests escritos con **pytest + pytest-django** (`coverage` ≥ 85 %).
- Tiempo e idioma configurados en `America/Argentina/Buenos_Aires` y `es-AR`.

¡Listo! Levante los servicios con `make up`, cargue el seed y comience a operar el backend completo de filiales.

# Filiales - Plataforma de Gestión

Monorepo que aloja la primera versión del backend en Node.js/Express y el frontend en React/Tailwind para la gestión de las filiales del Club Estudiantes de La Plata.

## Estructura

```
filiales/
├── backend/     # API REST con Express, Prisma y PostgreSQL
└── frontend/    # SPA en React + Vite + Tailwind CSS
```

Cada paquete cuenta con su propio `package.json`, configuraciones de ESLint y archivos `.env.example`.

## Primeros pasos

1. **Instalar dependencias**

   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Configurar variables de entorno**

   Copiar los archivos `.env.example` de cada paquete y ajustar los valores necesarios.

   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. **Prisma**

   Generar el cliente y ejecutar las migraciones (requiere una base de datos PostgreSQL 14+ disponible).

   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev
   npm run prisma:seed
   ```

4. **Servidores de desarrollo**

   Backend:

   ```bash
   cd backend
   npm run dev
   ```

   Frontend:

   ```bash
   cd frontend
   npm run dev
   ```

## Características principales

- **Backend**
  - Autenticación con JWT y protección de rutas.
  - Gestión de filiales con filtros, paginación y métricas básicas.
  - Esquema de datos completo en Prisma basado en los requerimientos provistos.
  - Middlewares para validación (Zod), manejo de errores, autenticación y subida de archivos con Multer.
  - Semilla inicial con un usuario administrador.

- **Frontend**
  - Ruteo con React Router y manejo de estado remoto con TanStack Query.
  - Persistencia de sesión con Zustand.
  - Formularios validados con React Hook Form + Zod.
  - Componentes base reutilizables (tablas, botones, layouts, etc.).
  - Hooks listos para integrarse con las API del backend.

## Próximos pasos

- Completar los controladores pendientes (integrantes, acciones, foro, entradas) en el backend.
- Conectar los formularios y listados del frontend con los endpoints reales.
- Añadir tests automatizados y pipelines de CI.

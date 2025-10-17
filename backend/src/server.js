// backend/src/server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

// Importar rutas
import authRoutes from './routes/auth.routes.js';
import filialesRoutes from './routes/filiales.routes.js';
import integrantesRoutes from './routes/integrantes.routes.js';
import accionesRoutes from './routes/acciones.routes.js';
import entradasRoutes from './routes/entradas.routes.js';
import foroRoutes from './routes/foro.routes.js';
import notificacionesRoutes from './routes/notificaciones.routes.js';

// Importar middleware
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Configuración de __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// MIDDLEWARES GLOBALES
// ============================================

// CORS primero (antes de helmet)
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Helmet DESHABILITADO para swagger (solo en desarrollo)
if (process.env.NODE_ENV !== 'development') {
  app.use(helmet());
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Servir archivos estáticos (uploads)
const uploadsPath = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// ============================================
// DOCUMENTACIÓN SWAGGER
// ============================================

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Filiales EDLP'
}));

// ============================================
// RUTAS
// ============================================

// Root
app.get('/', (_req, res) => {
  res.json({
    message: 'API Filiales EDLP',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health',
    api: '/api'
  });
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

// API Info
app.get('/api', (_req, res) => {
  res.json({
    message: 'API Filiales EDLP',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      filiales: '/api/filiales',
      integrantes: '/api/integrantes',
      acciones: '/api/acciones',
      entradas: '/api/entradas',
      foro: '/api/foro',
      notificaciones: '/api/notificaciones'
    },
    documentation: '/api-docs'
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/filiales', filialesRoutes);
app.use('/api/integrantes', integrantesRoutes);
app.use('/api/acciones', accionesRoutes);
app.use('/api/entradas', entradasRoutes);
app.use('/api/foro', foroRoutes);
app.use('/api/notificaciones', notificacionesRoutes);

// ============================================
// MANEJO DE ERRORES
// ============================================

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method
  });
});

// Error handler global
app.use(errorHandler);

// ============================================
// INICIAR SERVIDOR
// ============================================

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log('\n🚀 ===================================');
  console.log(`   Servidor corriendo en puerto ${PORT}`);
  console.log(`   Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   URL: http://localhost:${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api`);
  console.log(`   📚 Docs: http://localhost:${PORT}/api-docs`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log('===================================== 🚀\n');
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM recibido, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

export default app;

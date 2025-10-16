import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes.js';
import filialesRoutes from './routes/filiales.routes.js';
import integrantesRoutes from './routes/integrantes.routes.js';
import accionesRoutes from './routes/acciones.routes.js';
import entradasRoutes from './routes/entradas.routes.js';
import foroRoutes from './routes/foro.routes.js';
import notificacionesRoutes from './routes/notificaciones.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const uploadsPath = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/filiales', filialesRoutes);
app.use('/api/integrantes', integrantesRoutes);
app.use('/api/acciones', accionesRoutes);
app.use('/api/entradas', entradasRoutes);
app.use('/api/foro', foroRoutes);
app.use('/api/notificaciones', notificacionesRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

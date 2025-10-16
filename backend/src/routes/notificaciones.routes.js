import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { listNotificaciones } from '../controllers/notificaciones.controller.js';

const router = Router();

router.get('/', authenticate, listNotificaciones);

export default router;
